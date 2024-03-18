import { uploadFileApi } from "@/api/file";
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
  const { folder } = req.query;
  switch (req.method) {
    case "POST":
      return await uploadFileApi(req, res, folder as string);
    default:
      return res.status(405).json({ error: "不支持的请求方式" });
  }
}
