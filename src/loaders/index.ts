import { Application } from "express";
import expressLoader from "./express";
import mongooseLoader from "./mongoose";
import sessionLoader from "./session";
import Logger from "./logger";

export default async ({ expressApp }: { expressApp: Application }) => {
  await mongooseLoader();
  Logger.info("✌️ mongoose loaded");

  await sessionLoader();
  Logger.info("✌️ session loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};
