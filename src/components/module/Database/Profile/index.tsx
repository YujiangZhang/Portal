"use client";
import { defaultProfile } from "@/db/defaultData";
import {
  FileType,
  uploadGetBase64,
  request,
  preventFlickerDelay,
} from "@/utils";
import {
  Avatar,
  Button,
  Form,
  Image,
  Input,
  Upload,
  UploadProps,
  Row,
  Col,
  Flex,
  Spin,
  App,
} from "antd";
import { CloseOutlined, LoadingOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import _ from "lodash";
import style from "./index.module.css";

export default function Profile() {
  const defaultForm = defaultProfile();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<
    boolean | "init" | "update" | "uploading"
  >("init");

  const { notification } = App.useApp();

  const handleGetValueFromEvent = (e: any) => {
    return e?.file?.response?.path || null;
  };

  const handleChange: UploadProps["onChange"] = (info) => {
    if (info.file.status === "uploading") {
      return;
    }
    if (info.file.status === "done") {
      uploadGetBase64(info.file.originFileObj as FileType, (url) => {
        notification.success({ message: "上传成功" });
        setAvatar(url);
      });
    }
  };

  const handleGet = async () => {
    const data = await request.get("/profile");
    if (!!data.data) {
      form.setFieldsValue(data.data);
      setAvatar(data.data.avatar);
    }
  };

  const handleFinish = async (values: any) => {
    const data = await request.put("/profile", values);
    if (!!data.data) {
      notification.success({ message: "保存成功" });
    } else {
      notification.error({ message: "保存失败" });
    }
  };

  useEffect(() => {
    preventFlickerDelay(() => setLoading(false), handleGet, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className={style.socials + " glass"}>
        <Form
          form={form}
          onFinish={handleFinish}
          initialValues={defaultForm}
          colon={false}
          labelCol={{ span: 4 }}
          labelAlign="left"
        >
          <Form.Item
            name="avatar"
            getValueFromEvent={handleGetValueFromEvent}
            valuePropName="file"
            label="&ensp;"
            style={{ textAlign: "center", marginTop: 16 }}
          >
            <Upload
              action="/api/uploads/image"
              accept="image/*"
              onChange={handleChange}
              showUploadList={false}
              maxCount={1}
            >
              <Spin
                spinning={loading === "init"}
                indicator={<LoadingOutlined spin />}
              >
                <Avatar
                  className="pointer"
                  src={avatar || "/assets/images/avatar.png"}
                  size={90}
                />
              </Spin>
            </Upload>
          </Form.Item>

          <Form.Item name="name" label="昵称">
            <Input placeholder="昵称" name="name" />
          </Form.Item>

          <Form.Item name="bio" label="简介">
            <Input placeholder="简介" name="bio" />
          </Form.Item>
          <Form.Item label="邮箱" name="email">
            <Input type="email" />
          </Form.Item>

          <Form.Item label="网站" name="website">
            <Input type="url" />
          </Form.Item>

          <Form.Item label="社交账号">
            <Form.List name="socials">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item key={index} noStyle>
                      <Row gutter={8}>
                        <Col className={style.socialsItem} span={5}>
                          <div className={style.socialLabel}>网站</div>
                          <Form.Item name={[field.name, "name"]} noStyle>
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col className={style.socialsItem} span={13}>
                          <div className={style.socialLabel}>地址</div>
                          <Form.Item name={[field.name, "url"]} noStyle>
                            <Input />
                          </Form.Item>
                        </Col>

                        <Col className={style.socialsItem} span={3}>
                          <Form.Item
                            name={[field.name, "icon"]}
                            getValueFromEvent={handleGetValueFromEvent}
                            valuePropName="file"
                            noStyle
                          >
                            <Upload
                              action="/api/uploads/image"
                              accept="image/*"
                              maxCount={1}
                              showUploadList={false}
                              onChange={(info) => {
                                if (info.file.status === "done") {
                                  form.setFieldsValue({
                                    [`socials[${index}].icon`]:
                                      info.file.response.path,
                                  });
                                }
                              }}
                            >
                              {
                                <Image
                                  className="pointer"
                                  preview={false}
                                  src={
                                    form.getFieldValue([
                                      "socials",
                                      index,
                                      "icon",
                                    ]) || "/assets/images/upload.svg"
                                  }
                                  alt="icon"
                                  width={36}
                                  height={36}
                                  style={{ borderRadius: ".5em" }}
                                />
                              }
                            </Upload>
                          </Form.Item>
                        </Col>

                        <Col className={style.socialsItem}>
                          <Button
                            className={style.socialsDelete}
                            icon={<CloseOutlined />}
                            onClick={() => remove(field.name)}
                            size="small"
                            type="text"
                            danger
                          />
                        </Col>
                      </Row>
                    </Form.Item>
                  ))}

                  <Flex justify="end">
                    <Button
                      onClick={() => add()}
                      className={style.socialAdd}
                      type="primary"
                      ghost
                      size="small"
                    >
                      添加
                    </Button>
                  </Flex>
                </>
              )}
            </Form.List>
          </Form.Item>

          <Form.Item label="&ensp;">
            <Button
              type="primary"
              htmlType="submit"
              style={{ width: "100%" }}
              // ghost
            >
              保存
            </Button>
          </Form.Item>
        </Form>
      </div>
    </>
  );
}
