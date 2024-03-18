import _ from "lodash";
import db from "@/db/lowdb";
import { TagType } from "@/db/types";
import { Params } from "./lib/requests";
import { dbCreate, dbDelete, dbGet, dbUpdate } from "./lib/db-utils";
import { defaultTag as DefaultTag } from "@/db/defaultData";

const defaultTag = DefaultTag();

export function getTag(params: Partial<Params>) {
  return dbGet(db, "tags", params);
}

export function createTag(data: Partial<TagType>) {
  return dbCreate(db, "tags", data, defaultTag);
}

export function updateTag(data: Partial<TagType>) {
  return dbUpdate(db, "tags", data);
}

export function deleteTag(id: number) {
  return dbDelete(db, "tags", id);
}
