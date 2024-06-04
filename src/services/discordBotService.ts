import { Interaction } from "discord.js";
import UserModel from "../models/user";
import ItemPriceAlertModel from "../models/itemPriceAlert";
import ItemAPI from "../utils/itemAPI";
import ItemStockModel from "../models/itemStock";

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

  static async update(interaction: Interaction) {
    const {
      guild: { systemChannelId: channelId, name: guildName },
      user: { id: userId },
    } = interaction;

    try {
      // 사용자 priceAlert의 데이터를 모두 가져옴
      const user = await UserModel.findOne({ id: userId }).populate(
        "itemPriceAlerts",
      );

      if (!user) {
        console.log(`User with ID ${userId} not found.`);
        return "사용자를 찾을 수 없습니다.";
      }

      const alerts = user.itemPriceAlerts;
      let alertsToNotify = [];

      // priceAlert에 대해 업데이트를 진행
      await ItemAPI.updateItemStock(alerts);

      // 업데이트된 itemStock을 가져옴.
      const ItemIdentifiers = alerts.map((alert) => ({
        id: alert.itemId,
        sid: alert.itemSid,
      }));

      const updatedItems = await ItemStockModel.find({
        $or: ItemIdentifiers,
      });

      // priceThreshold를 넘은 아이템을 찾고, 알람을 보냄.
      updatedItems.forEach((item) => {
        const alert = alerts.find(
          (alert) => alert.itemId === item.id && alert.itemSid === item.sid,
        );
        // item의 lastSoldPrice가 0보다 크면 이거와 priceThreshold를 비교
        const priceToCompare =
          item.lastSoldPrice > 0 ? item.lastSoldPrice : item.basePrice;
        if (alert && priceToCompare >= alert.priceThreshold) {
          alertsToNotify.push({
            item,
            alert,
          });
        }
      });

      // 알람을 보낼 메시지 구성
      // TODO: 더 예쁘게 꾸미는 방법 아이템 이미지 넣으면 좋을듯.
      if (alertsToNotify.length > 0) {
        let notificationMessage = `🔔 **가격 알림** 🔔\n\n다음 아이템이 설정된 가격에 도달했습니다:\n`;

        alertsToNotify.forEach(({ item, alert }) => {
          const marketPrice =
            item.lastSoldPrice > 0 ? item.lastSoldPrice : item.basePrice;
          notificationMessage += `- **${
            item.name
          }**이(가) 설정된 가격 **${new Intl.NumberFormat().format(
            alert.priceThreshold,
          )}**에 도달했습니다. 현재 가격: **${new Intl.NumberFormat().format(
            marketPrice,
          )}**\n`;
        });

        // 알람을 보낸 priceAlert는 삭제
        const alertIds = alertsToNotify.map(({ alert }) => alert._id);
        await ItemPriceAlertModel.deleteMany({ _id: { $in: alertIds } });

        console.log(
          `Successfully updated price alerts and notified user ${userId}.`,
        );

        return notificationMessage;
      } else {
        console.log(
          `No items reached the price thresholds for user ${userId}.`,
        );
        return "설정된 가격에 도달한 아이템이 없습니다.";
      }
    } catch (error) {
      console.error("Error updating priceAlert:");
      return "가격 알림을 업데이트하는 중 오류가 발생했습니다.";
    }
  }

  // sendPriceAlert(itemName: string, price: number, channelId: string) {}
}
