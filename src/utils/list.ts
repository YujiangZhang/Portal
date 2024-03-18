import _ from "lodash";

/**
 * 找出移动的元素
 */
export function findMovedElement<T extends Record<string, any>>(
  oldArray: T[],
  newArray: T[],
  key: keyof T
): {
  element: T | undefined;
  from: number | undefined;
  to: number | undefined;
} {
  let element;
  let from: number | undefined;
  let to: number | undefined;

  const length = newArray.length;
  for (let i = 0; i < length; i++) {
    if (oldArray[i][key] !== newArray[i][key]) {
      from = i;
      break;
    }
  }

  if (from === undefined) return { element, from, to };

  if (oldArray[from][key] === newArray[from + 1][key]) {
    element = newArray[from];
    to = from;
    from = _.findIndex(
      oldArray,
      (o) => o[key] === newArray[from as number][key]
    );
  } else {
    element = oldArray[from];
    to = _.findIndex(newArray, (o) => o[key] === oldArray[from as number][key]);
  }

  for (let i = from + 1; i < length; i++) {
    if (oldArray[from][key] === newArray[i][key]) {
      to = i;
      break;
    }
  }

  return { element, from, to };
}

export function findMovedElementLCS<T extends Record<string, any>>(
  oldArray: T[],
  newArray: T[],
  key: keyof T
): {
  element: T | undefined;
  from: number | undefined;
  to: number | undefined;
} {
  const m = oldArray.length;
  const n = newArray.length;

  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    for (let j = 0; j <= n; j++) {
      dp[i][j] = 0;
    }
  }

  // 计算最长公共子序列的长度
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (oldArray[i - 1][key] === newArray[j - 1][key]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }

  // 通过最长公共子序列长度回溯找到移动的元素及其位置
  let i = m;
  let j = n;
  let element: T | undefined;
  let from: number | undefined;
  let to: number | undefined;

  while (i > 0 && j > 0) {
    if (oldArray[i - 1][key] === newArray[j - 1][key]) {
      i--;
      j--;
    } else if (dp[i - 1][j] > dp[i][j - 1]) {
      element = oldArray[i - 1];
      from = i - 1;
      i--;
    } else {
      element = newArray[j - 1];
      to = j - 1;
      j--;
    }
  }

  return { element, from, to };
}
