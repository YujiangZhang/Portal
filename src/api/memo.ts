import _ from "lodash";
import db from "@/db/lowdb";
import { MemoType } from "@/db/types";
import { Params } from "./lib/requests";
import { dbCreate, dbDelete, dbGet, dbUpdate } from "./lib/db-utils";
import { defaultMemo as DefaultMemo } from "@/db/defaultData";

const defaultMemo = DefaultMemo();

export function getMemo(params: Partial<Params>) {
  return dbGet(db, "memos", params);
}

export function createMemo(data: Partial<MemoType>) {
  return dbCreate(db, "memos", data, defaultMemo);
}

export function updateMemo(data: Partial<MemoType>) {
  return dbUpdate(db, "memos", data, defaultMemo);
}

export function deleteMemo(id: number) {
  return dbDelete(db, "memos", id);
}

// 获取备忘列表，大于今天 0 点
export function getHomeMemos(params: Partial<Params>) {
  let { offset = 0, limit = 10, orderBy = "datetime" } = params;

  const order = orderBy.startsWith("-") ? "desc" : "asc";
  if (orderBy.startsWith("-")) {
    orderBy = orderBy.slice(1);
  }

  // 0 点
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTime = today.getTime();

  const memos = db.chain
    .get("memos")
    .filter((memo: MemoType) => memo.datetime > todayTime)
    .orderBy(orderBy, order)
    .value();

  return {
    data: memos.slice(offset, offset + limit),
    total: memos.length,
    message: "获取备忘列表成功",
  };
}
