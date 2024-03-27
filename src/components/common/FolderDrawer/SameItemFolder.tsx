"use client";

import { PanInfo, Reorder, useDragControls } from "framer-motion";
import FolderDrawer, { FolderDrawerProps } from ".";
import React, { useCallback, useEffect, useRef, useState } from "react";
import style from "./SameItemFolder.module.css";
import { findMovedElement } from "@/utils";
import _ from "lodash";

export type FolderType = {
  [key: string]: any;
  children: FolderType[];
};

export type RenderFolderProps<T> = {
  folder: T;

  folderItemKey: string;

  renderFolderItem: (folderItem: T, index: number) => React.ReactNode;
  onDragEnd?: (
    folder: T,
    key: any,
    pos: Record<"from" | "to", number>,
    arr: T[]
  ) => void;
  blankRender?: (folder: T) => React.ReactNode;

  styles?: {
    ul: React.CSSProperties;
    li: React.CSSProperties;
  };
};

export type SameEditFolderProps<T> = {
  items: T[];
  setItems: React.Dispatch<React.SetStateAction<T[]>>;
  title?: string | React.ReactNode; // 主屏幕的标题
  autoFlex?: boolean | Record<"main" | "folders", number>;
  flex?: {
    main: number;
    folders: number;
  };
  children?: React.ReactNode;
  // folderTitleKey?: string; // 每个屏幕的标题
  folderTitle?: (folder: T, index: number) => React.ReactNode; // 每个屏幕的标题
} & Omit<RenderFolderProps<any>, "folder">;

export default function SameEditFolder<T extends FolderType>({
  items,
  setItems,
  folderItemKey,
  renderFolderItem,
  title,
  folderTitle,

  children,
  blankRender,

  onDragEnd,

  autoFlex = false,
  flex = { main: 1, folders: 1 },

  styles = {
    ul: {},
    li: {},
  },
}: SameEditFolderProps<T>) {
  return (
    <FolderDrawer
      autoFlex={autoFlex}
      folderKey={folderItemKey}
      folders={items}
      setFolders={setItems}
      flex={flex}
      renderFolder={(folder, index) => (
        <RenderFolder
          folder={folder}
          folderItemKey={folderItemKey}
          renderFolderItem={renderFolderItem}
          blankRender={blankRender}
          onDragEnd={onDragEnd}
          styles={styles}
        ></RenderFolder>
      )}
      title={title}
      folderTitle={
        folderTitle ? (folder, index) => folderTitle(folder, index) : undefined
      }
    >
      {children}
    </FolderDrawer>
  );
}

export function RenderFolder<T extends FolderType>({
  folder,
  folderItemKey,
  renderFolderItem,
  blankRender,
  onDragEnd,
  styles = {
    ul: {},
    li: {},
  },
}: RenderFolderProps<T>) {
  const [folderItems, setFolderItems] = useState(folder.children);
  const originItems = useRef(folder.children);

  useEffect(() => {
    setFolderItems(folder.children);
    originItems.current = folder.children;
  }, [folder, folderItemKey]);

  const handleDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
      event.stopPropagation();
      const info = findMovedElement(
        originItems.current,
        folderItems,
        folderItemKey
      );
      const element = info?.element;
      if (!element) return;
      if (info) {
        onDragEnd &&
          onDragEnd(
            _.omit(folder, "children") as T,
            element[folderItemKey],
            {
              from: info.from!,
              to: info.to!,
            },
            folderItems as T[]
          );
      }
      originItems.current = [...folderItems];
    },
    [folderItems, folderItemKey, onDragEnd, folder]
  );

  const whenDragStart = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent) => {
      event.stopPropagation();
    },
    []
  );

  const whenDragEnd = useCallback(
    (event: MouseEvent | TouchEvent | PointerEvent, _info: PanInfo) => {
      event.stopPropagation();
      handleDragEnd(event, _info);
    },
    [handleDragEnd]
  );

  return (
    <>
      <Reorder.Group
        axis="y"
        values={folderItems}
        onReorder={setFolderItems}
        className={style.ul}
        style={{ ...styles.ul, height: "100%" }}
      >
        {folderItems.length === 0
          ? blankRender && blankRender(folder)
          : folderItems.map((folderItem, index) => (
              <Reorder.Item
                key={folderItem[folderItemKey]}
                value={folderItem}
                style={styles.li}
                onDragStart={whenDragStart}
                onDragEnd={whenDragEnd}
              >
                {renderFolderItem(folderItem as T, index)}
              </Reorder.Item>
            ))}
      </Reorder.Group>
    </>
  );
}
