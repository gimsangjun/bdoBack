import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import geoip from "geoip-lite";
import ItemRouter from "../api/routes/item";
import ItemFavorityRouter from "../api/routes/itemFavorite";
import ItemPriceAlertRouter from "../api/routes/itemPriceAlert";
import UserRouter from "../api/routes/user";
import ReinforcementRouter from "../api/routes/reinforcementRouter";
import config from "../config";
import Logger from "../loaders/logger";

export default ({ app }: { app: express.Application }) => {
  // nginx에서 모두 다 처리했기 때문에 주석처리.
  // app.use(
  //   cors({
  //     origin: config.FrontEndURL, // 클라이언트의 origin을 명시적으로 지정
  //     credentials: true, // handshake과정중에 헤더에 저 옵션이 true로 설정되어 있어서 브라우저가 이를 인식하고 해당 요청에 대해 사용자의 세션 쿠키를 자동으로 포함 시킴
  //   }),
  // );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true })); // URL-encoded 데이터 파싱을 위한 미들웨어
  app.use(express.static("public")); // 정적 파일 제공을 위한 미들웨어
  app.use(cookieParser());

  // 디버깅용
  app.use((req: Request, res: Response, next: any) => {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const geo = geoip.lookup(ip as string);
    const location = geo ? `${geo.city}, ${geo.country}` : "Location unknown";

    Logger.info(`Request received: {
      Method: ${req.method},
      URL: ${req.originalUrl},
      Body: ${JSON.stringify(req.body)},
      Cookies: ${JSON.stringify(req.cookies)},
      IP: ${ip},
      Location: ${location}
    }`);

    next(); // 다음 미들웨어로 요청 전달
  });

  app.use("/auth", UserRouter);
  app.use("/item/favorite", ItemFavorityRouter);
  app.use("/item/alert", ItemPriceAlertRouter);
  app.use("/item", ItemRouter);
  app.use("/reinforcement", ReinforcementRouter);
};
