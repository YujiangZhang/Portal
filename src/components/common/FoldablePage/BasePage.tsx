"use client";

import { FoldableBasePageProps } from "./types";
import React from "react";
import { motion } from "framer-motion";
import { LeftOutlined } from "@ant-design/icons";
import style from "./index.module.css";

/**
 * 最外层使用了 motion.div，相关属性传入到 motionProps 中
 *
 * 如果要使用 className，传入到 motionProps 中
 */
export default function FoldableBasePage<
  T extends Record<string, any>,
  K extends keyof T
>({
  onBack,
  title,
  header = true,
  motionProps = {},
  children,
}: FoldableBasePageProps<T, K>) {
  return (
    <motion.div {...{ className: style.basepage, ...motionProps }}>
      {!!header &&
        (["string", "boolean"].includes(typeof header)
          ? !!header && <PageHeader pageTitle={title} onBack={onBack} />
          : header)}

      <div className={style.content}>{children}</div>
    </motion.div>
  );
}

function PageHeader({
  onBack,
  pageTitle,
}: {
  onBack?: () => void;
  pageTitle?: string | React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={style.header}>
      {!!onBack && (
        <span className={style.back} onClick={onBack}>
          <LeftOutlined />
        </span>
      )}

      {pageTitle}
    </div>
  );
}
