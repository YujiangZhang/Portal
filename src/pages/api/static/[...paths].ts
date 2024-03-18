import { ReadFileApi, uploadFileApi } from "@/api/file";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { paths } = req.query;
  switch (req.method) {
    case "GET":
      return await ReadFileApi(req, res, paths as string[]);
    default:
      return res.status(405).json({ error: "不支持的请求方式" });
  }
}
