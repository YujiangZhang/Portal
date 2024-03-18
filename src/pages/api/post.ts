import { NextApiRequest, NextApiResponse } from "next";
import { createPost, deletePost, getPost, updatePost } from "@/api/post";
import { requestApi } from "@/api/lib/requests";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return requestApi(req, res, {
    get: getPost,
    post: createPost,
    put: updatePost,
    delete: deletePost,
  });
}
