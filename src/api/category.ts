import _ from "lodash";
import db from "@/db/lowdb";
import { Params } from "./lib/requests";
import { CategoryType } from "@/db/types";
import { dbCreate, dbDelete, dbGet, dbUpdate } from "./lib/db-utils";
import { defaultCategory as DefaultCategory } from "@/db/defaultData";

const defaultCategory = DefaultCategory();

export function getCategory(params: Partial<Params>) {
  return dbGet(db, "categories", params);
}

export function createCategory(data: Partial<CategoryType>) {
  return dbCreate(db, "categories", data, defaultCategory);
}

export function updateCategory(data: Partial<CategoryType>) {
  return dbUpdate(db, "categories", data);
}

export function deleteCategory(id: number) {
  return dbDelete(db, "categories", id);
}
