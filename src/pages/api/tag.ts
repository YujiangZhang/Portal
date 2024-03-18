import { NextApiRequest, NextApiResponse } from "next";
import { createTag, deleteTag, getTag, updateTag } from "@/api/tag";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getTag,
    post: createTag,
    put: updateTag,
    delete: deleteTag,
  });
}
