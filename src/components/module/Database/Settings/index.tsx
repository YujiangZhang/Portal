"use client";
import { SettingsType } from "@/db/types";
import { defaultSettings } from "@/db/defaultData";
import { useEffect, useRef, useState } from "react";
import {
  Flex,
  Form,
  List,
  Result,
  Space,
  Switch,
  Upload,
  Image,
  ColorPicker,
  Spin,
  Skeleton,
  Slider,
  Tag,
  Button,
} from "antd";
import {
  RadiusUprightOutlined,
  HighlightOutlined,
  BgColorsOutlined,
  RightOutlined,
  InboxOutlined,
  LoadingOutlined,
  FrownOutlined,
} from "@ant-design/icons";
import React from "react";
import _ from "lodash";
import FolderDrawer from "@/components/common/FolderDrawer";
import style from "./index.module.css";
import {
  FileType,
  preventFlicker,
  preventFlickerDelay,
  request,
  uploadGetBase64,
} from "@/utils";

// =====================================
// TODO: 将每个设置项的配置单独作为 api
// api 没有单独的函数，需完善
// =====================================

type BackgroundType = SettingsType["background"];
type TextType = SettingsType["text"];
type ColorType = SettingsType["color"];
type SettingsKey = keyof SettingsType;
type PartType<T extends SettingsKey> = SettingsType[T];
interface FolderType {
  key: SettingsKey;
  data: PartType<SettingsKey>;
}

interface SettingType {
  key: keyof SettingsType;
  title: string;
  icon: React.ForwardRefExoticComponent<any>;
  description: string;
  drawer?: () => JSX.Element;
}

const defaultBackground = () => defaultSettings().background;
const defaultText = () => defaultSettings().text;
const defaultColor = () => defaultSettings().color;

const settingsList: SettingType[] = [
  {
    key: "background",
    title: "背景",
    icon: RadiusUprightOutlined,
    description: "背景设置",
    drawer: () => <SettingsBackground />,
  },
  {
    key: "text",
    title: "文字",
    icon: HighlightOutlined,
    description: "文字设置",
    drawer: () => <SettingsText />,
  },
  {
    key: "color",
    title: "颜色",
    icon: BgColorsOutlined,
    description: "颜色设置",
    drawer: () => <SettingsColor />,
  },
];

const settingsMap = new Map<SettingsKey, SettingType>(
  settingsList.map((item) => [item.key, item])
);

const settingStorage = new Map<SettingsKey, PartType<SettingsKey>>();

const getSettings = async () => {
  if (settingStorage.size > 0) {
    const data = {} as any;
    settingStorage.forEach((value, key) => {
      data[key] = value;
    });
    return data as SettingsType;
  }

  const data = await preventFlicker(async () => {
    return await request.get("/settings");
  });

  if (data && data.data) {
    _.forEach(data.data, (value, key) => {
      settingStorage.set(key as SettingsKey, value);
    });
    return data.data as SettingsType;
  } else {
    console.error("获取设置失败", data);
    return defaultSettings();
  }
};

const updateSettings = _.debounce(
  async (key: SettingsKey, data: PartType<SettingsKey>) => {
    const d = await preventFlicker(async () => {
      return await request(`/settings`, {
        method: "PUT",
        data: {
          [key]: data,
        },
      });
    });

    // 更新缓存
    settingStorage.set(key, data);

    return d;
  },
  1000
);

const getBackground = async () => {
  if (settingStorage.has("background")) {
    return settingStorage.get("background") as BackgroundType;
  }
  const data = await getSettings();
  return data.background;
};

const getText = async () => {
  if (settingStorage.has("text")) {
    return settingStorage.get("text") as TextType;
  }
  const data = await getSettings();
  return data.text;
};

const getColor = async () => {
  if (settingStorage.has("color")) {
    return settingStorage.get("color") as ColorType;
  }
  const data = await getSettings();
  return data.color;
};

function SettingsBackground() {
  const [formData, setFormData] = useState<BackgroundType>(defaultBackground());
  const [form] = Form.useForm();
  const [bgImageLoading, setBgImageLoading] = useState(true);
  const [bgImage, setBgImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const mounted = useRef(false);

  // 背景
  const handleBgImage = async (url: string) => {
    try {
      if (!url) return;
      const response = await fetch(url);
      const blob = await response.blob();

      const reader = new FileReader();
      reader.onload = () => {
        _.delay(() => {
          setBgImage(reader.result as string);
          setBgImageLoading(false);
        }, 500);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      setBgImageLoading(false);
      console.error("加载背景图片失败", error);
    }
  };

  // init
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const init = async () => {
      const data = await getBackground();
      setFormData(data);
      form.setFieldsValue(data);

      // 加载背景图片
      if (data.backgroundImageUrl) {
        handleBgImage(data.backgroundImageUrl);
      } else {
        setBgImageLoading(false);
      }
    };

    preventFlickerDelay(
      () => {
        setLoading(false);
      },
      init,
      500
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (data: Partial<BackgroundType>) => {
    const updateData = {
      ...formData,
      ...data,
    };

    setFormData(updateData);

    updateSettings("background", updateData);
  };

  return (
    <Form initialValues={formData} form={form} colon={false}>
      <Flex vertical gap={20}>
        <Flex justify="space-between">
          <div>背景颜色</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="backgroundColor" noStyle>
              <ColorPicker
                format="rgb"
                onChange={(value, hex) => {
                  update({
                    backgroundColor: hex,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>

        <Flex justify="space-between">
          <div>是否使用背景图片</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="useBackgroundImage" noStyle>
              <Switch
                onChange={(value) => {
                  update({
                    useBackgroundImage: value,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>

        <Spin
          spinning={loading}
          size="small"
          indicator={<LoadingOutlined spin />}
        >
          <Form.Item
            name="backgroundImageUrl"
            valuePropName="file"
            getValueFromEvent={(e) => {
              if (Array.isArray(e)) {
                return "";
              }

              if (e.file?.response?.path) {
                return e.file.response.path;
              }

              return "";
            }}
            noStyle
          >
            <Upload.Dragger
              style={{
                padding: 0,
              }}
              action="/api/uploads/image"
              accept="image/*"
              maxCount={1}
              showUploadList={false}
              disabled={!formData.useBackgroundImage}
              onChange={(info) => {
                if (info.file.status === "uploading") {
                  setBgImageLoading(true);
                }
                if (info.file.status === "done") {
                  uploadGetBase64(
                    info.file.originFileObj as FileType,
                    (imageUrl) => {
                      _.delay(() => {
                        setBgImageLoading(false);
                        setBgImage(imageUrl);
                        update({});
                      }, 500);
                    }
                  );
                }
              }}
            >
              {loading ? (
                <div className={style.backgroundImageUrl}>
                  <Skeleton.Image />
                </div>
              ) : bgImage ? (
                <Spin spinning={bgImageLoading && !bgImage}>
                  <Image
                    className={style.backgroundImageUrl}
                    src={bgImage || undefined}
                    preview={false}
                    height={200}
                    width="100%"
                    style={{
                      objectFit: "cover",
                    }}
                    alt="背景图"
                  />
                </Spin>
              ) : (
                <div className={style.backgroundImageUrl}>
                  <p>
                    <InboxOutlined className="fontsize-200" />
                  </p>
                  {!formData.useBackgroundImage ? (
                    <p>需要启用背景图片</p>
                  ) : (
                    <p className="color-60">点击或拖拽上传背景图片</p>
                  )}
                </div>
              )}
            </Upload.Dragger>
          </Form.Item>
        </Spin>
      </Flex>
    </Form>
  );
}

function SettingsText() {
  const [formData, setFormData] = useState<TextType>(defaultText());
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    const init = async () => {
      const data = await getText();
      setFormData(data);
      form.setFieldsValue(data);
    };

    preventFlickerDelay(() => setLoading(false), init, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (value: any) => {
    const data = {
      ...formData,
      ...value,
    };
    updateSettings("text", data);
  };

  return (
    <Form
      initialValues={formData}
      form={form}
      colon={false}
      labelAlign="left"
      labelCol={{
        span: 4,
      }}
      wrapperCol={{
        span: 16,
        offset: 4,
      }}
    >
      <Flex vertical gap={20}>
        <Flex justify="space-between">
          <div>文本颜色</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="textColor" noStyle>
              <ColorPicker
                format="rgb"
                onChange={(value, hex) => {
                  update({
                    textColor: hex,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>

        <Flex justify="space-between">
          <div>链接颜色</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="linkColor" noStyle>
              <ColorPicker
                format="rgb"
                onChange={(value, hex) => {
                  update({
                    linkColor: hex,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>

        <Form.Item label="字体大小" style={{ marginBottom: 0 }}>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="fontSize" noStyle>
              <Slider
                min={10}
                max={30}
                step={1.5}
                onChange={(value) => update({ fontSize: value })}
              />
            </Form.Item>
          </Spin>
        </Form.Item>

        <Form.Item label="行高" style={{ marginBottom: 0 }}>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="lineHeight" noStyle>
              <Slider
                min={1}
                max={3}
                step={0.1}
                onChange={(value) => update({ lineHeight: value })}
              />
            </Form.Item>
          </Spin>
        </Form.Item>
      </Flex>
    </Form>
  );
}

function SettingsColor() {
  const [formData, setFormData] = useState<ColorType>(defaultColor());
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const init = async () => {
      const data = await getColor();
      setFormData(data);
      form.setFieldsValue(data);
    };

    preventFlickerDelay(() => setLoading(false), init, 500);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (value: any) => {
    const data = {
      ...formData,
      ...value,
    };
    setFormData(data);
    updateSettings("color", data);
  };

  return (
    <Form initialValues={formData} form={form} colon={false}>
      <Flex vertical gap={20}>
        <Flex justify="space-between">
          <div>主要颜色</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="primaryColor" noStyle>
              <ColorPicker
                onChange={(value, hex) => {
                  update({
                    primaryColor: hex,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>

        <Flex justify="space-between">
          <div>次要颜色</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="secondaryColor" noStyle>
              <ColorPicker
                onChange={(value, hex) => {
                  update({
                    secondaryColor: hex,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>

        <Flex justify="space-between">
          <div>点缀颜色</div>
          <Spin
            spinning={loading}
            size="small"
            indicator={<LoadingOutlined spin />}
          >
            <Form.Item name="accentColor" noStyle>
              <ColorPicker
                onChange={(value, hex) => {
                  update({
                    accentColor: hex,
                  });
                }}
              />
            </Form.Item>
          </Spin>
        </Flex>
      </Flex>
    </Form>
  );
}

export default function Settings() {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings());
  const [folders, setFolders] = useState<FolderType[]>([]);
  const mounted = useRef(false);

  // 获取设置
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    getSettings().then((data) => {
      if (data) {
        setSettings(data);
      }
    });
  }, []);

  return (
    <>
      <FolderDrawer
        folderKey="key"
        folders={folders}
        setFolders={setFolders}
        autoFlex
        title="设置"
        folderTitle={(item) => <span>{settingsMap.get(item.key)?.title}</span>}
        renderFolder={(item, index) => {
          const Comp = settingsList.find((i) => i.key === item.key)?.drawer;
          return Comp ? (
            <Comp />
          ) : (
            <Result status="404" title="未找到" subTitle="未找到该设置" />
          );
        }}
      >
        <>
          <List
            grid={{
              column: 1,
            }}
            bordered
            dataSource={settingsList}
            size="small"
            renderItem={(item) => (
              <List.Item
                key={item.title}
                className="pointer"
                onClick={() => {
                  setFolders([{ key: item.key, data: settings[item.key] }]);
                }}
              >
                <Flex justify="space-between" align="middle">
                  <Space size="large">
                    <item.icon className="fontsize-160" />
                    <div>
                      <div className="fontsize-120 bold-600">{item.title}</div>
                      <p className="color-80">{item.description}</p>
                    </div>
                  </Space>
                  <RightOutlined className="opacity-40" />
                </Flex>
              </List.Item>
            )}
          />
          <Result
            title="主题方案设计中~"
            subTitle={
              <>
                <p>
                  仅颜色&ensp;
                  <Tag>主要颜色</Tag>&ensp; 生效
                </p>
                <p>
                  非动态生效，还需
                  <Button
                    type="link"
                    onClick={() => {
                      window.location.reload();
                    }}
                  >
                    刷新页面
                  </Button>
                </p>
              </>
            }
            style={{
              marginTop: 60,
            }}
            icon={<FrownOutlined />}
          />
        </>
      </FolderDrawer>
    </>
  );
}
