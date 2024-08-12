import config from "./config";
import express from "express";
import Logger from "./loaders/logger";

async function startServer() {
  const app = express();

  // 위와 아래가 같은 표현
  // TODO: 표현 익히기
  // await require("./loaders").default({ expressApp: app });
  const loader = await import("./loaders");
  await loader.default({ expressApp: app });

  const currentEnvironment = process.env.NODE_ENV;
  const HOST = currentEnvironment === "production" ? "0.0.0.0" : "127.0.0.1";

  Logger.info("Current Environment Configuration:");
  Logger.info(`NODE_ENV: ${currentEnvironment}`);
  Logger.info(`PORT: ${config.port}`);
  Logger.info(`Database URL: ${config.databaseURL}`);
  Logger.info(`Session Key: ${config.sessionKey}`);
  Logger.info(`Front End URL: ${config.FrontEndURL}`);
  Logger.info(`BDO Market URL: ${config.BdoMarketURL}`);
  Logger.info(`Discord App ID: ${config.DISCORD_APPLICATION_ID}`);
  Logger.info(`Discord Redirect URL: ${config.DISCORD_REDIRECT_URL}`);
  Logger.info(`Discord App Secret: ${config.DISCORD_APPLICATION_SECRET}`);
  Logger.info(`Discord Bot Token: ${config.DISCORD_BOT_TOKEN}`);

  app
    .listen(Number(config.port), HOST, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} at ${HOST} 🛡️
      ################################################
    `);
    })
    .on("error", (err) => {
      Logger.error(`Server failed to start: ${err}`);
      process.exit(1);
    });
}

startServer();
