import fs from "fs";
import path from "path";
import ReinforcementModel from "../models/reinforcement";
import mongoose from "mongoose";

export default class ReinforcementUtil {
  // 강화 기본 데이터 추가 . json에 적어놓음.
  static async addInitData() {
    try {
      const dataPath = path.join(__dirname, "../models/reinforcementData.json");
      const jsonData = await fs.readFileSync(dataPath, "utf-8");
      const reinforcements = JSON.parse(jsonData);

      // 기존에 있던 데이터 삭제
      await ReinforcementModel.deleteMany({});

      for (const reinforcement of reinforcements) {
        const reinforcementDoc = new ReinforcementModel(reinforcement);
        await reinforcementDoc.save();
      }

      console.log("Reinforcement data has been successfully added.");
    } catch (error) {
      console.error("Error adding reinforcement data:", error);
    }
  }
}
