const config: {
  dbType: "development" | "production";
  dbInit: boolean;
  dbStartID: number;
  dbName: string;
  dbTestName: string;
  api: {
    port: number;
  };
} = {
  dbName: "db.json",
  dbTestName: "dbtest.json",
  dbType: "production", // development | production 将会决定使用哪个数据库
  dbInit: false, // 是否每次启动都重新初始化数据库，将会删除当前数据库！！！
  dbStartID: 1000000,
  api: {
    port: 3000, // request.ts 中的端口
  },
};

export default config;
