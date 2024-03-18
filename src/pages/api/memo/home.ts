import { NextApiRequest, NextApiResponse } from "next";
import { getHomeMemos } from "@/api/memo";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getHomeMemos,
  });
}
