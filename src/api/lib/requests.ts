import _ from "lodash";
import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";

export interface Params {
  id?: number;
  offset: number;
  limit: number;
  orderBy: string;
  filters: Record<string, any>;
}

const request = axios.create({
  baseURL: "http://localhost:3000",
  timeout: 1000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default request;

export function parseParams(
  params: Record<string, any> = {},
  d = {
    offset: 0,
    limit: 10,
    orderBy: "id",
    filters: {},
  }
): Params {
  params.filters = {};
  for (const key in params) {
    if (key.startsWith("filters[")) {
      const newKey = key.replace("filters[", "").replace("]", "");
      let val = params[key];
      val =
        val === "true"
          ? true
          : val === "false"
          ? false
          : isNaN(val)
          ? val
          : Number(val);
      params.filters[newKey] = val;
      delete params[key];
    }
  }

  params = { ...d, ...params };
  const { id, offset, limit, orderBy, filters } = params;

  const p = {
    offset: _.toNumber(offset),
    limit: _.toNumber(limit),
    orderBy: String(orderBy),
    filters: _.isObject(filters) ? filters : {},
  };

  return id ? { id: _.toNumber(id), ...p } : p;
}

export function requestApi(
  req: NextApiRequest,
  res: NextApiResponse,
  func: Partial<
    Record<"get" | "post" | "put" | "delete", (...rest: any[]) => any>
  >
) {
  try {
    const allowedMethods = Object.keys(func);
    const method = (req.method as string).toLowerCase();

    if (!allowedMethods.includes(method)) {
      return res.status(405).json({ message: "请求方法不被允许" });
    }

    switch (method) {
      case "get":
        const gData =
          func.get &&
          func.get(parseParams(req.query as Record<string, string>));

        if (!gData) {
          return res.status(404).json({ message: "数据不存在" });
        } else if ("data" in gData) {
          return res.status(200).json({
            data: gData.data,
            total: gData.total,
            message: "success",
          });
        } else {
          return res.status(200).json({ data: gData, message: "success" });
        }

      case "post":
        return res.status(201).json({
          data: func.post && func.post(req.body),
          message: "success",
        });
      case "put":
        const pData = func.put && func.put(req.body);

        return !!pData
          ? res.status(201).json({ data: pData, message: "success" })
          : res.status(404).json({ message: "not found" });
      case "delete":
        const id = func.delete && func.delete(_.toNumber(req.query.id));
        return !!id
          ? res.status(201).json({
              data: id,
              message: "success",
            })
          : res.status(404).json({ message: "not found" });
      default:
        return res.status(404).json({ message: "请求方法错误" });
    }
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
}
