"use client";

import SameEditFolder, {
  FolderType,
  RenderFolder,
} from "@/components/common/FolderDrawer/SameItemFolder";
import { BookmarkType, D } from "@/db/types";
import { preventFlicker, preventFlickerDelay, request } from "@/utils";
import {
  Button,
  Card,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Result,
  Space,
  Spin,
  Tag,
} from "antd";
import {
  CloseOutlined,
  FolderTwoTone,
  CompassTwoTone,
  EditOutlined,
  TagsTwoTone,
  LoadingOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import style from "./index.module.css";
import _ from "lodash";
import { defaultBookmark } from "@/db/defaultData";
import { Params } from "@/api/lib/requests";

interface CustomBookmarkType extends BookmarkType, FolderType {
  id: number;
  children: CustomBookmarkType[];
}

/**
 * 获取书签
 * 将自动加上 children
 */
const getBookMark = async (
  parentID: number,
  params: Partial<Params> = {
    limit: 1000,
    offset: 0,
  }
): Promise<CustomBookmarkType[]> => {
  params = {
    ...params,
    filters: { parentID },
    orderBy: "order",
  };
  const data = await request("/bookmark", {
    method: "get",
    params,
  });

  if (data.data) {
    data.data.forEach((item: CustomBookmarkType) => {
      item.children = [];
    });
    return data.data;
  } else {
    return [];
  }
};

// api 更新
const updateBookMark = async (data: CustomBookmarkType) => {
  const res = await request("/bookmark", {
    method: "put",
    data,
  });
  return res as unknown as { data: CustomBookmarkType | null; message: string };
};

// api 创建
const createBookMark = async (data: D<BookmarkType>) => {
  const res = await request("/bookmark", {
    method: "post",
    data,
  });

  return res as unknown as { data: number | null; message: string };
};

// api 删除
const deleteBookMark = async (id: number) => {
  const res = await request(`/bookmark`, {
    method: "delete",
    params: {
      id,
    },
  });
  return res as unknown as { data: number | null; message: string };
};

/**
 * api 改变顺序
 * 传递改变顺序后的 ids
 * FIXME: 这里传递了所有改变，修改为
 */
const updateBookMarkOrder = async (id: number, from: number, to: number) => {
  console.log("移动开始", id, from, to);
  const res = await request.put(`/bookmark/move`, {
    id,
    from,
    to,
  });
  return res;
};

export default function Bookmark() {
  const [main, setMain] = useState<CustomBookmarkType>();
  // const [mainItems, setMainItems] = useState<CustomBookmarkType[]>([]);
  const [bookmarks, setBookmarks] = useState<CustomBookmarkType[]>([]);
  const [loading, setLoading] = useState<
    "init" | "post" | "put" | "delete" | "more" | boolean | number
  >("init"); // number: 为加载 id 下的 children

  // 初始化
  useEffect(() => {
    preventFlickerDelay(
      () => {
        setLoading(false);
      },
      async () => {
        const data = await getBookMark(0);
        if (data) {
          // setMainItems(data);
          setMain({
            id: 0,
            children: data,
          } as unknown as CustomBookmarkType);
        }
      }
    );
  }, []);

  // post / put / delete 成功后更新
  const handleSetBookmarks = useCallback(
    async (data: CustomBookmarkType, method: "post" | "put" | "delete") => {
      setLoading(method);

      console.log("handleSetBookmarks", data, method);

      const func = async () => {
        switch (method) {
          case "post":
            return await createBookMark(data);
          case "put":
            return await updateBookMark(data);
          case "delete":
            return await deleteBookMark(data.id);
        }
      };

      const res = await preventFlicker(func);
      setLoading(false);
      setOpen(false);

      // 更新本地数据

      const messages = {
        post: "创建",
        put: "更新",
        delete: "删除",
      };

      if (!res.data) {
        return;
      }

      // 类型纠正
      data.children = [];
      method === "post" && (data.id = res.data as number);

      const parent =
        data.parentID === 0
          ? main
          : bookmarks.find((item) => item.id === data.parentID);

      if (parent === undefined) {
        console.error("更新时没有找到父级");
        return;
      }
      const children = parent.children;
      let newChildren: CustomBookmarkType[] = [];
      switch (method) {
        case "delete":
          newChildren = children.filter((item) => item.id !== data.id);
          break;
        case "post":
          newChildren = [...children, data];
          break;
        case "put":
          const itemIndex = children.findIndex((item) => item.id === data.id);
          newChildren = [
            ...children.slice(0, itemIndex),
            data,
            ...children.slice(itemIndex + 1),
          ];
          break;
      }

      if (parent.id === 0) {
        setMain((prev: any) => {
          return {
            ...prev,
            children: newChildren,
          };
        });
      } else {
        setBookmarks((prev: any) => {
          if (parent.id !== prev.id) {
            return prev;
          } else {
            return {
              ...prev,
              children: newChildren,
            };
          }
        });
      }
    },
    [bookmarks, main]
  );

  // 获取

  const handleGetBookmarks = async (parent: CustomBookmarkType) => {
    setLoading(parent.id);

    const index = bookmarks.findLastIndex((item) => item.id === parent.id);

    if (index !== -1) {
      if (index === bookmarks.length - 1) {
        console.log("当前页");
      } else {
        console.log("之前");
        setBookmarks(_.slice(bookmarks, 0, index + 1));
      }
      setLoading(false);
      return;
    }

    const books = await preventFlicker(() => getBookMark(parent.id));
    setLoading(false);

    const parentParentIndex = bookmarks.findIndex(
      (item) => item.id === parent.parentID
    );
    const newBookmarks = { ...parent, children: books };
    setBookmarks([...bookmarks.slice(0, parentParentIndex + 1), newBookmarks]);
  };

  // 排序

  const handleOrderBookmakrs = useCallback(
    async (
      folder: CustomBookmarkType,
      key: number, // 被移动元素的 id
      pos: Record<"from" | "to", number>
    ) => {
      const res = await updateBookMarkOrder(key, pos.from, pos.to);
      if (res && res.data) {
      } else {
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // modal
  const [currentBookmark, setCurrentBookmark] = useState<CustomBookmarkType>(
    defaultBookmark() as CustomBookmarkType
  );
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"post" | "put">("post");

  const handleOpenModal = (type: "post" | "put", data: CustomBookmarkType) => {
    console.log("handleOpenModal", type, data);
    setMethod(type);
    setCurrentBookmark(data);
    setOpen(true);
  };

  const styles: any = useMemo(
    () => ({
      ul: {
        padding: "0 .5rem",
      },
      li: {
        marginBottom: ".7rem",
      },
    }),
    []
  );

  return (
    <>
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        title={
          method === "post" ? (
            "创建"
          ) : (
            <span>
              编辑&ensp;<Tag color="blue">{currentBookmark.id}</Tag>
            </span>
          )
        }
      >
        <br />
        <EditBookmark
          loading={loading === "post" || loading === "put"}
          formData={currentBookmark}
          setFormData={setCurrentBookmark}
          onCancel={() => setOpen(false)}
          onOk={(data) => handleSetBookmarks(data, method)}
        ></EditBookmark>
      </Modal>
      <SameEditFolder
        items={bookmarks}
        setItems={setBookmarks}
        autoFlex={{
          main: 2,
          folders: 3,
        }}
        folderItemKey="id"
        title="书签"
        styles={styles}
        onDragEnd={handleOrderBookmakrs}
        renderFolderItem={(folderItem, index) => {
          return (
            <Spin
              spinning={loading === folderItem.id}
              indicator={<LoadingOutlined spin />}
            >
              <FolderItem
                folderItem={folderItem}
                index={index}
                onDelete={() => handleSetBookmarks(folderItem, "delete")}
                onEdit={() => handleOpenModal("put", folderItem)}
                onClick={() => handleGetBookmarks(folderItem)}
              ></FolderItem>
            </Spin>
          );
        }}
        blankRender={(folder) => (
          <FolderItemBlank
            folderItem={folder}
            toCreate={() => {
              handleOpenModal("post", {
                ...defaultBookmark(),
                parentID: folder.id,
              } as CustomBookmarkType);
            }}
          />
        )}
      >
        <section className={style.main}>
          <div className={style.mainContent}>
            {loading === "init" ? (
              <div className={style.mainLoading}>
                <Spin />
              </div>
            ) : (
              <RenderFolder
                folder={main as CustomBookmarkType}
                folderItemKey="id"
                onDragEnd={handleOrderBookmakrs}
                renderFolderItem={(folderItem, index) => (
                  <FolderItem
                    folderItem={folderItem}
                    index={index}
                    onDelete={() => handleSetBookmarks(folderItem, "delete")}
                    onEdit={() => handleOpenModal("put", folderItem)}
                    onClick={() =>
                      folderItem.folder && handleGetBookmarks(folderItem)
                    }
                  ></FolderItem>
                )}
                styles={styles}
              ></RenderFolder>
            )}
          </div>

          <div className={style.mainAction}>
            <Button
              type="primary"
              onClick={() => {
                handleOpenModal(
                  "post",
                  defaultBookmark() as CustomBookmarkType
                );
              }}
            >
              创建
            </Button>
          </div>
        </section>
      </SameEditFolder>
    </>
  );
}

// 书签卡片
function FolderItem({
  folderItem,
  index,
  onDelete,
  onEdit,
  ...props
}: {
  folderItem: CustomBookmarkType;
  index: number;
  onOpenFolder?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const deleteItem = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete && onDelete();
  };

  const editItem = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEdit && onEdit();
  };

  return (
    <>
      {
        <Card {...props} size="small" hoverable={folderItem.folder}>
          <Flex gap={14} justify="space-between">
            <Flex flex={1} gap={14}>
              {folderItem.folder ? (
                <FolderTwoTone className="fontsize-120" />
              ) : (
                <CompassTwoTone className="fontsize-120" />
              )}
              <Flex flex={1} vertical>
                <div>{folderItem.name}</div>
                {folderItem.folder ? (
                  <div className="color-40 fontsize-60 ">
                    {folderItem.children.length}个
                  </div>
                ) : (
                  <div className="color-40 fontsize-60 ">{folderItem.url}</div>
                )}
              </Flex>
            </Flex>
            <Space size="small">
              <Button type="text" size="small" onClick={editItem}>
                <EditOutlined />
              </Button>
              <Button type="text" size="small" danger onClick={deleteItem}>
                <CloseOutlined />
              </Button>
            </Space>
          </Flex>
        </Card>
      }
    </>
  );
}

// 空白时
function FolderItemBlank({
  folderItem,
  toBack,
  toCreate,
  ...props
}: {
  folderItem: CustomBookmarkType;
  toCreate: () => void;
  toBack?: () => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const handleBack = () => {
    toBack && toBack();
  };
  return (
    <Flex
      justify="center"
      align="center"
      style={{
        height: "100%",
      }}
    >
      <Result
        icon={<TagsTwoTone />}
        title={folderItem.name}
        subTitle="还没有书签"
        extra={[
          <Button type="primary" onClick={toCreate} key="create">
            添加
          </Button>,

          toBack && (
            <Button key="refresh" onClick={handleBack}>
              返回
            </Button>
          ),
        ]}
      />
    </Flex>
  );
}

// 编辑: 创建 / 更新
function EditBookmark({
  loading,
  formData,
  setFormData,
  onOk,
  onCancel,
}: {
  loading: boolean;
  formData: CustomBookmarkType;
  setFormData: React.Dispatch<React.SetStateAction<CustomBookmarkType>>;
  onOk: (data: CustomBookmarkType) => void;
  onCancel: () => void;
}) {
  const handleOk = (values: CustomBookmarkType) => {
    console.log("handleOk", values);
    onOk(values);
  };

  return (
    <Form
      initialValues={formData}
      labelCol={{ span: 4 }}
      labelAlign="left"
      onFinish={handleOk}
    >
      <Form.Item label="id" name="id" hidden>
        <Input />
      </Form.Item>

      <Form.Item label="order" name="order" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="父级" name="parentID" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="类型" name="folder">
        <Radio.Group
          options={[
            {
              label: "分组",
              value: true,
            },
            {
              label: "网站",
              value: false,
            },
          ]}
          onChange={({ target: { value } }) => {
            setFormData((prev) => {
              return {
                ...prev,
                folder: value,
              };
            });
          }}
          optionType="button"
        />
      </Form.Item>

      <Form.Item label={formData.folder ? "组名" : "网站"} name="name">
        <Input />
      </Form.Item>

      <Form.Item label="地址" name="url" hidden={formData.folder}>
        <Input />
      </Form.Item>

      <Form.Item noStyle>
        <Flex justify="space-between">
          <Button onClick={onCancel}>取消</Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            保存
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
}
