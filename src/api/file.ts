import _ from "lodash";
import fs from "fs";
import db from "@/db/lowdb";
import { FileType } from "@/db/types";
import { Params } from "./lib/requests";
import { NextApiRequest, NextApiResponse } from "next";
import {
  dbBatchCreate,
  dbCreate,
  dbDelete,
  dbGet,
  dbUpdate,
} from "./lib/db-utils";
import { IncomingForm, File } from "formidable";
import { createFolder } from "./lib/utils";
import { defaultFile as DefaultFile } from "@/db/defaultData";
import { resolve } from "path";

type CustomFileType = Omit<FileType, "id" | "created_at" | "updated_at">;

const defaultFile = DefaultFile();

export function getFile(params: Partial<Params>) {
  return dbGet(db, "files", params);
}

export async function createFile(data: Partial<FileType>) {
  return dbCreate(db, "files", data, defaultFile);
}

export async function updateFile(data: Partial<FileType>) {
  return dbUpdate(db, "files", data);
}

export function deleteFile(id: number) {
  return dbDelete(db, "files", id);
}

// ===================================
// 上传文件的 API
// - 暂时不做函数提取
// ===================================

const allowedFileTypes = ["file", "image", "video", "audio", "post"];

type AllowedFileType = (typeof allowedFileTypes)[number] | "string";

interface UploadFilRes {
  error?: any;
  files?: CustomFileType[];
}

const SAVEFOLDER = "uploads";
const READFOLDER = "static";

const getReadFilePath = (...paths: string[]) =>
  `/${["api", READFOLDER, ...paths].join("/")}`;
const getSaveFolder = (...folders: string[]) =>
  createFolder(SAVEFOLDER, folders);

/**
 * 上传文件的 API
 * @param req
 * @param res
 * @param folder 保存到文件夹，默认为 file
 */
export async function uploadFileApi(
  req: NextApiRequest,
  res: NextApiResponse,
  folder: AllowedFileType = "file"
) {
  if (!allowedFileTypes.includes(folder)) {
    res.status(400).json({ error: "文件夹类型不被允许" });
  }

  const form = new IncomingForm({
    uploadDir: getSaveFolder(folder),
    keepExtensions: true,
  });

  try {
    form.parse(req, (err, fields, files) => {
      if (err) {
        res.status(500).send("Internal Server Error");
      }

      const fileInfos = files.file?.map((file: File) => {
        const { newFilename, originalFilename, mimetype, size } = file;

        return {
          name: newFilename,
          originalFilename,
          path: getReadFilePath(folder, newFilename),
          size,
          mimetype,
        } as CustomFileType;
      });

      if (!fileInfos) {
        throw new Error("文件上传失败");
      }

      const ids = dbBatchCreate(db, "files", fileInfos, defaultFile);

      if (fileInfos.length !== ids.length) {
        res.status(500).json({ error: "文件在存入数据库时失败" });
      }

      if (fileInfos.length === 1) {
        res.status(201).json({ path: fileInfos[0].path, message: "success" });
      } else {
        res
          .status(201)
          .json({ paths: fileInfos.map((el) => el.path), message: "success" });
      }
    });
  } catch (error) {
    res.status(500).json({ error: error });
  }
}

/**
 * 读取文件的 API
 * @param req
 * @param res
 * @param paths
 */
export async function ReadFileApi(
  req: NextApiRequest,
  res: NextApiResponse,
  paths: string[] = []
) {
  try {
    const path = getReadFilePath(...paths); // 请求路径

    const file = db.data.files.find((file) => file.path === path);

    if (!file) {
      res.status(404).json({ error: "文件不存在" });
    }

    const fileName = paths[paths.length - 1];
    const fileFolder = `${getSaveFolder(...paths.slice(0, -1))}`;
    const filePath = resolve(fileFolder, fileName); // 存储路径
    console.log("read 文件路径", filePath);

    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (e) {
    res.status(500).json({ error: e });
  }
}
