import { ForwardRefComponent, HTMLMotionProps } from "framer-motion";
import React from "react";

// 页面基础组件
export type FoldableBasePageProps<
  T,
  K extends keyof T
> = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
  onBack?: () => void;
  title?: React.ReactNode | string;
  header?: React.ReactNode | boolean;
  motionProps?: HTMLMotionProps<"div">;
};

// 页面堆栈
export interface FoldablePagesStackProps<T, K extends keyof T> {
  pages: T[];
  pageKey: K;
  renderPage: (page: T, index: number) => React.ReactNode;
  setPages?: React.Dispatch<React.SetStateAction<T[]>>;
  pageTitle?: ((page: T, index: number) => React.ReactNode) | string;
  pageHeader?: ((page: T, index: number) => React.ReactNode) | boolean;

  parentDomPosition?:
    | "relative"
    | "absolute"
    | "fixed"
    | "static"
    | undefined
    | null;

  children?: React.ReactNode;

  pageMotionProps?: HTMLMotionProps<"div">;
  pageMotionPropsFunc?: (page: T, index: number) => HTMLMotionProps<"div">;
}

// 可折叠页面
export interface FoldablePageProps<T, K extends keyof T>
  extends FoldablePagesStackProps<T, K> {
  secondaryPage?: React.ReactNode;
  flex?: Record<"main" | "page", number>;
  autoFlex?: Record<"main" | "page", number>;
  children?: React.ReactNode;
}
