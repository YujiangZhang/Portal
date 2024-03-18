import { NextApiRequest, NextApiResponse } from "next";
import {
  updateMoveBookmark,
} from "@/api/bookmark";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    put: updateMoveBookmark,
  });
}
