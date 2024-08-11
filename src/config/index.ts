import dotenv from "dotenv";

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process
  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

// 개발 환경이 명시적으로 설정되지 않았다면 'development'로 설정
process.env.NODE_ENV = process.env.NODE_ENV || "development";

// HOST 변수 설정: 프로덕션 환경이면 모든 인터페이스에서 접근 가능하게, 그 외는 localhost
const HOST = process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1";

export default {
  port: process.env.PORT || 3000,
  databaseURL:
    process.env.NODE_ENV === "production"
      ? process.env.MONGODB_URI ||
        "mongodb://default-production-uri:27017/blackdesert"
      : `mongodb://${HOST}:27017/blackdesert`,
  sessionKey: process.env.SESSION_KEY,

  BdoMarketURL: process.env.BDOMARKET_URL,
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID, // application id, client id와 동일
  DISCORD_REDIRECT_URI:
    process.env.DISCORD_REDIRECT_URI ||
    `http://localhost:${process.env.PORT || 3000}/auth/discord/redirect`,
  DISCORD_APPLICATION_SECRET: process.env.DISCORD_APPLICATION_SECRET,
  DISCORD_BOT_TOKEN: process.env.DISCORD_BOT_TOKEN, // 튜토리얼의 DISCORD_TOKEN
};
