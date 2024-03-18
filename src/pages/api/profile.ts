import { NextApiRequest, NextApiResponse } from "next";
import { requestApi } from "@/api/lib/requests";
import { getProfile, updateProfile } from "@/api/profile";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getProfile,
    put: updateProfile,
  });
}
