import { Reorder } from "framer-motion";
import React from "react";
import style from "./index.module.css";
import { LeftOutlined } from "@ant-design/icons";
import _ from "lodash";

export default function FoldDrawer<T extends Record<string, any>>({
  title,
  items,
  setItems,
  renderItem,
  children,
}: {
  title?: string | React.ReactNode | undefined;
  items: T[];
  setItems: (items: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className={style.container}>
      <div className={style.main}>
        {title &&
          (typeof title === "string" ? (
            <div className={style.title}>{title}</div>
          ) : (
            title
          ))}
        <div className={style.mainContent}>{children}</div>
      </div>
      <Reorder.Group axis="x" values={items} onReorder={setItems}>
        {items.map((item, index) => (
          <Reorder.Item
            key={item.key || index}
            value={item}
            className={style.folder}
            initial="initial"
            animate={items.length === index + 1 ? "right" : "left"}
            exit="leave"
            variants={{
              initial: { x: "100%" },
              leave: { x: "100%" },
              right: { x: "0" },
              left: { x: "-100%" },
            }}
          >
            <div className={style.folderHeader}>
              <LeftOutlined
                className={style.back}
                onClick={() => {
                  setItems(_.slice(items, 0, index));
                }}
              />
            </div>
            <div className={style.folderContent}>{renderItem(item, index)}</div>
          </Reorder.Item>
        ))}
      </Reorder.Group>
    </div>
  );
}
