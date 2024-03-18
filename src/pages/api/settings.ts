import { NextApiRequest, NextApiResponse } from "next";
import { requestApi } from "@/api/lib/requests";
import { getSettings, updateSettings } from "@/api/settings";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getSettings,
    put: updateSettings,
  });
}
