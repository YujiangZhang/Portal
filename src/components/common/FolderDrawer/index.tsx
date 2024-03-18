import style from "./index.module.css";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { LeftOutlined } from "@ant-design/icons";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import _, { set } from "lodash";

/**
 * 动画：framer-motion
 * 不使用 antd 布局
 * 背景和字体颜色是全局 css
 * TODO: 加上小屏幕的适配
 */

export type FolderDrawerProps<T> = {
  folderKey: string;
  folders: T[];
  setFolders: React.Dispatch<React.SetStateAction<T[]>>;
  renderFolder: (folder: T, index: number) => React.ReactNode;
  title?: React.ReactNode | string | undefined;
  folderTitle?: (folder: T, index: number) => React.ReactNode;
  autoFlex?: boolean | Record<"main" | "folders", number>;
  flex?: {
    main: number;
    folders: number;
  };
  styles?: {
    main?: React.CSSProperties;
    mainContent?: React.CSSProperties;
    folders?: React.CSSProperties;
    foldersContent?: React.CSSProperties;
  };
  children?: React.ReactNode;
};

/**
 * 折叠屏幕
 * props:
 * - folderKey - 唯一标识的键名
 * - folders - 数据列表
 * - renderFolder - 渲染每个 folder 的函数
 * - onBack - 返会点击层级的上一层时触发
 * - title - 标题
 * - autoFlex - 是否自动调整宽度，当存在 folder 时，自动调整宽度
 * - flex - 比值，可根据需要调整，会自动计算，动态设置该值时，最好设置 autoFlex = false
 * - styles - 样式，建议只用于设置背景、padding
 * - children - 主内容
 */
export default function FolderDrawer<T extends Record<string, any>>({
  folderKey,
  folders,
  setFolders = () => {},
  renderFolder,

  title,
  folderTitle,

  autoFlex = false,
  flex = { main: 1, folders: 1 },
  styles = {},

  children,
}: FolderDrawerProps<T>) {
  const [folderWidthPercent, setfolderWidthPercent] = useState(50);
  const [flexInner, setFlexInner] = useState(flex);

  const [maxLevel, setMaxLevel] = useState(0);

  // 高度
  const [mainContentHeight, setMainContentHeight] = useState<string>("100%");
  const [folderContentHeight, setFolderContentHeight] =
    useState<string>("100%");
  const MainContent = useRef<HTMLDivElement>(null);
  const FolderContent = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const mainContentTop = MainContent.current?.getBoundingClientRect().top;
    const folderContentTop = FolderContent.current?.getBoundingClientRect().top;
    const resize = () => {
      mainContentTop &&
        setMainContentHeight(`${window.innerHeight - mainContentTop}px`);
      folderContentTop &&
        setFolderContentHeight(`${window.innerHeight - folderContentTop}px`);
    };
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // 数据自动变化
  useEffect(() => {
    setMaxLevel(folders.length);

    if (!autoFlex) {
      setFlexInner(flex);
    } else if (folderWidthPercent <= 50 && folders.length > 0) {
      typeof autoFlex === "boolean"
        ? setFlexInner({ main: 1, folders: 2 })
        : setFlexInner(autoFlex);
    } else if (folders.length === 0) {
      setFlexInner({ ...flex });
    }

    // folder 内容高度
    if (folderContentHeight === "100%" && folders.length > 0) {
      const folderContentTop =
        FolderContent.current?.getBoundingClientRect().top;
      folderContentTop &&
        setFolderContentHeight(`${window.innerHeight - folderContentTop}px`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders]);

  // folderWidthPercent 变化
  useEffect(() => {
    setfolderWidthPercent(
      (flexInner.folders / (flexInner.main + flexInner.folders)) * 100
    );
  }, [flexInner]);

  const handleBack = (index: number) => {
    if (index === 0) {
      setFolders([]);
    } else {
      setFolders(folders.slice(0, index));
    }
  };

  return (
    <div className={style.container}>
      <motion.div
        layout
        key="main"
        className={style.main}
        style={{
          ...styles.main,
          flex: flexInner.main,
        }}
        initial={false}
        animate={{ width: [null, `${100 - folderWidthPercent}%`] }}
      >
        {!!title &&
          (typeof title === "string" ? (
            <div className={style.title}>{title}</div>
          ) : (
            title
          ))}
        <div
          className={style.mainContent}
          style={{ ...styles.mainContent, height: mainContentHeight }}
          ref={MainContent}
        >
          {children}
        </div>
      </motion.div>
      <motion.div
        layout
        key="folders"
        className={style.folders}
        style={{
          ...styles.folders,
          flex: flexInner.folders,
          width: `${folderWidthPercent}%`,
        }}
        initial={false}
      >
        <AnimatePresence>
          {folders.map((el, index) => {
            return (
              <motion.div
                layout
                key={el[folderKey] || index}
                className={style.folder}
                style={{
                  zIndex: index + 1,
                  width: `${folderWidthPercent}%`,
                }}
                initial={{ left: "100%" }}
                animate={{
                  left:
                    index + 1 === maxLevel
                      ? `${100 - folderWidthPercent}%`
                      : "0",
                }}
                exit={{ left: "100%" }}
              >
                <div className={style.folderHeader}>
                  <LeftOutlined
                    onClick={() => handleBack(index)}
                    className={style.folderBack}
                  />
                  &ensp;
                  <div className={style.folderHeaderContent}>
                    {folderTitle &&
                      (typeof el === "string" ? el : folderTitle(el, index))}
                  </div>
                </div>
                <div
                  ref={FolderContent}
                  className={style.folderContent}
                  style={{ height: folderContentHeight }}
                >
                  {renderFolder(el, index)}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
