"use client";
import { use, useEffect, useRef, useState } from "react";
import FoldablePagesStack from "./PagesStack";
import FoldablePage from "./FoldablePage";

export default function Test() {
  const [pages, setPages] = useState([
    {
      id: 1,
      name: "name1",
    },

    {
      id: 2,
      name: "name2",
    },

    {
      id: 3,
      name: "name3",
    },
  ]);

  const handleAdd = () => {
    setPages([
      ...pages,
      {
        id: pages.length + 1,
        name: `name${pages.length + 1}`,
      },
    ]);
  };

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <FoldablePage
        pages={pages}
        setPages={setPages}
        pageKey="id"
        parentDomPosition="relative"
        flex={{ main: 1, page: 1 }}
        autoFlex={{ main: 1, page: 2 }}
        pageMotionProps={{
          style: {
            background: "rgb(var(--bg-color))",
          },
        }}
        pageTitle={(pageItem, index) => (
          <span>
            {pageItem.id} {pageItem.name}
          </span>
        )}
        renderPage={(pageItem, index) => (
          <div
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <span>{pageItem.id}</span>
              <button onClick={handleAdd}>add</button>
            </div>

            <div>{pageItem.name}</div>
          </div>
        )}
        secondaryPage={<p>secondaryPage</p>}
      >
        <div
          onClick={() => {
            handleAdd();
          }}
        >
          增加
        </div>
      </FoldablePage>
    </div>
  );
}
