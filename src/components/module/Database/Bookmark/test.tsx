"use client";

import _, { get, set, values } from "lodash";
import { BookmarkType, D } from "@/db/types";
import { request } from "@/utils";
import {
  Button,
  Space,
  Tree,
  TreeDataNode,
  TreeProps,
  notification,
  Tag,
  Card,
  Input,
  Form,
  Row,
  Col,
  Modal,
  Flex,
  message,
  Radio,
  Popconfirm,
  App,
} from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useState } from "react";
import style from "./index.module.css";
import { defaultBookmark } from "@/db/defaultData";

const { Search } = Input;

interface CustomBookmarkType extends BookmarkType {
  key: string;
  title: string;
  children: CustomBookmarkType[];
}

// 转换为树形 TreeDataNode 数据
const convertToTreeData = (
  data: CustomBookmarkType[],
  key: string = ""
): CustomBookmarkType[] => {
  return data.map((item) => {
    const _key = key === "" ? String(item.id) : `${key}-${item.id}`;
    const children = item.children
      ? convertToTreeData(item.children as CustomBookmarkType[], _key)
      : [];
    return {
      ...item,
      key: _key,
      title: item.name,
      children,
    };
  });
};

// 获取书签
const getBookmark = async (parentID: number = 0, key = "") => {
  const data = await request.get("/bookmark", {
    params: { orderBy: "order", filters: { parentID } },
  });
  if (!data.data) return [];
  return convertToTreeData(data.data, key);
};

// 得到下一层,将更改原始数据
const getNextLevel = async (
  data: CustomBookmarkType[],
  callback: (data: CustomBookmarkType[]) => void,
  beforeRequest = () => {}
) => {
  beforeRequest();

  return Promise.all(
    data.map(async (item) => {
      if (item.children.length > 0 || !item.folder) return item;
      item.children = await getBookmark(item.id, item.key);
      return item;
    })
  ).then((values) => {
    callback(data);
  });
};

// 根据 key 获取节点
const getNodeByKey = (data: CustomBookmarkType[], key: string) => {
  const keys = key.split("-");
  keys.shift();
  const loop = (
    data: CustomBookmarkType[],
    keys: string[]
  ): CustomBookmarkType => {
    const index = _.toNumber(keys.shift());
    if (keys.length === 0) return data[index];
    return loop(data[index].children, keys);
  };
  return loop(data, keys);
};

// 根据 parentID 获取节点
const getNodeByParentID = (data: CustomBookmarkType[], parentID: number) => {
  const loop = (
    data: CustomBookmarkType[],
    parentID: number
  ): CustomBookmarkType | null => {
    for (const item of data) {
      if (item.id === parentID) return item;
      if (item.children) {
        const res = loop(item.children, parentID);
        if (res) return res;
      }
    }
    return null;
  };
  return loop(data, parentID);
};

export default function Bookmark() {
  const [gData, setGData] = useState<CustomBookmarkType[]>([]);
  const [expandedKeys, setExpandedKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  const { notification } = App.useApp();

  useEffect(() => {
    getBookmark().then((treeData) => {
      getNextLevel(treeData, setGData);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onExpand = useCallback(
    (expandedKeys: any, { expanded, node }: any) => {
      if (!expanded) return;

      const pos = node.pos.split("-");
      pos.shift();

      const d = _.cloneDeep(gData);

      // 避免原始数据不清晰，在函数内部处理
      const loop = (data: CustomBookmarkType[], pos: string[]): void => {
        const index = _.toNumber(pos.shift());
        if (pos.length === 0) {
          const children = data[index].children;
          getNextLevel(
            children,
            (children) => {
              setGData(d);
              return;
            },
            () => {
              setLoading(true);
              messageApi.open({
                type: "loading",
                content: "加载中...",
                duration: 0,
              });
            }
          ).finally(() => {
            setLoading(false);
            messageApi.destroy();
          });
        } else {
          return loop(data[index].children, pos);
        }
      };

      loop(d, pos);
    },
    [gData, messageApi]
  );

  const onDrop: TreeProps["onDrop"] = useCallback(
    (info: Record<string, any>) => {
      const dropKey = info.node.key;
      const dragKey = info.dragNode.key;
      const dropPos = info.node.pos.split("-");
      const dropPosition =
        info.dropPosition - Number(dropPos[dropPos.length - 1]);

      const loop = (
        data: TreeDataNode[],
        key: React.Key,
        callback: (node: TreeDataNode, i: number, data: TreeDataNode[]) => void
      ) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].key === key) {
            return callback(data[i], i, data);
          }
          if (data[i].children) {
            loop(data[i].children!, key, callback);
          }
        }
      };
      const data = [...gData];

      let dragObj: TreeDataNode;
      loop(data, dragKey, (item, index, arr) => {
        arr.splice(index, 1);
        dragObj = item;
      });

      if (!info.dropToGap) {
        loop(data, dropKey, (item) => {
          item.children = item.children || [];
          item.children.unshift(dragObj);
        });
      } else {
        let ar: TreeDataNode[] = [];
        let i: number;
        loop(data, dropKey, (_item, index, arr) => {
          ar = arr;
          i = index;
        });
        if (dropPosition === -1) {
          ar.splice(i!, 0, dragObj!);
        } else {
          ar.splice(i! + 1, 0, dragObj!);
        }
      }
      setGData(data);
    },
    [gData]
  );

  const onDragEnd = useCallback(
    async ({ event, node }: any) => {
      const parents: string[] = node.pos.split("-");
      parents.shift();
      const loop = (data: any, parents: string[]): CustomBookmarkType => {
        if (parents.length === 1) return data;
        const index = _.toNumber(parents.shift());
        return loop(data.children[index], parents);
      };
      const parentData = loop({ children: gData, id: 0 }, parents);

      const current = parentData.children[_.toNumber(parents[0])];

      const preOrder = _.toNumber(parents[0]);
      if (current.parentID === parentData.id && current.order === preOrder) {
        return;
      }

      setLoading(true);
      messageApi.open({
        type: "loading",
        content: "移动中...",
        duration: 0,
      });

      const data = await request.put(`/bookmark/move`, {
        id: current.id,
        parentID: parentData.id || 0,
        order: preOrder,
      });

      if (data.data) {
        setLoading(false);
        messageApi.destroy();

        notification.success({
          message: "移动成功",
        });

        // 更新本地数据
        const d = _.cloneDeep(gData);
        const loop = (data: CustomBookmarkType[], id: number) => {
          for (const item of data) {
            if (item.id === id) {
              item.parentID = parentData.id;
              item.order = preOrder;
              return;
            }
            if (item.children) {
              loop(item.children, id);
            }
          }
        };
        loop(d, current.id);
        setGData(d);
      }
    },
    [gData, messageApi, notification]
  );

  // Modal
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"post" | "put">("post");
  const [currentForm, setCurrentForm] = useState<D<BookmarkType>>(
    defaultBookmark()
  );

  const handleCreate = (data: CustomBookmarkType, folder: boolean = false) => {
    setMethod("post");
    setCurrentForm({
      ...defaultBookmark(),
      parentID: data.id,
      order:
        data.parentID === 0 || !data.parentID
          ? gData.length
          : data.children?.length || 0,
      folder,
    });
    setOpen(true);
  };

  const handleUpdate = (data: BookmarkType) => {
    setMethod("put");
    setCurrentForm(data);
    setOpen(true);
  };

  const handleDelete = async (data: BookmarkType) => {
    setLoading(true);
    messageApi.loading("删除中...");
    const res = await request.delete(`/bookmark`, { params: { id: data.id } });
    if (res.data) {
      notification.success({
        message: "删除成功",
      });
    }

    if (res.data) {
      let d = _.cloneDeep(gData);
      const loop = (data: CustomBookmarkType[], id: number) => {
        for (let i = 0; i < data.length; i++) {
          if (data[i].id === id) {
            data.splice(i, 1);
            return;
          }
          if (data[i].children) {
            loop(data[i].children, id);
          }
        }
      };
      loop(d, data.id);
      setGData(d);
    }
    setLoading(false);
    messageApi.destroy();
  };

  return (
    <>
      {contextHolder}
      <div className={style.bookmark}>
        <Modal
          width={370}
          open={open}
          title={
            method === "put" ? (
              <Space>
                <span>编辑</span>
                <Tag color="blue">
                  {(currentForm as BookmarkType).id as number}
                </Tag>
              </Space>
            ) : (
              <Space>
                <span>新增</span>
              </Space>
            )
          }
          onCancel={() => setOpen(false)}
          footer={null}
        >
          <Edit
            method={method}
            formData={currentForm}
            onClose={() => setOpen(false)}
            onSueccess={(values) => {
              setOpen(false);
              const data = _.cloneDeep(gData);
              const parent = getNodeByParentID(data, values.parentID as number);
              if (parent) {
                parent.children.push(
                  ...convertToTreeData([values], parent.key)
                );
              } else {
                data.push(...convertToTreeData([values], "0"));
              }
              setGData(data);
            }}
            onSubmmit={() => messageApi.loading("提交中...")}
            onSubmmitAfter={() => messageApi.destroy()}
            onFolderChange={(value) =>
              setCurrentForm({ ...currentForm, folder: value })
            }
          />
        </Modal>
        <div className={style.header + " glass"}>
          <h2>书签管理</h2>
          <Button
            type="primary"
            onClick={() =>
              handleCreate(
                {
                  id: 0,
                } as CustomBookmarkType,
                true
              )
            }
            size="small"
          >
            新增根节点
          </Button>
        </div>
        <div className={style.treeContainer + " glass"}>
          <Tree
            rootStyle={{ padding: "2em", background: "none" }}
            className={style.bookmarkTree}
            treeData={gData}
            blockNode
            // showLine
            draggable={{ icon: false }}
            onExpand={onExpand}
            onDrop={onDrop}
            onDragEnd={onDragEnd}
            titleRender={(nodeData: CustomBookmarkType) => {
              return (
                <div className={style.treeItem}>
                  <Space size="middle">
                    <span>{nodeData.title}</span>
                    <span className="color-40 fontsize-80">{nodeData.url}</span>
                  </Space>
                  <Space>
                    {(nodeData.url === "#" || nodeData.url === "") && (
                      <Button
                        type="link"
                        size="small"
                        disabled={loading}
                        onClick={() => handleCreate(nodeData)}
                      >
                        添加
                      </Button>
                    )}
                    <Button
                      type="link"
                      size="small"
                      disabled={loading}
                      onClick={() => handleUpdate(nodeData)}
                    >
                      编辑
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      danger
                      disabled={loading}
                      onClick={() => handleDelete(nodeData)}
                    >
                      <CloseOutlined />
                    </Button>
                  </Space>
                </div>
              );
            }}
          />
        </div>
      </div>
    </>
  );
}

function Edit({
  method,
  formData,
  onClose,
  onSubmmit,
  onSubmmitAfter,
  onSueccess,
  onFail = () => {},
  onFolderChange = () => {},
}: {
  method: "post" | "put";
  formData: D<BookmarkType> | BookmarkType;
  onClose: () => void;
  onSubmmit?: () => void;
  onSubmmitAfter?: () => void;
  onSueccess?: (values: CustomBookmarkType) => void;
  onFail?: () => void;
  onFolderChange?: (value: boolean) => void;
}) {
  const [form] = Form.useForm();

  const { notification } = App.useApp();

  useEffect(() => {
    form.setFieldsValue({ ...formData });
  }, [form, formData]);

  const handleFinish = async (values: any) => {
    onSubmmit && onSubmmit();
    const data = await request[method]("/bookmark", values);
    if (!!data.data) {
      notification.success({
        message: "保存成功",
      });
      onSueccess && onSueccess({ ...values, id: data.data as number });
    } else {
      notification.error({
        message: "保存失败",
      });
      onFail && onFail();
    }
    onSubmmitAfter && onSubmmitAfter();
  };

  return (
    <Form
      form={form}
      initialValues={formData}
      onFinish={handleFinish}
      labelCol={{ span: 4 }}
      labelAlign="left"
    >
      <div style={{ paddingTop: "1em" }}>
        <Form.Item label="id" name="id" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="order" name="order" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="父级" name="parentID" hidden>
          <Input />
        </Form.Item>
        <Form.Item label="分组" name="folder">
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
              onFolderChange && onFolderChange(value);
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
      </div>

      <Form.Item noStyle>
        <Flex justify="space-between">
          <Button onClick={onClose}>取消</Button>
          <Button type="primary" htmlType="submit">
            保存
          </Button>
        </Flex>
      </Form.Item>
    </Form>
  );
}
