import { SettingsType } from "@/db/types";
import { defaultSettings as DefaultSettings } from "@/db/defaultData";
import db from "@/db/lowdb";
import _ from "lodash";

const defaultSettings = DefaultSettings();

export function getSettings() {
  return db.chain.get("settings").value();
}

export function updateSettings(data: Partial<SettingsType>) {
  const keys = Object.keys(defaultSettings);

  const preData = db.data.settings;

  data = {
    ...preData,
    ..._.pick(data, keys),
  };

  db.data.settings = data as SettingsType;
  db.write();
  return data;
}
