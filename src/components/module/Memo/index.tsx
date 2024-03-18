"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import dayjs from "dayjs";
import { Carousel, Divider, Flex, Popover, Row, Space, Tag } from "antd";
import {
  DatetimeReturnObj,
  DatetimeReturnStr,
  Params,
  RequestGetList,
  datetimeType,
  request,
} from "@/utils";
import Clock from "@/components/common/Clock";
import _ from "lodash";
import { MemoType } from "@/db/types";
import VirtualList from "rc-virtual-list";

const getMemos = async (
  params: Partial<Params>
): Promise<RequestGetList<MemoType>> => {
  const res = await request.get("/memo/home", { params });
  if (res) {
    return res as unknown as RequestGetList<MemoType>;
  } else {
    throw new Error("获取备忘失败");
  }
};

export function LatestMemos() {
  const [memos, setMemos] = useState<MemoType[]>([]);
  const [height, setHeight] = useState(0);

  const mounted = useRef(false);
  const current = useRef(0);
  const total = useRef(0);
  const isBottom = useRef(false);

  const limit = 10;

  // 自动获取
  const handleMemos = async () => {
    if (isBottom.current) return;
    const cur = current.current;
    return await getMemos({
      offset: cur * limit,
      limit,
      orderBy: "datetime",
    }).then((res) => {
      if (res.total) {
        total.current = res.total;
        current.current += 1;
        if (cur * limit >= res.total) {
          isBottom.current = true;
        }
      }
      setMemos([...memos, ...res.data]);
      return res.data;
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLElement, UIEvent>) => {
    if (
      Math.abs(
        e.currentTarget.scrollHeight -
          e.currentTarget.scrollTop -
          e.currentTarget.clientHeight
      ) < 10
    ) {
      handleMemos();
    }
  };

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const func = async () => {
      const d = await handleMemos();
      if (!d) return;
      const minHeight = Math.min(400, Math.min(d.length, 10) * 20);
      setHeight(minHeight);
    };

    func();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {memos.length && (
        <Space direction="vertical">
          <Divider
            orientation="left"
            orientationMargin="0"
            style={{
              margin: "0",
            }}
          >
            <span className="color-60 fontsize-80">备忘</span>
          </Divider>
          <VirtualList
            itemKey="id"
            height={height}
            data={memos}
            onScroll={handleScroll}
          >
            {(memo: MemoType, index: number) => (
              <Space
                key={memo.id}
                className="padding-20"
                style={{
                  paddingRight: "1rem",
                }}
              >
                <Tag
                  bordered={false}
                  color={
                    {
                      today: "red",
                      future: "cyan",
                      past: "blue",
                    }[datetimeType(memo.datetime, true) as DatetimeReturnStr]
                  }
                >
                  <span>{dayjs(memo.datetime).format("YY-MM-DD HH:mm")}</span>
                </Tag>

                <p className="pointer color-60">{memo.title}</p>

                <p className="pointer color-60">{memo.content}</p>
                {/* <Popover placement="right" content={<p>{memo.content}</p>}>
                  <p className="pointer color-60">{memo.title}</p>
                </Popover> */}
              </Space>
            )}
          </VirtualList>
        </Space>
      )}
    </>
  );
}

/**
 * 走马灯版
 * @returns
 */
export function LatestMemosCarousel() {
  const [memos, setMemos] = useState<MemoType[]>([]);
  const [height, setHeight] = useState(0);
  const [index, setIndex] = useState(0);

  const mounted = useRef(false);
  const current = useRef(0);
  const total = useRef(0);
  const isBottom = useRef(false);

  const limit = 10;

  // 自动获取
  const handleMemos = async () => {
    if (isBottom.current) return;
    const cur = current.current;
    return await getMemos({
      offset: cur * limit,
      limit,
      orderBy: "datetime",
    }).then((res) => {
      if (res.total) {
        total.current = res.total;
        current.current += 1;
        if (cur * limit >= res.total) {
          isBottom.current = true;
        }
      }
      setMemos([...memos, ...res.data]);
      return res.data;
    });
  };

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const func = async () => {
      const d = await handleMemos();
      if (!d) return;
      const minHeight = Math.min(400, Math.min(d.length, 10) * 20);
      setHeight(minHeight);
    };

    func();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((index) => (index + 1) % memos.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [memos.length]);

  return (
    <Carousel dotPosition="left" autoplay dots={false}>
      {memos.map((memo) => (
        <div key={memo.id} className="padding-20">
          <Tag
            bordered={false}
            color={
              {
                today: "red",
                future: "cyan",
                past: "blue",
              }[datetimeType(memo.datetime, true) as DatetimeReturnStr]
            }
          >
            <span>{dayjs(memo.datetime).format("YY-MM-DD HH:mm")}</span>
          </Tag>

          <span className="color-60">&ensp; {memo.title} &ensp;</span>
          <span className="color-40 ellipsis">{memo.content}</span>
        </div>
      ))}
    </Carousel>
  );
}

export default function Memo() {
  return (
    // <Space direction="vertical">
    //   <Clock />
    //   <LatestMemos />
    // </Space>
    <div
      style={{
        width: "500px",
        position: "fixed",
        bottom: "2rem",
        left: "1rem",
      }}
    >
      <LatestMemosCarousel />
    </div>
  );
}
