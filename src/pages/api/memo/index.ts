import { NextApiRequest, NextApiResponse } from "next";
import { createMemo, deleteMemo, getMemo, updateMemo } from "@/api/memo";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getMemo,
    post: createMemo,
    put: updateMemo,
    delete: deleteMemo,
  });
}
