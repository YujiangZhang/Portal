"use client";

import FoldableBasePage from "./BasePage";
import FoldablePagesStack from "./PagesStack";
import { FoldablePageProps } from "./types";
import style from "./index.module.css";
import { useCallback, useEffect, useState } from "react";

/**
 * 没有 children 和 parentDomPosition 时，自动设置该组件的父元素为 relative
 *
 * 存在 children 且没有 parentDomPosition 时，该组件的根元素为 relative
 *
 * 如果 parentDomPosition 为 null，则不设置任何层级的 position
 */
export default function FoldablePage<
  T extends Record<string, any>,
  K extends keyof T
>({
  flex = { main: 1, page: 1 },
  autoFlex,
  children,
  ...stackPages
}: FoldablePageProps<T, K>) {
  const [mainWidthPercent, setMainWidthPercent] = useState(50);


  useEffect(() => {
    let wp = mainWidthPercent;
    if (stackPages.pages.length === 0) {
      wp = (flex.main / (flex.main + flex.page)) * 100;
    } else {
      if (!autoFlex) return;
      wp = (autoFlex.main / (autoFlex.main + autoFlex.page)) * 100;
    }

    wp !== mainWidthPercent && setMainWidthPercent(wp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stackPages.pages]);

  return (
    <FoldablePagesStack
      {...{
        ...stackPages,
        pageMotionProps: {
          ...stackPages.pageMotionProps,
          animate: {
            width: `${100 - mainWidthPercent}%`,
            left: "0",
          },
        },
        pageLastMotionAnimation: {
          width: `${100 - mainWidthPercent}%`,
          left: `${mainWidthPercent}%`,
        },
      }}
    >
      <FoldableBasePage
        title={"header"}
        motionProps={{
          className: style.pagestack,
          layout: true,
          animate: {
            width: `${mainWidthPercent}%`,
          },
        }}
      >
        {children}
      </FoldableBasePage>
    </FoldablePagesStack>
  );
}
