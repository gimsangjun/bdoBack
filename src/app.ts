import express, { Request, Response } from "express";
import config from "./config";
import mongoose from "mongoose";
import cors from "cors";
import ItemRouter from "./api/routes/item";
import UserRouter from "./api/routes/user";
import cookieParser from "cookie-parser";
import session from "express-session";
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
    credentials: true, // TODO: credentials 모드가 'include'인 요청을 허용 ======> 좀더 정확ㅎㅣ알아봐야할듯.
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱을 위한 미들웨어
app.use(express.static("public")); // 정적 파일 제공을 위한 미들웨어
app.use(cookieParser());
app.use(
  session({
    name: "sessionID", //세션쿠키 이름 (connect.sid가 디폴트)
    // store: 세션 저장소. 메모리가 디폴트.
    secret: "some-secret-example", // 쿠키 암호화 키
    resave: false,
    saveUninitialized: true, // 세션에 저장할 내역이 없더라도 세션을 저장할지 여부
    cookie: { secure: true }, // 그냥 express 아니면 브라우저가 session 쿠키값 자동으로 암호화함. false로 하면 암호화된 값 그대로 넘어와서 못씀.
  })
);

// 디버깅용
app.use((req: Request, res: Response, next: any) => {
  console.log("Request URL:", req.originalUrl); // 요청 URL 출력
  console.log("Request Body:", req.body); // 요청 바디(body) 출력
  console.log("Cookies:", req.cookies); // 쿠키값 출력
  next(); // 다음 미들웨어로 요청 전달
});

app.use("/auth", UserRouter);
app.use("/item", ItemRouter);

const port = config.port;
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
