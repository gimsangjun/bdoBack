import { Application } from "express";
import config from "../config";
import session from "express-session";
import connectMongoDBSession from "connect-mongodb-session-quickfix";

export default (app: Application) => {
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

  /**
   * notion - 로그인 기능
   * 링크 - https://whimsical-dugout-2c6.notion.site/ee7d2ffa9e564eaf8be134087b704a15?pvs=4
   */
  app.use(
    session({
      name: "sessionID", //쿠키의 세션ID 담을 이름 (connect.sid가 디폴트), 자동으로 담김.
      store: mongoDBstore, // 세션 저장소. 메모리가 디폴트.
      secret: "some-secret-example", // 쿠키 암호화 키
      resave: false, // // 매 request 마다 세션을 계속 다시 저장하는 것
      saveUninitialized: false, // 세션에 데이터가 추가되기 전까지는 세션 저장소에 저장하지 않음, 즉 로그인 안한 사용자도 세션 저장소에 저장됨.
      // 쿠키 기본값 { path: '/', httpOnly: true, secure: false, maxAge: null }.
      // httpOnly : true이면 해당 쿠키는 클라이언트 측 JavaScript에서 접근할 수 없게됨
      cookie: { secure: false }, // secure 속성이 true로 되어있으면 https에서만 동작하기 떄문에, 쿠키에 세션이 담기지 않음.
    })
  );

  // 세션스토어 에러 체킹용
  mongoDBstore.on("error", function (error) {
    console.error("MongoDBStore2 - MongoDB Connection Error:", error);
  });
};
