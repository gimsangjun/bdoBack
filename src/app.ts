import express, { Request, Response } from "express";
import config from "./config";
import mongoose from "mongoose";
import cors from "cors";
import ItemRouter from "./api/routes/item";
import ItemFavorityRouter from "./api/routes/itemFavorite";
import UserRouter from "./api/routes/user";
import cookieParser from "cookie-parser";
import session from "express-session";
// TODO: 현재 sesionStore.all이 먹히질않고, 라이브러리 문제(이슈탭에 있음)인데 그 개발자가 업데이트를 안해서 다른 개발자가 임시로 만든거 사용
import connectMongoDBSession from "connect-mongodb-session-quickfix";
import { initializeItems } from "./models/initItem";

const app = express();

// DB 연결
const dbURL = config.databaseURL;
mongoose.connect(dbURL);
mongoose.connection.on("connected", () => {
  console.log(`Connected to ${dbURL}`);
});
mongoose.connection.on("error", (err) => {
  console.error(`Failed to connect to ${dbURL} `, err);
});

// session store 생성
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

// 애플리케이션 종료 시, MongoDB 연결 종료
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  process.exit(0);
});

// DB 초기화
// initializeItems();

// ---------------- 미들웨어 설정 -------------------
app.use(
  cors({
    origin: "http://localhost:3001", // 클라이언트의 origin을 명시적으로 지정
    credentials: true, // handshake과정중에 헤더에 저 옵션이 true로 설정되어 있어서 브라우저가 이를 인식하고 해당 요청에 대해 사용자의 세션 쿠키를 자동으로 포함 시킴
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱을 위한 미들웨어
app.use(express.static("public")); // 정적 파일 제공을 위한 미들웨어
app.use(cookieParser());

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

// 디버깅용
app.use((req: Request, res: Response, next: any) => {
  console.log("HTTP Method:", req.method);
  console.log("Request URL:", req.originalUrl); // 요청 URL 출력
  console.log("Request Body:", req.body); // 요청 바디(body) 출력
  console.log("Cookies:", req.cookies); // 쿠키값 출력
  next(); // 다음 미들웨어로 요청 전달
});

app.use("/auth", UserRouter);
app.use("/item/favorite", ItemFavorityRouter);
app.use("/item", ItemRouter);

const port = config.port;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
