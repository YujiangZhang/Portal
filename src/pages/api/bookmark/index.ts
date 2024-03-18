import { NextApiRequest, NextApiResponse } from "next";
import {
  createBookmark,
  deleteBookmark,
  getBookmark,
  updateBookmark,
} from "@/api/bookmark";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getBookmark,
    post: createBookmark,
    put: updateBookmark,
    delete: deleteBookmark,
  });
}
