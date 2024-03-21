"use client";
import { BookMarkGroup, getBookMarkGroups, BookMark } from "@/api/data";
import { Badge, Divider, Drawer, Flex, Space, Tag } from "antd";
import _ from "lodash";
import { useState } from "react";

function BookMarkUnfold({
  bookmarks,
  width,
  divider = false,
}: {
  bookmarks: BookMark[];
  width?: string;
  divider?: boolean;
}) {
  return (
    <>
      <Space wrap style={{ width: width || "auto" }}>
        {bookmarks.map((bookmark) => {
          return (
            <Tag key={bookmark.name} className="pointer">
              <a href={bookmark.url} title={bookmark.name} target="_blank">
                {bookmark.name}
              </a>
            </Tag>
          );
        })}
      </Space>
      {divider && <Divider style={{ margin: ".5em 0" }} />}
    </>
  );
}

function BookMarkFold({
  bookmarkGroup,
  onClick,
}: {
  bookmarkGroup: BookMarkGroup;
  onClick: () => void;
}) {
  return (
    <Badge dot={true} color="blue">
      <Tag className="pointer" onClick={onClick}>
        {bookmarkGroup.name}
      </Tag>
    </Badge>
  );
}

function BookmarkDrawer({
  group,
  open,
  onClose,
}: {
  group: BookMarkGroup;
  open: boolean;
  onClose: () => void;
}) {
  const handleClose = () => {
    onClose();
  };
  return (
    <Drawer
      title={group.name}
      placement="left"
      width={500}
      onClose={handleClose}
      open={open}
    >
      <Space direction="vertical" size={16}>
        {group.bookmarks && !_.isEmpty(group.bookmarks) && (
          <BookMarkUnfold bookmarks={group.bookmarks} width="100%" />
        )}
        {group.children?.map((g) => {
          return (
            <div key={g.name}>
              <Divider plain orientation="left" orientationMargin={0}>
                <span className="color-60">{g.name}</span>
              </Divider>
              <BookMarkUnfold bookmarks={g.bookmarks} />
            </div>
          );
        })}
      </Space>
    </Drawer>
  );
}

export default function BookMark() {
  const bookmarkGroups = getBookMarkGroups();
  const [open, setOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<BookMarkGroup | null>(null);

  return (
    <>
      <Flex justify="center" wrap="wrap" gap="small">
        {bookmarkGroups.map((group, index) => {
          if (group.type === "unfold") {
            return (
              <BookMarkUnfold
                bookmarks={group.bookmarks}
                key={group.name}
                divider
              />
            );
          } else {
            return (
              <BookMarkFold
                bookmarkGroup={group}
                key={group.name + index}
                onClick={() => {
                  setOpen(true);
                  setCurrentGroup(group);
                }}
              />
            );
          }
        })}
      </Flex>
      {!!currentGroup && (
        <BookmarkDrawer
          group={currentGroup}
          open={open}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
