import { TableType, TableTypeWithKey, TableTypes } from "@/db/types";
import _ from "lodash";
import { LowWithLodashType } from "@/db/lowdb";
import { Params } from "./requests";
import config from "@/../config";

const initID = config.dbStartID;

/*

适合类型为 Array 的数据表:
  key of TableTypes

不适合 SingleTableTypes

数据完整的类型定义:
type DataType = {
  [K in keyof SingleTableTypes]: SingleTableTypes[K];
} & {
  [K in keyof TableTypes]: TableTypes[K][];
}

*/

/**
 * 创建时，初始化时间
 * @param data
 * @param defaultData 默认数据，用于清理字段
 * @param defaultDateKeys
 * @returns
 */
export function dbDateCreate<T extends Partial<TableType>>(
  data: T,
  defaultDateKeys: (keyof T)[] = ["created_at", "updated_at"]
) {
  const now = Date.now();
  defaultDateKeys.forEach((key) => key in data && ((data as any)[key] = now));
}

/**
 * 更新时，更新时间
 * @param data
 * @param defaultDateKeys
 */
export function dbDateUpdate<T extends Partial<TableType>>(
  data: T,
  defaultDateKeys: (keyof T)[] = ["updated_at"]
) {
  const now = Date.now();
  defaultDateKeys.forEach((key) => key in data && ((data as any)[key] = now));
}

/**
 * 获取
 * @param db
 * @param table
 * @param params
 * @param defaultData 默认数据，用于清理字段
 * @returns
 */
export function dbGet<K extends keyof TableTypes>(
  db: LowWithLodashType,
  table: K,
  params: Partial<Params>,
  defaultData?: Partial<TableTypes[K]>
) {
  if (params.id) {
    const index = db.chain.get(table).findIndex({ id: params.id }).value();
    return index === -1 ? null : db.data[table][index];
  } else {
    params = { offset: 0, limit: 10, orderBy: "id", ...params };
    const { offset, limit, orderBy, filters } = params as Params;
    let data = db.chain.get(table) as any;

    if (Object.keys(filters).length) {
      const f = defaultData ? _.pick(filters, _.keys(defaultData)) : filters;

      data = data.filter(f);
    }

    data = orderBy.startsWith("-")
      ? data.orderBy(orderBy.slice(1)).reverse()
      : data.orderBy(orderBy);

    return {
      total: data.size().value(),
      data: data.slice(offset, offset + limit).value(),
    };
  }
}

/**
 * 创建
 * @param db
 * @param table
 * @param data
 * @param defaultData
 * @param requireID
 * @param defaultDateKeys
 */
export function dbCreate<
  K extends keyof TableTypes,
  T extends TableTypeWithKey<K>
>(
  db: LowWithLodashType,
  table: K,
  data: Partial<T>,
  defaultData: Partial<T>,
  defaultDateKeys = ["created_at", "updated_at"] as (keyof T)[]
) {
  const maxId = db.chain.get(table).maxBy("id").value();

  data = _.pick(data, Object.keys(defaultData)) as Partial<T>;

  data = {
    ...defaultData,
    ...data,
    id: maxId && "id" in maxId ? maxId.id + 1 : initID,
  };

  dbDateCreate(data as T, defaultDateKeys);
  db.data[table].push(data as any);
  db.write();
  return "id" in data ? data.id : null;
}

/**
 * 更新
 * @param db
 * @param table
 * @param data
 * @param defaultData 默认数据，用于清理字段
 * @param defaultDateKeys
 */
export function dbUpdate<
  K extends keyof TableTypes,
  T extends TableTypeWithKey<K>
>(
  db: LowWithLodashType,
  table: K,
  data: Partial<T>,
  defaultData?: Partial<T>,
  defaultDateKeys = ["updated_at"] as (keyof T)[]
) {
  const id = data.id;
  if (!id) {
    throw new Error("id 是必须的");
  }

  if (defaultData) {
    data = _.pick(data, ["id", ...Object.keys(defaultData)]) as Partial<T>;
  }

  data.updated_at = Date.now();

  const index = db.chain
    .get(table)
    .findIndex({ id: data.id as number })
    .value();

  if (index === -1) return null;

  db.data[table][index] = { ...db.data[table][index], ...data };
  db.write();
  return data;
}

/**
 * 删除
 */
export function dbDelete<K extends keyof TableTypes>(
  db: LowWithLodashType,
  table: K,
  id: number
) {
  if (!id) {
    throw new Error("id 是必须的");
  }

  const index = db.chain.get(table).findIndex({ id }).value();

  if (index === -1) return null;

  db.data[table].splice(index, 1);
  db.write();
  return id;
}

// ====================
// 批量操作
// ====================

/**
 * 批量创建
 * @param db
 * @param table
 * @param datas
 * @param defaultData
 */
export function dbBatchCreate<
  K extends keyof TableTypes,
  T extends TableTypeWithKey<K>
>(
  db: LowWithLodashType,
  table: K,
  datas: Partial<T>[],
  defaultData: Partial<T>
) {
  const maxId = db.chain.get(table).maxBy("id").value();
  const now = Date.now();
  const ids = datas.map((d, i) => {
    d = _.pick(d, Object.keys(defaultData)) as Partial<T>;
    d = {
      ...d,
      id: maxId && "id" in maxId ? maxId.id + i : i + initID,
      created_at: now,
      updated_at: now,
    };

    if (!("id" in d) || !d.id) {
      throw new Error("id 生成失败");
    }

    return d.id;
  });

  db.data[table].push(...(Array.from(datas) as any[]));
  db.write();
  return ids;
}

// 批量更新
export function dbBatchUpdate<
  K extends keyof TableTypes,
  T extends TableTypeWithKey<K>
>(
  db: LowWithLodashType,
  table: K,
  datas: Partial<T>[],
  defaultData: Partial<T>
) {
  const now = Date.now();
  const keys = Object.keys(defaultData);
  datas.forEach((d) => {
    if (!d.id) {
      throw new Error("id 是必须的");
    }

    d = _.pick(d, ["id", ...keys]) as Partial<T>;
    d = { ...d, updated_at: now };

    const index = db.chain
      .get(table)
      .findIndex({ id: d.id as number })
      .value();

    if (index === -1) return null;

    db.data[table][index] = { ...db.data[table][index], ...d };
  });

  db.write();
  return datas.map((d) => d.id);
}
