import { Spin } from "antd";

export default function SpinAlignRight({
  size = "default",
  loading,
  children,
}: {
  size?: "small" | "default" | "large";
  loading: boolean;
  container?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="align-right">
      {loading ? <Spin size={size} style={{ float: "right" }} /> : children}
    </div>
  );
}
