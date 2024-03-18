"use client";
import { Post, getPosts } from "@/api/data";
import { Flex, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import style from "./index.module.css";
import Link from "next/link";
import request from "@/api/lib/requests";
import dayjs from "dayjs";

export default function PostList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    // const data = getPosts(2);
    // const res = await request.get("/api/post", { params: { limit: 2 } });
    const res = {
      data: {
        data: [],
      },
    };

    // const res = await request.post("/api/post", { title: "test" });
    // const res = await request.put("/api/post", { id: 1, title: "test2" });
    // const res = await request.delete("/api/post", { params: { id: 1 } });
    if (res.data.data) {
      setPosts(res.data.data);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <section>
      {/* <div className={`color-60`}>最近更新</div>
      <div className={style.posts}>
        {posts.map((post) => (
          <Link key={post.id} href={`#`}>
            <div className={style.card}>
              {post.cover && (
                <div
                  className={style.cover}
                  style={{ backgroundImage: `url(${post.cover})` }}
                ></div>
              )}
              <h3 className={style.title}>{post.title}</h3>
              <div className={style.brief}>
                <p>{post.brief}</p>
                <Flex justify="space-between">
                  <div></div>
                  <div className="color-40">
                    {dayjs(post.updated_at).format("YYYY-MM-DD HH:mm")}
                  </div>
                </Flex>
              </div>
            </div>
          </Link>
        ))}
      </div> */}
    </section>
  );
}
