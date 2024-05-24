import { Request, Response } from "express";
import UserModel from "../models/user";
import ItemPriceAlertModel from "../models/itemPriceAlert";
// 사용자 가격알림 리턴
export const getItemPriceAlerts = async (req: Request, res: Response) => {
  const { username } = req.session.user;

  try {
    const user = await UserModel.findOne({ username }).populate(
      "itemPriceAlerts",
    );

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    return res.status(200).json({ itemPriceAlerts: user.itemPriceAlerts });
  } catch (error) {
    console.error("Error get user priceAlert", error);
    res.status(500).json({ message: "가격알림 가져오기 에러" });
  }
};

// 사용자 가격 알림 추가
export const addItemPriceAlert = async (req: Request, res: Response) => {
  const { username } = req.session.user;
  const { itemName, itemId, itemSid, priceThreshold } = req.body;

  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const newItemPriceAlert = new ItemPriceAlertModel({
      username,
      itemName,
      itemId,
      itemSid,
      priceThreshold,
    });

    await newItemPriceAlert.save();

    user.itemPriceAlerts.push(newItemPriceAlert._id);
    await user.save();

    return res.status(201).json({ itemPriceAlert: newItemPriceAlert });
  } catch (error) {
    console.error("Error adding price alert", error);
    res.status(500).json({ message: "가격알림 추가 에러" });
  }
};

// 사용자 가격 알림 수정
// 사용자 가격 알림 수정
export const updateItemPriceAlert = async (req: Request, res: Response) => {
  const { username } = req.session.user;
  const { alertId, priceThreshold } = req.body;

  try {
    const user = await UserModel.findOne({ username }).populate(
      "itemPriceAlerts",
    );

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const alert = await ItemPriceAlertModel.findById(alertId);

    if (!alert) {
      throw new Error("가격 알림을 찾을 수 없습니다.");
    }

    if (alert.username !== username) {
      throw new Error("권한이 없습니다.");
    }

    alert.priceThreshold = priceThreshold;
    await alert.save();

    return res.status(200).json({ itemPriceAlert: alert });
  } catch (error) {
    console.error("Error updating price alert", error);
    res.status(500).json({ message: "가격알림 수정 에러" });
  }
};

// 사용작 가격 알림 삭제
// 사용자 가격 알림 삭제
export const deleteItemPriceAlert = async (req: Request, res: Response) => {
  const { username } = req.session.user;
  const { alertId } = req.body;

  try {
    const user = await UserModel.findOne({ username }).populate(
      "itemPriceAlerts",
    );

    if (!user) {
      throw new Error("사용자를 찾을 수 없습니다.");
    }

    const alert = await ItemPriceAlertModel.findById(alertId);

    if (!alert) {
      throw new Error("가격 알림을 찾을 수 없습니다.");
    }

    if (alert.username !== username) {
      throw new Error("권한이 없습니다.");
    }

    await ItemPriceAlertModel.findOneAndDelete({ _id: alertId });

    user.itemPriceAlerts = user.itemPriceAlerts.filter(
      (alertId) => alertId.toString() !== alert._id.toString(),
    );
    await user.save();

    return res.status(200).json({ message: "가격 알림이 삭제되었습니다." });
  } catch (error) {
    console.error("Error deleting price alert", error);
    res.status(500).json({ message: "가격알림 삭제 에러" });
  }
};
