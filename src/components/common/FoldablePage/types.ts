import { ForwardRefComponent, HTMLMotionProps } from "framer-motion";
import React from "react";

export type FoldableBasePageProps<T, K extends keyof T> = {
  children: React.ReactNode;
  onBack?: () => void;
  title?: React.ReactNode | string;
  header?: React.ReactNode | boolean;
  motionProps?: HTMLMotionProps<"div">;
} & React.HTMLAttributes<HTMLDivElement>;

export interface FoldablePagesStackProps<T, K extends keyof T> {
  pages: T[];
  pageKey: K;
  setPages?: React.Dispatch<React.SetStateAction<T[]>>;
  renderPage?: (page: T, index: number) => React.ReactNode;
  pageTitle?: string | ((page: T, index: number) => React.ReactNode);
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
  pageLastMotionAnimation?: HTMLMotionProps<"div">["animate"];
}

export interface FoldablePageProps<T, K extends keyof T>
  extends FoldablePagesStackProps<T, K> {
  flex?: Record<"main" | "page", number>;
  autoFlex?: Record<"main" | "page", number>;
  children?: React.ReactNode;
}
