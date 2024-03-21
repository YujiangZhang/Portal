/**
 * FoldablePageStackProps
 *
 * - pages: T[] - 页面数据
 * - pageKey: K - 页面的键名
 * - renderPage: (page: T, index: number) => React.ReactNode - 渲染页面的函数
 *
 */
export interface FoldablePageStackProps<T, K extends keyof T> {
  pages: T[];
  pageKey: K;
  renderPage: (page: T, index: number) => React.ReactNode;
  children?: React.ReactNode;
}

/**
 * FoldablePageExpendProps
 * - ...FoldablePageStackProps  - 页面数据
 * - secondPart: React.ReactNode - 一直显示的次要部分
 * - children: React.ReactNode - 主内容
 */
export interface FoldablePageExpendProps<T, K extends keyof T>
  extends FoldablePageStackProps<T, K> {
  secondPart?: React.ReactNode;
  children?: React.ReactNode;
}

/**
 * FoldablePageProps
 */
export interface FoldablePageProps<T, K extends keyof T>
  extends FoldablePageExpendProps<T, K> {}
