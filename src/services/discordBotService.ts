import { Interaction } from "discord.js";
import UserModel, { IUser } from "../models/user";

export default class DiscordBotService {
  static async login(interaction: Interaction) {
    const {
      guild: { systemChannelId: channelId, name: guildName },
      user: { id: userId },
    } = interaction;

    // userId가 같은 user가 있는지 확인
    try {
      // userId가 같은 user가 있는지 확인
      const user = await UserModel.findOne({ id: userId });
      if (user) {
        // 유저 DB에 discordChannel에 (channelId, guildName)를 추가
        user.discordChannel = { id: channelId, name: guildName };
        await user.save();
        console.log("Discord channel added to user:", user);
      } else {
        console.log("User not found:", userId);
      }
    } catch (error) {
      console.error("Error adding discord channel to user:", error);
    }
  }

  static async logout(interaction: Interaction) {
    const {
      user: { id: userId },
    } = interaction;
    try {
      // userId가 같은 user가 있는지 확인
      const user = await UserModel.findOne({ id: userId });

      if (user) {
        // 유저 DB에 discordChannel을 삭제
        user.discordChannel = undefined;
        await user.save();
        console.log("Discord channel removed from user:", user);
      } else {
        console.log("User not found:", userId);
      }
    } catch (error) {
      console.error("Error removing discord channel from user:", error);
    }
  }

  sendPriceAlert(itemName: string, price: number, channelId: string) {}
}
