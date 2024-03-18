import dayjs from "dayjs";

export type DatetimeReturnStr = "today" | "future" | "past";
export type DatetimeReturnObj = Record<"today" | "future" | "past", boolean>;

export type DatetimeReturn = DatetimeReturnStr | DatetimeReturnObj;

/**
 * 判断时间类型
 * @param datetime
 * @returns
 */
export function datetimeType(
  datetime: string | number,
  returnString = false
): DatetimeReturn {
  const now = dayjs();
  const date = dayjs(datetime);
  if (!date.isValid()) {
    throw new Error("无效的时间");
  }

  return returnString
    ? date.isSame(now, "day")
      ? "today"
      : date.isAfter(now)
      ? "future"
      : "past"
    : {
        today: date.isSame(now, "day"),
        future: date.isAfter(now),
        past: date.isBefore(now),
      };
}
