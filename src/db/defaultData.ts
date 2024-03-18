import { testData } from "./testData";
import {
  BookmarkType,
  CategoryType,
  MemoType,
  PostType,
  ProfileType,
  TableType,
  TagType,
  FileType,
  SettingsType,
  DataType,
} from "./types";
import config from "../../config";

export type D<T extends TableType> = Omit<
  T,
  "id" | "created_at" | "updated_at"
>;

export function defaultSettings(): SettingsType {
  return {
    background: {
      useBackgroundImage: false, // 是否使用背景图片
      backgroundImageUrl: "", // 背景图片地址
      backgroundColor: "#f5f5f5", // 背景颜色
    },

    text: {
      textColor: "#333", // 文字颜色
      linkColor: "#1890ff", // 链接颜色
      lineHeight: 1.5, // 行高
      fontSize: 16, // 字体大小
    },

    color: {
      primaryColor: "#1890ff", // 主要色
      secondaryColor: "#f0f2f5", // 次要色
      accentColor: "#1890ff", // 点缀色
    },
  } as SettingsType;
}

export function defaultProfile(): ProfileType {
  return {
    name: "张玉江",
    email: "lingyou.ly@outlook.com",
    avatar: "/assets/images/avatar.png",
    bio: "默认简介~",
    website: "https://www.zhangyujiang.com",
    socials: [
      {
        name: "github",
        url: "https://www.zhangyujiang.com",
        icon: "/assets/images/avatar.png",
      },
    ],
  };
}

export function defaultBookmark(): D<BookmarkType> {
  return {
    name: "默认标题",
    url: "#",
    parentID: 0,
    order: 0,
    folder: false,
    describe: "默认描述~",
  };
}

export function defaultMemo(): D<MemoType> {
  return {
    title: "默认标题",
    content: "默认内容",
    datetime: Date.now(),
    category: "",
  };
}

export function defaultPost(): D<PostType> {
  return {
    title: "默认标题",
    brief: "默认简介",
    path: "",
    cover: "/assets/images/bg.jpg",
    category: null,
    tags: [],
  };
}

export function defaultTag(): D<TagType> {
  return {
    name: "默认标签",
    belong: "",
  };
}

export function defaultCategory(): D<CategoryType> {
  return {
    name: "默认分类",
    belong: "",
    order: 0,
    color: "cyan",
  };
}

export function defaultFile(): D<FileType> {
  return {
    name: "默认文件",
    originalFilename: "默认文件名",
    path: "",
    size: 0,
    mimetype: "",
    belong: null,
  };
}

export function defaultData(): DataType {
  const dbType = config.dbType;
  return dbType === "production"
    ? {
        profile: defaultProfile(),
        settings: defaultSettings(),
        bookmarks: [],
        memos: [],
        posts: [],
        tags: [],
        categories: [],
        files: [],
      }
    : testData();
}
