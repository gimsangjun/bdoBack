import dotenv from "dotenv";

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || "development";

const envFound = dotenv.config();
if (envFound.error) {
  // This error should crash whole process

  throw new Error("⚠️  Couldn't find .env file  ⚠️");
}

export default {
  port: process.env.PORT || 3000,
  databaseURL: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blackdesert",
  sessionKey: process.env.SESSION_KEY || "helloworld",
  BdoMarketURL: process.env.BDOMARKET_URL,
  DISCORD_APPLICATION_ID: process.env.DISCORD_APPLICATION_ID || "", // application id, client id와 동일
  DISCORD_REDIRECT_URI:
    process.env.DISCORD_REDIRECT_URI || "http://localhost:3000/auth/discord/redirect",
  DISCORD_APPLICATION_SECRET: process.env.DISCORD_APPLICATION_SECRET || "",
  DISCORD_BOT_SECRET: process.env.DISCORD_BOT_SECRET || "", // 튜토리얼의 DISCORD_TOKEN
};
