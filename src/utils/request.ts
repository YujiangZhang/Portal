import axios from "axios";

export type { Params } from "@/api/lib/requests";
import config from "@/../config";

export interface RequestGetList<T> {
  data: T[];
  total?: number;
  message: string;
}

// 实例
export const request = axios.create({
  baseURL: `http://localhost:${config.api.port}/api`,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    if (!response.data) {
      response.data = {
        data: null,
        message: "请检查后端返回值",
      };
    }
    return response.data;
  },
  (error) => {
    error.data = {
      data: null,
      message: error.message || "请求失败",
    };

    return Promise.reject(error);
  }
);

export default request;

// ====================
// 防止闪烁
// ====================

/**
 * 防止闪烁，只是防止返回结果太快导致闪烁，内部不会处理
 * 防抖和节流使用 lodash 的 debounce 和 throttle
 * @param delayFunc 将在 delayTime 后执行的函数
 * @param func 立即执行的函数，结果将在 delayTime 后返回
 * @param delayTime 延迟时间
 * @param overTimeFunc 超时后执行的函数
 * @param overTime 超时时间
 * @returns 返回 func 的结果
 */
export async function preventFlickerDelay<T>(
  delayFunc: () => void,
  func: () => Promise<T> | T,
  delayTime = 300,
  overTimeFunc?: () => void,
  overTime = 10000
): Promise<T> {
  let overTimer;
  try {
    const mainPromise = new Promise<() => any>(async (resolve) => {
      const [result] = await Promise.all([
        func(),
        new Promise<void>((resolve) => setTimeout(resolve, delayTime)),
      ]);
      resolve(() => result);
    });

    const overtimePromise = new Promise<() => any>(
      (resolve) =>
        (overTimer = setTimeout(() => {
          resolve(overTimeFunc ? overTimeFunc : () => {});
        }, overTime))
    );

    const result = await Promise.race([mainPromise, overtimePromise]);
    return result();
  } catch (error) {
    console.error("utils 中的 loadingDelay:", error);
    throw error;
  } finally {
    clearTimeout(overTimer);
    delayFunc();
  }
}

/**
 * 防止闪烁，只是防止返回结果太快导致闪烁，内部不会处理
 * 简化了 preventFlickerDelay 的调用
 * @param func 立即执行的函数，结果将在 delayTime 后返回
 * @param delayTime 延迟时间
 * @param overTimeFunc 超时后执行的函数
 * @param overTime 超时时间
 * @returns 返回 func 的结果
 */
export async function preventFlicker<T>(
  func: () => Promise<T> | T,
  delayTime = 300,
  overTimeFunc?: () => void,
  overTime = 10000
): Promise<T> {
  return await preventFlickerDelay(
    () => {},
    func,
    delayTime,
    overTimeFunc,
    overTime
  );
}
