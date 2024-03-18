import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import lodash from "lodash";

import { DataType } from "./types";
import { defaultData as DefaultData } from "./defaultData";
import config from "../../config";

class LowWithLodash<T> extends Low<T> {
  chain: lodash.ExpChain<this["data"]> = lodash.chain(this).get("data");
}

export type LowWithLodashType = LowWithLodash<DataType>;

async function initDB(init: boolean = config.dbInit) {
  const defaultData: DataType = DefaultData();

  const adapter = new JSONFile<DataType>(
    config.dbType === "development" ? config.dbTestName : config.dbName
  );

  if (init) {
    await adapter.write(defaultData);
  }

  const db = new LowWithLodash(adapter, defaultData);
  await db.read();

  return db;
}

export default await initDB();
