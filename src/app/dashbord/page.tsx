
import { Suspense } from "react";
import { Spin } from "antd";

export default function Page() {
  return <Suspense fallback={<Spin />}></Suspense>;
}
