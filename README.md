- 主题定制待完善
- 文档功能待增加

## 开始

```sh
yarn install

yarn run dev
```

## build

注意 config.ts 下的 api 为端口为 3000

```sh
yarn run build
# 确保 api 可访问
yarn run start -p 3000
```

> 如果是 export，则需要处理 `/src/pages/api` 与 `/src/db` 到 `/out`
