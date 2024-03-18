import { ProfileType } from "@/db/types";
import { defaultProfile as DefaultProfile } from "@/db/defaultData";
import db from "@/db/lowdb";
import _ from "lodash";

const defaultProfile = DefaultProfile();

export function getProfile() {
  return db.chain.get("profile").value();
}

export function updateProfile(data: Partial<ProfileType>) {
  const preData = db.data.profile;

  data = {
    ...preData,
    ..._.pick(data, Object.keys(defaultProfile)),
  };

  if (!data.name) {
    throw new Error("name 是必须的");
  }

  db.data.profile = data as ProfileType;
  db.write();
  return data;
}
