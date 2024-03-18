import { NextApiRequest, NextApiResponse } from "next";
import { createFile, deleteFile, getFile, updateFile } from "@/api/file";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getFile,
    post: createFile,
    put: updateFile,
    delete: deleteFile,
  });
}
