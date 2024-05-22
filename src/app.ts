import config from "./config";
import express from "express";
import Logger from "./loaders/logger";

async function startServer() {
  const app = express();

  // 위와 아래가 같은 표현
  // await require("./loaders").default({ expressApp: app });
  const loader = await import("./loaders");
  await loader.default({ expressApp: app });

  app
    .listen(config.port, () => {
      Logger.info(`
      ################################################
      🛡️  Server listening on port: ${config.port} 🛡️
      ################################################
    `);
    })
    .on("error", (err) => {
      Logger.error(err);
      process.exit(1);
    });
}

startServer();
