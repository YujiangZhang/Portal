import { NextApiRequest, NextApiResponse } from "next";
import { createCategory, deleteCategory, getCategory, updateCategory } from "@/api/category";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getCategory,
    post: createCategory,
    put: updateCategory,
    delete: deleteCategory,
  });
}
