"use client";

import { CategoryType, MemoType } from "@/db/types";
import {
  DatetimeReturnStr,
  preventFlicker,
  preventFlickerDelay,
  datetimeType,
  getColorByIndex,
  request,
} from "@/utils";
import {
  Button,
  Card,
  DatePicker,
  Flex,
  Form,
  Input,
  Modal,
  Result,
  Segmented,
  Select,
  Skeleton,
  Space,
  Spin,
  Tabs,
  Tag,
  App,
} from "antd";
import {
  DeleteOutlined,
  LoadingOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import style from "./index.module.css";
// import { useNotification } from "../../Admin/Layout";
import { defaultMemo } from "@/db/defaultData";
import _ from "lodash";
import VirtualList from "rc-virtual-list";

interface CustomOption extends CategoryType {
  label: string;
  value: string;
}

interface CustomMemoType extends Omit<MemoType, "datetime"> {
  datetime: number;
}

const defaultCategory: CustomOption = {
  label: "全部",
  value: "全部",
} as CustomOption;

const converToOptions = (data: CategoryType[]) => {
  const d = data.map((item) => ({
    label: item.name,
    value: item.name,
    ...item,
  }));
  d.sort((a, b) => a.order - b.order);
  return [defaultCategory, ...d];
};

const getOptions = async () => {
  const data = await request.get("/category", {
    params: { filters: { belong: "memo" }, orderBy: "order" },
  });
  if (data.data) {
    return converToOptions(data.data);
  }
};

export default function Memo() {
  const [options, setOptions] = useState<CustomOption[]>([]);
  const [category, setCategory] = useState<CustomOption>(defaultCategory);
  const [page, setPage] = useState({ limit: 10, offset: 0 });
  const [items, setItems] = useState<MemoType[]>([]);

  const [loading, setLoading] = useState<
    "init" | "more" | "put" | "delete" | "post" | "category" | boolean
  >("init");

  const [isBottom, setIsBottom] = useState(false);

  const [ItemsContainerHeight, setItemsContainerHeight] = useState(0);
  const ItemsContainer = useRef<HTMLDivElement>(null);

  // 初始化
  useEffect(() => {
    const init = async () => {
      const container = ItemsContainer.current;
      if (container) {
        const top = container.getBoundingClientRect().top;
        setItemsContainerHeight(window.innerHeight - top - 32);
      }
      const data = await getOptions();
      if (data) {
        setOptions(data);
      }
    };

    preventFlickerDelay(() => {
      setLoading(false);
    }, init);
  }, []);

  // ====================
  // 自动加载
  // ====================
  const fetchItems = async () => {
    if (isBottom) return;

    if (!loading) {
      setLoading(true);
    }

    const func = async () => {
      const filters =
        category.value === "全部" ? {} : { category: category.value };

      const data = (await request.get("/memo", {
        params: { filters, orderBy: "-datetime", ...page },
      })) as any;
      if (data.data) {
        page.offset === 0
          ? setItems(data.data)
          : setItems([...items, ...data.data]);

        if (page.offset >= data.total) {
          setIsBottom(true);
        }
      }
    };

    await preventFlicker(func, 800);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category]);

  const onScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (isBottom || loading) return;
    if (
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          e.currentTarget.clientHeight
      ) < 10
    ) {
      setLoading("more");
      setPage({ offset: items.length, limit: 10 });
    }
  };

  // ====================

  const handleCategoryChange = (option: CustomOption) => {
    if (option.value !== category.value) {
      setItems([]);
      setIsBottom(false);
      setCategory(option);
      setPage({ limit: 10, offset: 0 });
      setLoading("category");
    }
  };

  // ====================
  // 新建、修改、删除
  // ====================
  const [form] = Form.useForm();
  const [currentForm, setCurrentForm] = useState<CustomMemoType>(
    defaultMemo() as CustomMemoType
  );
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<"post" | "put" | "delete">("post");
  // const { openNotification } = useNotification();
  const { notification } = App.useApp();

  // 通用请求
  const handleRequest = async (
    method: "post" | "put" | "delete",
    data: CustomMemoType
  ) => {
    setLoading(method);

    if (currentForm.id !== data.id) {
      setCurrentForm(data);
    }

    const func = async () => {
      let res;
      if (method === "delete") {
        res = await request.delete(`/memo`, { params: { id: data.id } });

        setItems(items.filter((item) => item.id !== data.id));
        setPage({ offset: items.length, limit: 1 });
      } else {
        res = await request[method](`/memo`, data);

        if (method === "post") {
          setItems([{ ...data, id: res.data }, ...items]);
        } else {
          setItems(
            items.map((item) => {
              if (item.id === data.id) {
                return data;
              }
              return item;
            })
          );
        }
      }

      return res || {};
    };

    const res = await preventFlicker<any>(func, 800);

    method !== "delete" && setLoading(false);

    const messages = {
      post: "新建",
      put: "修改",
      delete: "删除",
    };

    if (res.data) {
      setOpen(false);
      notification.success({
        message: `${messages[method]}成功`,
        description: `ID: ${res.data}`,
      });
    } else {
      notification.error({
        message: `${messages[method]}失败`,
        description: res.message,
      });
    }
  };

  const handleModalOpen = async (
    method: "post" | "put",
    data: CustomMemoType
  ) => {
    setMethod(method);
    switch (method) {
      case "post":
        setCurrentForm({
          ...defaultMemo(),
          datetime: Date.now(),
          id: 0,
        } as CustomMemoType);
        break;
      case "put":
        setCurrentForm({
          ...data,
        } as CustomMemoType);
        break;
      default:
        break;
    }
    setOpen(true);
  };

  const handleSubmit = (values: CustomMemoType) => {
    handleRequest(method, values);
  };

  const handleDelete = _.throttle((data: CustomMemoType) => {
    handleRequest("delete", data);
  }, 1000);

  return (
    <>
      <div className={style.memo}>
        <div className={style.header + " glass"}>
          <h2>备忘录</h2>
          <Space className="align-right" size="middle">
            <SegmentedControl
              options={options}
              setOptions={setOptions}
              currentOption={category}
              onChange={handleCategoryChange}
            />
            <Spin
              spinning={loading === "init"}
              indicator={<LoadingOutlined spin />}
            >
              <Button
                size="small"
                type="primary"
                disabled={loading === "category"}
                onClick={() => {
                  handleModalOpen("post", {
                    ...defaultMemo(),
                    datetime: dayjs().valueOf(),
                  } as CustomMemoType);
                }}
              >
                新建备忘
              </Button>
            </Spin>
          </Space>
        </div>
        <div ref={ItemsContainer} className={style.items + ""}>
          {!!loading && (loading === "category" || loading === "init") ? (
            <SkeletonItems />
          ) : !items || items.length === 0 ? (
            <BlankItems />
          ) : (
            <VirtualList
              data={items}
              itemKey="id"
              height={ItemsContainerHeight}
              onScroll={onScroll}
            >
              {(item: MemoType, index) => (
                <div
                  className={style.item + " padding-60 pointer"}
                  key={`${index}-${item.id}`}
                  onClick={() => {
                    if (loading) return;
                    handleModalOpen("put", item);
                  }}
                >
                  <Flex justify="space-between">
                    <Tag
                      color={
                        {
                          today: "red",
                          future: "cyan",
                          past: "blue",
                        }[
                          datetimeType(item.datetime, true) as DatetimeReturnStr
                        ]
                      }
                    >
                      {dayjs(item.datetime).format("YYYY-MM-DD HH:mm:ss")}
                    </Tag>
                    <Tag bordered={false} color={getColorByIndex(index)}>
                      {item.category}
                    </Tag>
                  </Flex>
                  <div className={style.itemBottom}>
                    <div className={style.itemContent}>
                      <Card size="small">{item.content}</Card>
                    </div>
                    <div className={style.itemBottomHandle}>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        size="small"
                        disabled={
                          !!loading &&
                          loading === "delete" &&
                          currentForm.id === item.id
                        }
                        loading={
                          loading === "delete" && currentForm.id === item.id
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(item);
                        }}
                      ></Button>
                    </div>
                  </div>
                </div>
              )}
            </VirtualList>
          )}
        </div>
      </div>
      <Modal
        open={open}
        footer={null}
        onCancel={() => setOpen(false)}
        title={
          method === "post" ? (
            "新建备忘录"
          ) : (
            <div>
              修改&ensp;<Tag color="blue">ID&ensp;{currentForm.id}</Tag>
            </div>
          )
        }
      >
        <MemoForm
          catagories={options.slice(1)}
          formData={currentForm}
          onSubmit={handleSubmit}
          onCancel={() => setOpen(false)}
          okLoading={loading === "put" || loading === "post"}
        />
      </Modal>
    </>
  );
}

function SegmentedControl({
  options,
  setOptions,
  currentOption = defaultCategory,
  onChange,
}: {
  options: CustomOption[];
  setOptions: (options: CustomOption[]) => void;
  currentOption: CustomOption;
  onChange: (option: CustomOption) => void;
}) {
  const [loading, setLoading] = useState<
    boolean | "post" | "delete" | "put" | "get"
  >(false);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  const handleChange = (value: string) => {
    const option = options.find((item) => item.value === value);
    if (option) {
      onChange(option);
    }
  };

  return (
    <>
      <Modal
        title="分类管理"
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
      >
        <Tabs
          items={options.map((item) => ({
            key: item.value,
            label: item.label,
            value: item.value,
          }))}
        />
        <Result status="404" title="暂无" subTitle="该模块完善中..." />
      </Modal>
      <Spin
        spinning={options.length === 0}
        indicator={<LoadingOutlined spin />}
      >
        <Flex align="center" gap={6}>
          <Button
            icon={<SettingOutlined />}
            shape="circle"
            size="small"
            onClick={() => setOpen(true)}
          ></Button>
          <Segmented
            options={options}
            value={currentOption.value}
            onChange={handleChange}
          />
        </Flex>
      </Spin>
    </>
  );
}

function MemoForm({
  catagories,
  formData,
  okLoading,
  onSubmit,
  onCancel,
}: {
  catagories: CustomOption[];
  formData: CustomMemoType;
  okLoading?: boolean;
  onSubmit?: (data: CustomMemoType) => void;
  onCancel?: () => void;
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    form.setFieldsValue({
      ...formData,
      datetime: dayjs(formData.datetime),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const handleFinish = (values: any) => {
    onSubmit && onSubmit({ ...values, datetime: values.datetime.valueOf() });
  };

  return (
    <div>
      <br />
      <Form
        form={form}
        onFinish={handleFinish}
        initialValues={{
          ...defaultMemo(),
          id: 0,
          datetime: dayjs(),
        }}
      >
        <Form.Item label="分类" name="category">
          <Select options={catagories} />
        </Form.Item>

        <Form.Item label="id" name="id" hidden>
          <Input />
        </Form.Item>

        <Form.Item label="时间" name="datetime">
          <DatePicker showTime format="YYYY-MM-DD HH:mm" />
        </Form.Item>
        <Form.Item label="标题" name="title">
          <Input />
        </Form.Item>
        <Form.Item label="内容" name="content">
          <Input.TextArea
            autoSize={{
              minRows: 3,
            }}
          />
        </Form.Item>
      </Form>

      <Flex justify="space-between">
        {onCancel && (
          <Button type="default" onClick={() => onCancel()}>
            取消
          </Button>
        )}
        <Button
          type="primary"
          loading={okLoading}
          onClick={() => form.submit()}
        >
          提交
        </Button>
      </Flex>
    </div>
  );
}

function SkeletonItems() {
  return (
    <Flex vertical gap={24} wrap="nowrap">
      {Array(4)
        .fill(0)
        .map((_, index) => {
          return (
            <div key={"-" + index}>
              <Flex justify="space-between">
                <Skeleton.Button active size="small" shape="square" />
                <Skeleton.Button active size="small" shape="square" />
              </Flex>
              <br />
              <Skeleton active paragraph={{ rows: 1 }} />
            </div>
          );
        })}
    </Flex>
  );
}

function BlankItems() {
  return (
    <Result status="info" title="暂无备忘录" subTitle="点击右上角新建备忘录" />
  );
}
