import _, { get } from "lodash";
import db from "@/db/lowdb";
import { Params } from "./lib/requests";
import { BookmarkType } from "@/db/types";
import {
  dbCreate,
  dbDelete,
  dbGet,
  dbUpdate,
  dbBatchUpdate,
} from "./lib/db-utils";
import { defaultBookmark as DefaultBookmark } from "@/db/defaultData";

const defaultBookmark = DefaultBookmark();

export function getBookmark(params: Partial<Params>) {
  return dbGet(db, "bookmarks", params);
}

export function createBookmark(data: Partial<BookmarkType>) {
  const res = getBookmark({
    orderBy: "order",
    filters: { parentID: data.parentID },
  }) as Record<"data", BookmarkType[]>;
  const bookmarks = res.data || [];
  let maxOrder = _.maxBy(bookmarks, "order")?.order;
  maxOrder = maxOrder ? maxOrder + 1 : 0;
  data.order = maxOrder;
  console.log("createBookmark", data);
  return dbCreate(db, "bookmarks", data, defaultBookmark);
}

export function updateBookmark(data: Partial<BookmarkType>) {
  return dbUpdate(db, "bookmarks", data);
}

export function deleteBookmark(id: number) {
  return dbDelete(db, "bookmarks", id);
}

// 批量

export function batchUpdateBookmark(datas: Partial<BookmarkType>[]) {
  return dbBatchUpdate(db, "bookmarks", datas, defaultBookmark);
}

// ==========================================
// 需求函数
// ==========================================

// 移动
// 考虑了测试数据的 order 是随机的，但在 id 前的数据 order 没有考虑改变
// 所以可以直接将靠后的数据移动到顶部即可将随机改为有序
export function updateMoveBookmark(data: Record<"id" | "from" | "to", number>) {
  const { id, from, to } = data;

  const bookmark = db.chain.get("bookmarks").find({ id }).value();

  const res = getBookmark({
    orderBy: "order",
    filters: {
      parentID: bookmark.parentID,
    },
  }) as Record<"data", BookmarkType[]>;

  const bookmarks = res.data!;

  let needUpdate;
  if (from < to) {
    needUpdate = _.slice(
      bookmarks as unknown as BookmarkType[],
      from + 1,
      to + 1
    );
    bookmark.order = needUpdate[needUpdate.length - 1].order;
  } else {
    needUpdate = _.slice(bookmarks as unknown as BookmarkType[], to, from);
    bookmark.order = needUpdate[0].order;
  }

  let initOrder = _.min([from, to])! + bookmark.order!;
  needUpdate.forEach((b: BookmarkType, index) => {
    b.order! = initOrder + index;
    updateBookmark(b);
  });

  console.log("needUpdate", needUpdate);

  return updateBookmark(bookmark);
}
