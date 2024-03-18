// ====================
// 限制的类型在其下，其他文件谨慎使用
// ====================

export type D<T extends TableType> = Omit<
  T,
  "id" | "created_at" | "updated_at"
>;

// ====================

export interface BaseTableType {
  id: number;
  created_at: number;
  updated_at: number;
}

export interface TagType extends BaseTableType {
  name: string;
  belong: string;
}

export interface CategoryType extends BaseTableType {
  name: string;
  belong: "" | "post" | "memo";
  color?: string;
  order: number;
}

export interface PostType extends BaseTableType {
  title: string;
  brief: string;
  path: string; // 上传后的文件路径
  cover?: string;
  category?: string | null; // CategoryType
  tags?: string[];
}

export interface BookmarkType extends BaseTableType {
  name: string;
  url?: string;
  parentID?: number;
  order: number;
  folder?: boolean;
  describe?: string;
}

export interface MemoType extends BaseTableType {
  title: string;
  content: string;
  datetime: number;
  category?: string; // CategoryType
}

export interface FileType extends BaseTableType {
  name: string;
  originalFilename: string;
  path: string;
  size: number;
  mimetype: string;
  belong: "profile" | "post" | "bookmark" | "memo" | null; // TODO: 如果是 null ，应当删除文件，需要增加删除文件功能
}

// profile
export interface ProfileType {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  website: string;
  socials: {
    name: string;
    url: string;
    icon: string;
  }[];
}

// setting
export interface SettingsType {
  background: {
    useBackgroundImage: boolean; // 是否使用背景图片
    backgroundImageUrl: string; // 背景图片地址
    backgroundColor: string; // 背景颜色 r,g,b
  };

  text: {
    textColor: string; // hex
    linkColor: string; // hex
    fontSize: number; // 字体大小 px
    lineHeight: number; // 行高, rem
  };

  color: {
    primaryColor: string; // 主要颜色
    secondaryColor: string; // 次要颜色
    accentColor: string; // 点缀颜色
  };
}

// ====================

export type TableTypes = {
  tags: TagType;
  categories: CategoryType;
  posts: PostType;
  bookmarks: BookmarkType;
  memos: MemoType;
  files: FileType;
};

export type SingleTableTypes = {
  profile: ProfileType;
  settings: SettingsType;
};

export type DataType = {
  [K in keyof SingleTableTypes]: SingleTableTypes[K];
} & {
  [K in keyof TableTypes]: TableTypes[K][];
};

export type TableType =
  | PostType
  | BookmarkType
  | MemoType
  | TagType
  | CategoryType
  | FileType;
export type SingleType = ProfileType;

export type TableTypeWithKey<K extends keyof TableTypes> = TableTypes[K];
export type SingleTypeWithKey<K extends keyof SingleTableTypes> =
  SingleTableTypes[K];
