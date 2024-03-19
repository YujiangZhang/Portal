"use client";
import { App, ConfigProvider, FloatButton, theme } from "antd";
import {
  SettingOutlined,
  VerticalAlignTopOutlined,
  HomeOutlined,
  MoonFilled,
  MoreOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { hexToRgb, request } from "@/utils";
import { defaultSettings } from "@/db/defaultData";
import { SettingsType } from "@/db/types";

const getSettings = async (): Promise<SettingsType> => {
  const res = await request.get("/settings");
  if (res.data) {
    return res.data;
  } else {
    return defaultSettings();
  }
};

// 悬浮按钮菜单
const MenuGroups: Record<
  string,
  {
    component: React.FC<any>;
    props?: Record<string, any>;
  }
> = {
  setting: {
    component: Setting,
  },
  toTop: {
    component: ToTop,
  },
};

export default function MenuLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, setSettings] = useState<SettingsType>(defaultSettings());
  const [isDark, setIsDark] = useState(false);

  const menus = Object.values(MenuGroups).map((menu, index) => (
    <menu.component key={index} {...menu.props} />
  ));
  const mounted = useRef(false);

  // 控制模式切换
  const handleModeDark = useCallback(
    (dark: boolean = false) => {
      const root = document.documentElement;
      const _isDark = root.classList.contains("dark");
      if (_isDark) {
        if (dark) return;
        root.classList.remove("dark");
      } else {
        root.classList.add("dark");
      }
      setIsDark(!_isDark);
    },
    [setIsDark]
  );

  // 设置
  const handleSettings = useCallback((settings: SettingsType) => {
    const { background, text, color } = settings;
    const backgroundCss = {
      "--background-image": background.useBackgroundImage
        ? `url(${background.backgroundImageUrl})`
        : "none",
      // "--bg-color": hexToRgb(background.backgroundColor, true) as string,
    };
    const textCss = {
      // "--text-color": hexToRgb(text.textColor, true) as string,
      // "--link-color": text.linkColor,
      // "--font-size": `${text.fontSize}px`,
      // "--line-height": `${text.lineHeight}rem`,
    };
    const colorCss = {
      // "--primary-color": color.primaryColor,
      // "--secondary-color": color.secondaryColor,
      // "--accent-color": color.accentColor,
    };
    const root = document.documentElement;
    Object.entries({ ...backgroundCss, ...textCss, ...colorCss }).forEach(
      ([key, value]) => {
        root.style.setProperty(key, value);
      }
    );
  }, []);

  // init
  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;

    const init = async () => {
      const hour = new Date().getHours();
      if (hour >= 17 || hour <= 7) {
        handleModeDark(true);
      }

      // 主题定制
      const _settings = await getSettings();
      setSettings(_settings);
      handleSettings(_settings);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDark
          ? [theme.darkAlgorithm, theme.compactAlgorithm]
          : [theme.defaultAlgorithm, theme.compactAlgorithm],
        // algorithm: [theme.darkAlgorithm, theme.compactAlgorithm],
        token: {
          colorPrimary: settings.color.primaryColor,
        },
      }}
    >
      <App>
        {!!menus.length ? (
          <FloatButton.Group trigger="hover" icon={<MoreOutlined />}>
            <ModeDark onChange={handleModeDark} key="DarkModeMenu" />
            {menus}
          </FloatButton.Group>
        ) : (
          <ModeDark onChange={handleModeDark} key="DarkModeMenu" />
        )}
        {children}
      </App>
    </ConfigProvider>
  );
}

// 模式
function ModeDark({ onChange }: { onChange: () => void }) {
  return (
    <FloatButton icon={<MoonFilled onClick={() => onChange()} />}></FloatButton>
  );
}

// 设置按钮，点击跳转到主页或者设置页面
function Setting() {
  const [href, setSrc] = useState("/dashbord");
  const [icon, setIcon] = useState(<SettingOutlined />);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname) return;
    if (pathname.includes("/dashbord")) {
      setSrc("/");
      setIcon(<HomeOutlined />);
    } else {
      setSrc("/dashbord");
      setIcon(<SettingOutlined />);
    }
  }, [pathname]);

  return <FloatButton icon={icon} onClick={() => router.push(href)} />;
}

// 返回顶部
function ToTop() {
  const [show, setShow] = useState(false);

  const handleToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 0);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return show ? (
    <FloatButton icon={<VerticalAlignTopOutlined />} onClick={handleToTop} />
  ) : null;
}
