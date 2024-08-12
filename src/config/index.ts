import dotenv from "dotenv";

// 환경에 따라 다른 .env 파일을 로드
const NODE_ENV = process.env.NODE_ENV || "development";

dotenv.config({
  path: `.env.${NODE_ENV}`, // 환경에 따라 .env 파일 선택
});

if (!process.env.PORT) {
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: process.env.PORT,
  databaseURL: process.env.MONGODB_URL,
  sessionKey: process.env.SESSION_KEY,
  FrontEndURL: process.env.FRONT_END_URL,
  BdoMarketURL: process.env.BDOMARKET_URL,
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID,
  DISCORD_REDIRECT_URL: process.env.DISCORD_REDIRECT_URL,
  DISCORD_APPLICATION_SECRET: process.env.DISCORD_APPLICATION_SECRET,
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN,
};
