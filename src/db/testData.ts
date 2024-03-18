import {
  BookmarkType,
  CategoryType,
  MemoType,
  PostType,
  ProfileType,
  TagType,
  DataType,
  SettingsType,
} from "./types";

import config from "@/../config";

const initID = config.dbStartID;

const testBaseData = (i: number) => ({
  id: 1000000 + i,
  created_at: Date.now() + i * 1000,
  updated_at: Date.now() + i * 1000,
});

export function testSettings(): SettingsType {
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
  };
}

export function testProfile(): ProfileType {
  return {
    name: "test",
    avatar: "/assets/images/avatar.jpg",
    email: "lingyou.ly@outlook.com",
    bio: "test bio",
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

export function testMemos(): MemoType[] {
  const memos = [];
  for (let i = 0; i < 100; i++) {
    memos.push({
      title: `test${i}`,
      content: `test content${i}`,
      datetime: Date.now() + i * 1000,
      category: `默认分类${i}`,
      ...testBaseData(i),
    });
  }

  return memos;
}

export function testBookmarks(): BookmarkType[] {
  const bookmarks = [];
  for (let i = 1; i < 200; i++) {
    bookmarks.push({
      name: `test${i}`,
      url: "https://www.zhangyujiang.com",
      parentID: i > 3 ? Math.floor(i / 10) + initID : 0,
      order: i,
      describe: `默认描述 describe${i}`,
      folder: Math.random() > 0.5,
      ...testBaseData(i),
    });
  }

  return bookmarks;
}

export function testPosts(): PostType[] {
  const posts = [];
  for (let i = 0; i < 10; i++) {
    posts.push({
      title: `test${i}`,
      brief: `test brief${i}`,
      path: "",
      cover: "/assets/images/bg.jpg",
      category: null,
      tags: [],
      ...testBaseData(i),
    });
  }

  return posts;
}

export function testTags(): TagType[] {
  const tags = [];
  for (let i = 0; i < 10; i++) {
    tags.push({
      name: `test${i}`,
      belong: "",
      ...testBaseData(i),
    });
  }

  return tags;
}

export function testCategories(): CategoryType[] {
  const categories = [];
  for (let i = 0; i < 6; i++) {
    categories.push({
      name: `category${i}`,
      belong: ["post", "memo"][i % 2],
      order: i,
      ...testBaseData(i),
    });
  }

  return categories as CategoryType[];
}

export function testData(): DataType {
  return {
    settings: testSettings(),
    profile: testProfile(),
    bookmarks: testBookmarks(),
    memos: testMemos(),
    posts: testPosts(),
    tags: testTags(),
    categories: testCategories(),
    files: [],
  };
}
