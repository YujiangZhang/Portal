import fs from "fs";
import { resolve } from "path";
/**
 * 创建文件夹
 * @param root
 * @param others
 * @returns 文件夹路径
 */
export function createFolder(root: string, others: string[]) {
  const folder = resolve(process.cwd(), root, ...others);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
  return folder;
}

/**
 * 文件夹路径中的文件夹名称替换，最好使用 position 确保层级正确
 * @param path
 * @param oldName
 * @param newName
 * @param position
 * @returns
 */
export function replaceFolderName(
  path: string,
  oldName: string,
  newName: string,
  position: number = -1,
  list: false
) {
  const paths = path.split("/");
  if (position < 0) {
    const index = paths.indexOf(oldName);
    if (index === -1) {
      throw new Error("未找到文件夹");
    }
    paths.splice(index, 1, newName);
  } else {
    const val = paths[position];
    if (val !== oldName) {
      throw new Error("文件夹名称不匹配");
    }
    paths[position] = newName;
  }

  return list ? paths : paths.join("/");
}

// 获得路径层级名
export function getFolderFromPath(path: string, position: number) {
  const paths = path.split("/");
  return paths[position];
}

// 对象列表根据 parentID 得到树形结构，增加到 children 字段
export function tree(
  list: {
    parentID: number;
    [key: string]: any;
  }[]
) {
  const map = new Map<number, any>();
  const roots: any[] = [];

  list.forEach((item) => {
    map.set(item.id, item);
  });

  list.forEach((item) => {
    const parent = map.get(item.parentID);
    if (parent) {
      if (!parent.children) {
        parent.children = [];
      }
      parent.children.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}
