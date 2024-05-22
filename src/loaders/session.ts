import config from "../config";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session-quickfix";
import express from "./express";

export default () => {
  const dbURL = config.databaseURL;

  const MongoDBStore = connectMongoDBSession(session);
  const mongoDBstore = new MongoDBStore(
    {
      uri: dbURL,
      databaseName: "blackdesert",
      collection: "bdoSessions",
    },
    function (error) {
      if (error) {
        console.error("MongoDBStore1 - MongoDB Connection Error:", error);
      }
    }
  );

  // 세션스토어 에러 체킹용
  mongoDBstore.on("error", function (error) {
    console.error("MongoDBStore2 - MongoDB Connection Error:", error);
  });
};
