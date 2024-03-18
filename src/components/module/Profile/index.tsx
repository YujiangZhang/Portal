"use client";
import { getImageSrc, request } from "@/utils";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ProfileType } from "@/db/types";
import { defaultProfile } from "@/db/defaultData";
import { Space, Avatar, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const getProfile = async () => {
  const res = await request.get("/profile");
  if (res.data) {
    return res.data as ProfileType;
  } else {
    throw new Error("获取用户信息失败");
  }
};

function AvatarInstance() {
  const [profile, setProfile] = useState<ProfileType>(defaultProfile());
  const [loading, setLoading] = useState(true);
  const [avatar, setAvatar] = useState<string | null | "fail">(null);

  useEffect(() => {
    getProfile().then((data) => {
      setProfile(data);
      setLoading(false);

      if (data.avatar) {
        getImageSrc(data.avatar, (src) => {
          setAvatar(src);
        });
      }
    });
  }, []);

  return (
    <Space direction="vertical" align="center" size="small">
      <Spin indicator={<LoadingOutlined spin />} spinning={avatar === null}>
        <Avatar
          src={avatar}
          size={{ xs: 60, sm: 80, md: 100, lg: 120, xl: 140, xxl: 160 }}
          alt="头像"
        />
      </Spin>

      <span>
        <Link href="https://yustudy.cn" target="_blank" className="color-80">
          {profile.name}
        </Link>
      </span>
    </Space>
  );
}

export default function Profile() {
  return <AvatarInstance />;
}
