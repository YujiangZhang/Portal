import searchEngines from "./data/searchEngine.json";
import bookmarks from "./data/bookmark.json";
import memos from "./data/memos.json";
import posts from "./data/posts.json";
import dayjs from "dayjs";

export interface BookMark {
  name: string;
  url: string;
  icon?: string;
}

export interface BookMarkGroup {
  name: string;
  type?: "fold" | "unfold";
  bookmarks: BookMark[];
  children?: BookMarkGroup[];
}

export interface SearchEngine {
  name: string;
  label: string;
  url: string;
}

export interface SearchEngineGroup {
  name: string;
  label: string;
  searchEngines: SearchEngine[];
}

export interface MemoItem {
  title: string;
  content: string;
  datetime: string;
}

export interface MemoGroup {
  name: string;
  memos: MemoItem[];
}

export interface Post {
  id: number;
  title: string;
  brief: string;
  cover?: string;
  content?: string;
  category?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

const data: {
  bookmarkGroups: BookMarkGroup[];
  searchEngineGroups: SearchEngineGroup[];
  memoGroups: MemoGroup[];
} = {
  bookmarkGroups: bookmarks as BookMarkGroup[],
  searchEngineGroups: searchEngines as SearchEngineGroup[],
  memoGroups: memos as MemoGroup[],
};

export function getBookMarkGroups() {
  return data.bookmarkGroups;
}

export function getSearchEngineGroups() {
  return data.searchEngineGroups;
}

export function getMemoGroups() {
  return data.memoGroups;
}

/**
 *最近 days 天内的 memo
 * @param days
 * @returns 每个 group 下的 memos 按时间顺序排序
 */
export function getLatestMemos(days: number = 3) {
  const now = dayjs();
  const today = now.startOf("day");
  return data.memoGroups.map((group) => {
    const memos = group.memos.filter((memo) => {
      return (
        now.diff(memo.datetime, "day") <= days && today.isBefore(memo.datetime)
      );
    });

    memos.sort((a, b) => dayjs(a.datetime).diff(b.datetime, "minute"));

    return {
      name: group.name,
      memos: memos,
    };
  });
}

export function getPosts(limit: number = 5): Post[] {
  return limit ? posts.slice(0, limit) : posts;
}
