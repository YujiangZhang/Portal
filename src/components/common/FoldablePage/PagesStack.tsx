"use client";

import { FoldableBasePageProps, FoldablePagesStackProps } from "./types";
import React, { useEffect, useRef } from "react";
import { AnimatePresence } from "framer-motion";
import style from "./index.module.css";
import FoldableBasePage from "./BasePage";
import { setParentDomPosition } from "./utils";

/**
 * 没有 children 和 parentDomPosition 时，自动设置该组件的父元素为 relative
 *
 * 存在 children 且没有 parentDomPosition 时，该组件的根元素为 relative
 *
 * 如果 parentDomPosition 为 null，则不设置任何层级的 position
 *
 * 不管如何，都可以通过 pageMotionPropsFunc 来设置页面，覆盖默认的
 */
export default function FoldablePagesStack<
  T extends Record<string, any>,
  K extends keyof T
>({
  pages,
  setPages,
  pageKey,
  renderPage,

  pageTitle,
  pageHeader = true,
  parentDomPosition = undefined,
  pageMotionProps,
  pageMotionPropsFunc,

  children,
}: FoldablePagesStackProps<T, K>) {
  const mounted = useRef(false);

  const handleBack = (_currentPage: T, index: number) => {
    setPages?.(pages.slice(0, index));
  };

  const VirRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (mounted.current || parentDomPosition === null) return;
    mounted.current = true;

    const pos =
      parentDomPosition ||
      (!children && parentDomPosition === undefined ? "relative" : null); // 自动设置 relative

    setParentDomPosition(VirRef, pos);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className={
        !!children && parentDomPosition === undefined
          ? style.pagestackContainer
          : ""
      }
      ref={VirRef}
    >
      {children}
      <AnimatePresence>
        {pages.map((pageItem: T, index: number) => {
          return (
            <FoldableBasePage
              key={pageItem[pageKey] || index}
              motionProps={{
                className: style.pagestack,
                layout: true,
                initial: { left: "100%" },
                exit: { left: "100%" },
                animate: { left: "0" },
                ...pageMotionProps,
                ...(pageMotionPropsFunc &&
                  pageMotionPropsFunc(pageItem, index)),
                style: {
                  ...pageMotionProps?.style,
                  ...pageMotionPropsFunc?.(pageItem, index)?.style,
                },
              }}
              onBack={() => {
                if (!setPages) {
                  console.warn("setPages 没有传入，无法返回上一页");
                  return;
                }
                handleBack(pageItem, index);
              }}
              title={
                (typeof pageTitle === "function"
                  ? pageTitle(pageItem, index)
                  : pageTitle) as FoldableBasePageProps<T, K>["title"]
              }
              header={
                typeof pageHeader === "function"
                  ? pageHeader(pageItem, index)
                  : pageHeader
              }
            >
              {!!renderPage && renderPage(pageItem, index)}
            </FoldableBasePage>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
