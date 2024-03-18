import _ from "lodash";
import db from "@/db/lowdb";
import { PostType } from "@/db/types";
import { Params } from "./lib/requests";
import { dbCreate, dbDelete, dbGet, dbUpdate } from "./lib/db-utils";
import { defaultPost as DefaultPost } from "@/db/defaultData";

const defaultPost = DefaultPost();

export function getPost(params: Partial<Params>) {
  return dbGet(db, "posts", params);
}

export function createPost(data: Partial<PostType>) {
  return dbCreate(db, "posts", data, defaultPost);
}

export function updatePost(data: Partial<PostType>) {
  return dbUpdate(db, "posts", data);
}

export function deletePost(id: number) {
  return dbDelete(db, "posts", id);
}


