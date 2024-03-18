"use client";
import { MoonFilled, MoreOutlined } from "@ant-design/icons";
import { ConfigProvider, FloatButton, theme } from "antd";
import { useCallback, useEffect, useState } from "react";

export function ModeLayout({
  menuGroups,
  menuPosition = "bottom",
  children,
}: {
  menuGroups?: React.ReactNode[];
  menuPosition?: "top" | "bottom";
  children: React.ReactNode;
}) {
  const [isDark, setIsDark] = useState(false);

  const handleModeDark = useCallback(
    (dark: boolean = false) => {
      const root = document.documentElement;
      const isDark = root.classList.contains("dark");
      if (isDark) {
        if (dark) return;
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      setIsDark(!isDark);
    },
    [setIsDark]
  );

  const initMode = useCallback(() => {
    const hour = new Date().getHours();
    if (hour >= 17 || hour <= 7) {
      handleModeDark(true);
    }
  }, [handleModeDark]);

  useEffect(() => {
    initMode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
      }}
    >
      {!!menuGroups ? (
        <FloatButton.Group trigger="hover" icon={<MoreOutlined />}>
          <ModeDark onChange={handleModeDark} key="DarkModeMenu" />
          {menuGroups}
        </FloatButton.Group>
      ) : (
        <ModeDark onChange={handleModeDark} key="DarkModeMenu" />
      )}
      {children}
    </ConfigProvider>
  );
}

export default function ModeDark({ onChange }: { onChange: () => void }) {
  return (
    <FloatButton icon={<MoonFilled onClick={() => onChange()} />}></FloatButton>
  );
}
