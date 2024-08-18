import mongoose, { Schema, Document } from "mongoose";

export interface IItemPriceAlert extends Document {
  username: string;
  itemName: string;
  itemId: number;
  itemSid: number;
  priceThreshold: number; // 기준가
  alertCondition: "above" | "below"; // 기준가보다 낮을 때 또는 높을 때 알림 설정
}

const ItemPriceAlertSchema: Schema = new Schema({
  username: { type: String, required: true },
  itemName: { type: String, required: true },
  itemId: { type: Number, required: true },
  itemSid: { type: Number, required: true, default: 0 },
  priceThreshold: { type: Number, required: true },
  alertCondition: { type: String, required: true, enum: ["above", "below"] },
});

const ItemPriceAlertModel = mongoose.model<IItemPriceAlert>(
  "ItemPriceAlert",
  ItemPriceAlertSchema,
);

export default ItemPriceAlertModel;
