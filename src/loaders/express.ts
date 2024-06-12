import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import ItemRouter from "../api/routes/item";
import ItemFavorityRouter from "../api/routes/itemFavorite";
import ItemPriceAlertRouter from "../api/routes/itemPriceAlert";
import UserRouter from "../api/routes/user";
import ReinforcementRouter from "../api/routes/reinforcementRouter";

export default ({ app }: { app: express.Application }) => {
  app.use(
    cors({
      origin: "http://localhost:3001", // 클라이언트의 origin을 명시적으로 지정
      credentials: true, // handshake과정중에 헤더에 저 옵션이 true로 설정되어 있어서 브라우저가 이를 인식하고 해당 요청에 대해 사용자의 세션 쿠키를 자동으로 포함 시킴
    }),
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱을 위한 미들웨어
  app.use(express.static("public")); // 정적 파일 제공을 위한 미들웨어
  app.use(cookieParser());

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
  app.use("/item/alert", ItemPriceAlertRouter);
  app.use("/item", ItemRouter);
  app.use("/reinforce", ReinforcementRouter);
};
