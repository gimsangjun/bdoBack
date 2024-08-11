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
  const HOST = currentEnvironment === "production" ? "0.0.0.0" : "localhost";

  Logger.info(`Current NODE_ENV: ${currentEnvironment || "not set"}`); // NODE_ENV가 설정되지 않은 경우 "not set"을 출력
  Logger.info(`App will listen on ${HOST}`);

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
