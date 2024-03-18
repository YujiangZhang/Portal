import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import { MenuLayout } from "@/components/module";
import React from "react";
import { App } from "antd";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Z",
  description: "浏览器主页",
  icons: "/favicon.ico",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <AntdRegistry>
          <MenuLayout>{children}</MenuLayout>
        </AntdRegistry>
      </body>
    </html>
  );
}
