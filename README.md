## 介绍

用作浏览器主页

- 书签
  - 展示效果不好
- 备忘
  - 移动顺序存在一些问题
- 设置/管理页面
 - 输入控件样式突兀
- 个人信息元素待增加
- 搜索引擎待优化
- 主题定制待完善
- 取消文档功能
  - 使用更专业的工具

## 开始

```sh
yarn install

yarn run dev
```

## build

注意 config.ts 下的 api 端口为 3000

```sh
yarn run build
# 确保 api 可访问
yarn run start -p 3000
```

> 如果是 export，则需要处理 `/src/pages/api` 与 `/src/db` 到 `/out`
