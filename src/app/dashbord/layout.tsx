"use client";

import { AdminLayout } from "@/components/module";

// import FolderDrawer from "@/components/common/FolderDrawer";
// import { AdminLayout } from "@/components/module";
// import { Button, Card, Flex, Space } from "antd";
// import {
//   RightOutlined,
//   UserOutlined,
//   PaperClipOutlined,
//   BookOutlined,
//   FolderOutlined,
//   ReadOutlined,
//   TagOutlined,
//   SettingOutlined,
//   DoubleRightOutlined,
//   HomeOutlined,
// } from "@ant-design/icons";
// import { motion } from "framer-motion";
// import Link from "next/link";
// import { usePathname, useRouter } from "next/navigation";
// import React, { use, useCallback, useEffect, useRef, useState } from "react";
// import style from "./layout.module.css";
// import { set } from "lodash";
// import _ from "lodash";

// interface AsideMenuType {
//   key: string;
//   path: string;
//   label: string;
//   children?: React.ReactNode;
//   flex: Record<"aside" | "content", number>;
//   // icon: React.ReactNode;
//   active: boolean;
// }

// const flexRoot = {
//   aside: 1,
//   content: 0,
// };
// const flex = {
//   aside: 2,
//   content: 22,
// };

// const AsideMenus = [
//   {
//     key: "post",
//     path: "/dashbord/post",
//     label: "文章",
//     flex: flex,
//     icon: ReadOutlined,

//     active: false,
//   },

//   {
//     key: "bookmark",
//     path: "/dashbord/bookmark",
//     label: "书签",
//     flex: flex,
//     icon: PaperClipOutlined,

//     active: false,
//   },
//   {
//     key: "memo",
//     path: "/dashbord/memo",
//     label: "备忘",
//     flex: flex,
//     icon: TagOutlined,

//     active: false,
//   },

//   {
//     key: "profile",
//     path: "/dashbord/profile",
//     label: "用户",
//     flex: flex,
//     icon: UserOutlined,

//     active: false,
//   },

//   {
//     key: "settings",
//     path: "/dashbord/settings",
//     label: "设置",
//     flex: flex,
//     icon: SettingOutlined,

//     active: false,
//   },
// ];

// const AsideMenusMapPath = new Map(AsideMenus.map((menu) => [menu.path, menu]));

// export default function Layout({
//   children, // will be a page or nested layout
// }: {
//   children: React.ReactNode;
// }) {
//   const [menus, setMenus] = useState(AsideMenus);
//   const [flex, setFlex] = useState(flexRoot);

//   const pathname = usePathname();

//   useEffect(() => {
//     if (!pathname) return;
//     const ls = menus.map((menu) => {
//       return {
//         ...menu,
//         active: menu.path === pathname,
//       };
//     });

//     setMenus(ls);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [pathname]);

//   useEffect(() => {
//     const _flex = AsideMenusMapPath.get(pathname as any)?.flex || flexRoot;
//     setFlex(_flex);
//   }, [flex, pathname]);

//   return (
//     <div className={style.layout}>
//       <motion.div
//         layout
//         className={style.aside}
//         initial={false}
//         animate={flex.aside > flex.content * 2 ? "row" : "column"}
//         variants={{
//           row: {
//             flex: flex.aside,
//             flexDirection: "row",
//             justifyContent: "space-evenly",
//             borderRight: "0",
//           },
//           column: {
//             flex: flex.aside,
//             flexDirection: "column",
//             justifyContent: "space-evenly",
//             borderRight: "1px solid rgba(var(--text-color), 0.1)",
//           },
//         }}
//       >
//         {menus.map((menu) => (
//           <Link href={menu.path} key={menu.key}>
//             <div className={style.menu}>
//               <menu.icon
//                 className={
//                   style.menuIcon +
//                   " " +
//                   (menu.active ? style.menuIconActive : "")
//                 }
//               />
//               <span className={style.menuLabel}>{menu.label}</span>
//             </div>
//           </Link>
//         ))}

//         {pathname !== "/dashbord" ? (
//           <Link href="/dashbord" key="dashbord">
//             <Button icon={<DoubleRightOutlined />} type="text" shape="circle" />
//           </Link>
//         ) : (
//           <Link href="/" key="home" className={style.menu}>
//             <HomeOutlined className={style.menuIcon} />
//             <span className={style.menuLabel}>首页</span>
//           </Link>
//         )}
//       </motion.div>
//       <motion.div
//         layout
//         className={style.content}
//         style={{
//           flex: flex.content,
//         }}
//         initial={false}
//       >
//         {children}
//       </motion.div>
//     </div>
//   );
// }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
