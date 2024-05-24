import { Application } from "express";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import sessionLoader from "./session";
import discordAppliaction from "./discord";
import Logger from "./logger";

export default async ({ expressApp }: { expressApp: Application }) => {
  await mongooseLoader();
  Logger.info("✌️ mongoose loaded");

  // 아래와 같은 방식들로  params를 던질수가 있다.
  await sessionLoader(expressApp);
  Logger.info("✌️ session loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");

  new discordAppliaction().start();
};
