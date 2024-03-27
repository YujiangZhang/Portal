"use client";

import FoldableBasePage from "./BasePage";
import FoldablePagesStack from "./PagesStack";
import { FoldablePageProps } from "./types";
import css from "./index.module.css";
import { useEffect, useMemo, useState } from "react";

/**
 * 没有 children 和 parentDomPosition 时，自动设置该组件的父元素为 relative
 *
 * 存在 children 且没有 parentDomPosition 时，该组件的根元素为 relative
 *
 * 如果 parentDomPosition 为 null，则不设置任何层级的 position
 *
 * 不管如何，都可以通过 pageMotionPropsFunc 来设置页面，覆盖默认的 style
 */
export default function FoldablePage<
  T extends Record<string, any>,
  K extends keyof T
>({
  pages,
  secondaryPage,
  flex = { main: 1, page: 1 },
  autoFlex,
  children,
  ...stackPages
}: FoldablePageProps<T, K>) {
  const [mainWidthPercent, setMainWidthPercent] = useState(50);
  const [pagesLastIndex, setPagesLastIndex] = useState(0);

  useEffect(() => {
    let wp = mainWidthPercent;
    setPagesLastIndex(pages.length - 1);
    if (pages.length === 0) {
      wp = (flex.main / (flex.main + flex.page)) * 100;
    } else {
      if (!autoFlex) return;
      wp = (autoFlex.main / (autoFlex.main + autoFlex.page)) * 100;
    }

    wp !== mainWidthPercent && setMainWidthPercent(wp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pages]);

  const motions = useMemo(() => {
    return {
      lastPage: {
        animate: {
          width: `${100 - mainWidthPercent}%`,
          left: mainWidthPercent + "%",
          borderLeft: "1px solid var(--border-color)",
        },
      },
      page: {
        animate: {
          width: `${100 - mainWidthPercent}%`,
          left: 0,
        },
      },
    };
  }, [mainWidthPercent]);

  return (
    <FoldablePagesStack
      pages={pages}
      pageMotionPropsFunc={(page: T, index: number) => ({
        initial: { left: "100%" },
        exit: { left: "100%" },
        ...(pagesLastIndex !== index ? motions.page : motions.lastPage),
      })}
      {...stackPages}
    >
      <>
        <FoldableBasePage
          header={false}
          motionProps={{
            className: css.pagestack,
            layout: true,
            initial: { left: 0 },
            exit: { left: 0 },
            style: {},
            animate: {
              left: 0,
              width: `${mainWidthPercent}%`,
            },
          }}
        >
          {children}
        </FoldableBasePage>

        {secondaryPage && (
          <FoldableBasePage
            header={false}
            motionProps={{
              className: css.pagestack,
              layout: true,
              initial: { left: 0 },
              exit: { left: 0 },
              ...motions.lastPage,
            }}
          >
            {secondaryPage}
          </FoldableBasePage>
        )}
      </>
    </FoldablePagesStack>
  );
}
