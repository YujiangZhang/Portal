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
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Radio,
  Result,
  Row,
  Space,
  Spin,
  Tag,
  App,
} from "antd";
import {
  CloseOutlined,
  LinkOutlined,
  EditOutlined,
  LoadingOutlined,
  PlusOutlined,
  FolderOpenFilled,
  FolderFilled,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import _ from "lodash";
import { defaultBookmark } from "@/db/defaultData";
import { Params } from "@/api/lib/requests";

// TODO: 抽取为通用组件
// 适合场景：元素相同，有children
// - 每个 folder 都为无限加载列表

interface CustomBookmarkType extends BookmarkType, FolderType {
  id: number;
  children: CustomBookmarkType[];
  isOpen: boolean; // 是否已经打开
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

  const { notification } = App.useApp();

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

  // 自动合上 isOpen = false

  useEffect(() => {
    let needClose = false;
    let children;
    if (!main) return;
    if (bookmarks.length > 0) {
      children = bookmarks[bookmarks.length - 1].children.map((item) => {
        if (item.isOpen) {
          needClose = true;
          item.isOpen = false;
        }
        return item;
      });
      if (needClose) {
        const books = [...bookmarks];
        books[books.length - 1].children = children;
        setBookmarks(books);
      }
    } else {
      children = main.children.map((item) => {
        if (item.isOpen) {
          needClose = true;
          item.isOpen = false;
        }
        return item;
      });
      if (needClose) {
        setMain({
          ...main,
          children,
        });
      }
    }
  }, [bookmarks, main]);

  // post / put / delete 成功后更新
  const handleSetBookmarks = useCallback(
    async (data: CustomBookmarkType, method: "post" | "put" | "delete") => {
      setLoading(method);

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
        notification.error({
          message: `${messages[method]}失败`,
        });
        return;
      }

      // 类型纠正
      data.children = [];
      method === "post" && (data.id = res.data as number);

      const parent =
        data.parentID === 0
          ? main
          : _.cloneDeep(
              bookmarks.findLast((item) => item.id === data.parentID)
            );

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

      parent.children = newChildren;

      if (parent.id === 0) {
        setMain((prev: any) => {
          return {
            ...prev,
            children: newChildren,
          };
        });
      } else {
        const books = [...bookmarks];
        const index = books.findIndex((item) => item.id === parent.id);
        books[index] = parent;
        setBookmarks(books);
      }

      notification.success({
        message: `${messages[method]}成功`,
      });
    },
    [bookmarks, main, notification]
  );

  // 获取

  const handleGetBookmarks = async (parent: CustomBookmarkType) => {
    setLoading(parent.id);

    const index = bookmarks.findLastIndex((item) => item.id === parent.id);

    if (index !== -1) {
      index !== bookmarks.length - 1 &&
        setBookmarks(_.slice(bookmarks, 0, index + 1));
      setLoading(false);
      return;
    }

    const books = await preventFlicker(() => getBookMark(parent.id));
    setLoading(false);

    const parentParentIndex = bookmarks.findLastIndex(
      (item) => item.id === parent.parentID
    );

    if (parentParentIndex === -1) {
      if (!main) {
        console.error("未知错误");
        return;
      }
      const parentParentChildren = main.children.map((item) => {
        if (item.id === parent.id) {
          item.isOpen = true;
        } else {
          item.isOpen = false;
        }
        return item;
      });
      setMain({
        ...main,
        children: parentParentChildren,
      });
      setBookmarks([
        {
          ...parent,
          children: books,
        },
      ]);
    } else {
      const parentParentChildren = bookmarks[parentParentIndex].children.map(
        (item) => {
          if (item.id === parent.id) {
            item.isOpen = true;
          } else {
            item.isOpen = false;
          }
          return item;
        }
      );
      const newBookmarks = { ...parent, children: books };
      // setBookmarks([...bookmarks.slice(0, parentParentIndex + 1), newBookmarks]);
      setBookmarks([
        ...bookmarks.slice(0, parentParentIndex),
        {
          ...bookmarks[parentParentIndex],
          children: parentParentChildren,
        },
        newBookmarks,
      ]);
    }
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
        notification.success({
          message: "移动成功",
        });
      } else {
        notification.error({
          message: "移动失败",
        });
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
    setMethod(type);
    setCurrentBookmark(data);
    setOpen(true);
  };

  // back

  const handleFolderBack = (folder: CustomBookmarkType) => {
    // 实际上没有必要找 index，因为在此处的取消就只能出现在 最后一个
    // 但是使用 findLastIndex 不影响性能
    const index = bookmarks.findLastIndex((item) => item.id === folder.id);
    setBookmarks(_.slice(bookmarks, 0, index));
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
        folderTitle={(folder, index) => (
          <Flex justify="space-between" align="center">
            <div>{folder.name}</div>
            <Button
              type="text"
              size="small"
              onClick={() => {
                handleOpenModal("post", {
                  ...defaultBookmark(),
                  parentID: folder.id,
                } as CustomBookmarkType);
              }}
            >
              <PlusOutlined className="opacity-60" />
            </Button>
          </Flex>
        )}
        onDragEnd={handleOrderBookmakrs}
        renderFolderItem={(folderItem, index) => {
          return (
            <FolderItem
              loading={loading}
              folderItem={folderItem}
              folderItemKey="id"
              index={index}
              onDelete={() => handleSetBookmarks(folderItem, "delete")}
              onEdit={() => handleOpenModal("put", folderItem)}
              onClick={() =>
                folderItem.folder && handleGetBookmarks(folderItem)
              }
            ></FolderItem>
          );
        }}
        blankRender={(folder) => (
          <FolderItemBlank
            folderItem={folder}
            toBack={handleFolderBack}
            toCreate={() => {
              handleOpenModal("post", {
                ...defaultBookmark(),
                parentID: folder.id,
              } as CustomBookmarkType);
            }}
          />
        )}
      >
        <Flex vertical className="h-full">
          <section
            className="overflow-auto "
            style={{
              flex: 1,
            }}
          >
            {loading === "init" ? (
              <Flex justify="center" align="center" className="h-full">
                <Spin />
              </Flex>
            ) : (
              <RenderFolder
                folder={main as CustomBookmarkType}
                folderItemKey="id"
                onDragEnd={handleOrderBookmakrs}
                renderFolderItem={(folderItem, index) => (
                  <FolderItem
                    folderItem={folderItem}
                    index={index}
                    loading={loading}
                    folderItemKey="id"
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
          </section>

          <Flex className="padding-40">
            <Button
              className="w-full"
              type="primary"
              onClick={() =>
                handleOpenModal("post", {
                  ...(defaultBookmark() as CustomBookmarkType),
                  parentID: 0,
                })
              }
              loading={loading === "init"}
            >
              创建
            </Button>
          </Flex>
        </Flex>
      </SameEditFolder>
    </>
  );
}

// 书签卡片
function FolderItem({
  folderItem,
  loading,
  folderItemKey,
  index,
  onDelete,
  onEdit,
  ...props
}: {
  loading: any;
  folderItem: CustomBookmarkType;
  folderItemKey?: string;
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
        <Spin
          spinning={loading === folderItem[folderItemKey as any]}
          indicator={<LoadingOutlined spin />}
        >
          <Card {...props} size="small" hoverable={folderItem.folder}>
            <Flex gap={14} justify="space-between">
              <Flex flex={1} gap={14} align="start">
                {folderItem.folder ? (
                  folderItem.isOpen ? (
                    <FolderOpenFilled className="fontsize-120" />
                  ) : (
                    <FolderFilled className="fontsize-120 opacity-60" />
                  )
                ) : (
                  <LinkOutlined className="fontsize-120 opacity-60" />
                )}
                <Flex flex={1} vertical>
                  <div>{folderItem.name}</div>
                  {folderItem.folder ? (
                    <div className="color-40 fontsize-60 ">
                      {folderItem.url}
                    </div>
                  ) : (
                    <div className="color-40 fontsize-60 ">
                      {folderItem.url}
                    </div>
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
        </Spin>
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
  toBack?: (folderItem: CustomBookmarkType) => void;
} & React.HTMLAttributes<HTMLDivElement>) {
  const handleBack = () => {
    toBack && toBack(folderItem);
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
        icon={<LinkOutlined />}
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
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue(formData);
  }, [form, formData]);

  const handleOk = (values: CustomBookmarkType) => {
    onOk(values);
  };

  return (
    <Form
      form={form}
      initialValues={formData}
      labelCol={{ span: 3 }}
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

      <Form.Item label="描述" name="describe">
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
