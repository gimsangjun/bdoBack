import express from "express";
import config from "../config";
import mongoose from "mongoose";
import { Db } from "mongodb";

export default () => {
  const dbURL = config.databaseURL;
  mongoose.connect(dbURL);
  mongoose.connection.on("connected", () => {
    console.log(`Connected to ${dbURL}`);
  });
  mongoose.connection.on("error", (err) => {
    console.error(`Failed to connect to ${dbURL} `, err);
  });

  // 애플리케이션 종료 시, MongoDB 연결 종료
  process.on("SIGINT", async () => {
    await mongoose.connection.close();
    process.exit(0);
  });
};

// TODO: 아래 코드 분석필요. index.d.ts파일들어가서 알아보기가 힘듬.
// 아래 코드 분석해서, logger잘 적용하면될듯.
// export default async (): Promise<Db> => {
//   const connection = await mongoose.connect(config.databaseURL, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true,
//   });
//   return connection.connection.db;
// };
