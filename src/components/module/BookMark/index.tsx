"use client";
import { BookmarkType } from "@/db/types";
import { request, RequestGetList } from "@/utils";
import { Badge, Divider, Flex, Space, Spin, Tag, App, Modal } from "antd";
import { useEffect, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import _ from "lodash";
import { useRouter } from "next/navigation";

interface BookmarkGroup extends BookmarkType {
  bookmarks: BookmarkType[]; // 书签
  children: BookmarkGroup[]; // 书签，但是是文件夹，即 folder = true
}

interface BookmarkDrawerGoup extends BookmarkGroup {
  loading?: boolean;
}

const defaultBookmarkGroup: BookmarkGroup = {
  id: 0,
  name: "默认",
  folder: true,
  parentID: 0,
  order: 0,
  bookmarks: [],
  children: [],
  created_at: 0,
  updated_at: 0,
};

/**
 * 获得书签，已排序：order
 * @param parentId
 * @param func
 * @param errorFunc
 * @returns
 */
const getBookmarks = async (
  parentId: number,
  func?: (res: RequestGetList<BookmarkType>) => void,
  errorFunc?: (error: any) => void
): Promise<RequestGetList<BookmarkType>> => {
  const res = (await request.get("/bookmark", {
    params: {
      filters: { parentID: parentId },
      orderBy: "order",
      offset: 0,
      limit: 1000,
    },
  })) as unknown as RequestGetList<BookmarkType>;

  if (func && res.data) {
    func(res);
  } else if (errorFunc) {
    errorFunc(res);
  }

  return res;
};

export default function Bookmark() {
  const [loading, setLoading] = useState<boolean | "init">("init");

  const [rootBookmarks, setRootBookmarks] = useState<BookmarkType[]>([]);
  const [rootGroups, setRootGroups] = useState<BookmarkType[]>([]); // 书签 folder = true

  const [currentGroup, setCurrentGroup] =
    useState<BookmarkGroup>(defaultBookmarkGroup);
  const [openGroup, setOpenGroup] = useState<boolean>(false);

  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    setLoading("init");
    getBookmarks(0).then((res) => {
      const groups = [] as BookmarkType[];
      const bookmarks = [] as BookmarkType[];
      res.data.forEach((item) => {
        if (item.folder) {
          groups.push(item);
        } else {
          bookmarks.push(item);
        }
      });

      setRootGroups(groups);
      setRootBookmarks(bookmarks);
      setLoading(false);
    });
  }, []);

  const handleGroupClick = (group: BookmarkGroup) => {
    setCurrentGroup(group);
    setOpenGroup(true);
  };

  const handleCloseGroup = () => {
    setCurrentGroup(defaultBookmarkGroup);
    setOpenGroup(false);
  };

  return (
    <>
      <BookmarkDrawer
        group={currentGroup}
        open={openGroup}
        onClose={handleCloseGroup}
      />
      <Spin spinning={loading === "init"} indicator={<LoadingOutlined spin />}>
        <BookMarkUnfold bookmarks={rootBookmarks} divider />
        <Flex justify="center" wrap="wrap" gap="small">
          {rootGroups.map((group, index) => {
            return (
              <BookMarkFold
                bookmark={group}
                key={group.id}
                onClick={() => {
                  handleGroupClick(group as BookmarkGroup);
                }}
              />
            );
          })}
        </Flex>
      </Spin>
    </>
  );
}

function BookmarkDrawer({
  group,
  open,
  onClose,
}: {
  group: BookmarkGroup;
  open: boolean;
  onClose: () => void;
}) {
  const [bookmarks, setBookmarks] = useState<BookmarkType[]>([]);
  const [groups, setGroups] = useState<BookmarkDrawerGoup[]>([]);
  const groupsMap = useRef(
    new Map<number, BookmarkDrawerGoup>(groups.map((g) => [g.id, g]))
  );

  const handleLoadGroup = async (group: BookmarkType) => {
    let mapG = groupsMap.current.get(group.id);

    if (!mapG) {
      mapG = {
        ...group,
        loading: true,
        bookmarks: [],
        children: [],
      };
    }

    const res = await getBookmarks(group.id);

    const books = res.data || [];
    let curG = {
      ...mapG,
      loading: false,
      bookmarks: books,
    };

    groupsMap.current.set(group.id, curG);

    let gs = [] as BookmarkDrawerGoup[];
    groupsMap.current.forEach((g) => {
      if (g.id === group.id) {
        gs.push(curG);
      } else {
        gs.push(g);
      }
    });

    gs = gs.sort((a, b) => a.order - b.order);

    setGroups(gs);
  };

  const handleInit = async () => {
    const res = await getBookmarks(group.id);
    const _groups = [] as BookmarkDrawerGoup[];
    const _bookmarks = [] as BookmarkType[];
    let i = 0;

    const _map = new Map<number, BookmarkDrawerGoup>();
    res.data.forEach((item) => {
      if (item.folder) {
        _groups.push({
          ...item,
          bookmarks: [],
          children: [],
          loading: true,
        });

        _map.set(item.id, {
          ...item,
          index: i,
          loading: true,
          children: [],
          bookmarks: [],
        } as BookmarkDrawerGoup);

        i++;
      } else {
        _bookmarks.push(item);
      }
    });

    groupsMap.current = _map;
    setGroups(_groups);
    setBookmarks(_bookmarks);

    // 文件夹组再次请求
    // Promise.all(groups.map((g) => handleLoadGroup(g)));
    await _groups.reduce(async (prev, g) => {
      await prev;
      return handleLoadGroup(g);
    }, Promise.resolve()); // 顺序请求，避免 state 更新问题
  };

  useEffect(() => {
    if (!open) return;
    handleInit();
    // eslint-disable-next-line
  }, [group]);

  const handleClose = () => {
    onClose();
  };

  return (
    <Modal
      title={group.name}
      open={open}
      onCancel={handleClose}
      footer={
        <>
          <br />
          <Flex justify="space-between">
            <p className="color-60 fontsize-80">{group.describe}</p>
          </Flex>
        </>
      }
    >
      <br />
      <Space direction="vertical">
        {!_.isEmpty(bookmarks) && (
          <BookMarkUnfold bookmarks={bookmarks} width="100%" />
        )}

        {groups.map((group, index) => {
          return (
            <div key={index + "" + group.id}>
              <Divider plain orientation="left" orientationMargin={0}>
                <span className="color-60">{group.name}</span>
              </Divider>
              <Spin spinning={group.loading}>
                <BookMarkUnfold
                  bookmarks={group.bookmarks}
                  width="100%"
                  depth={1}
                  maxDepth={2}
                />
              </Spin>
            </div>
          );
        })}
      </Space>
    </Modal>
  );
}

function BookMarkUnfold({
  bookmarks,
  width,
  maxDepth = 0,
  depth = 0,
  divider = false,
}: {
  maxDepth?: number; // 支持的最大层级
  depth?: number; // 所在层级
  bookmarks: BookmarkType[];
  width?: string;
  divider?: boolean;
}) {
  const router = useRouter();
  const { notification } = App.useApp();

  const handleTagClick = (bookmark: BookmarkType) => {
    if (maxDepth <= depth + 1 && bookmark.folder) {
      notification.warning({
        message: `文件夹层级不得超过 ${maxDepth} 层`,
      });
      return;
    }

    if (bookmark.url === "" || bookmark.url === undefined) {
      notification.warning({
        message: "URL 为:" + bookmark.url,
      });
      return;
    }

    router.push(bookmark.url);
  };

  return (
    <>
      <Space wrap style={{ width: width || "auto" }}>
        {bookmarks.map((bookmark, index) => {
          return (
            <Tag key={bookmark.id} className="pointer">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  handleTagClick(bookmark);
                }}
                href={bookmark.url}
                title={
                  bookmark.describe === "" || !bookmark.describe
                    ? bookmark.name
                    : bookmark.describe
                }
                target="_blank"
              >
                {bookmark.name}
              </a>
            </Tag>
          );
        })}
      </Space>
      {divider && <Divider style={{ margin: ".5em 0" }} />}
    </>
  );
}

function BookMarkFold({
  bookmark,
  onClick,
}: {
  bookmark: BookmarkType;
  onClick: () => void;
}) {
  return (
    <Badge dot={true} color="blue">
      <Tag className="pointer" onClick={onClick}>
        {bookmark.name}
      </Tag>
    </Badge>
  );
}
