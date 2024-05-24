import mongoose, { Schema, Document } from "mongoose";
export interface IItemPriceAlert extends Document {
  username: string;
  itemName: string;
  itemId: number;
  itemSid: number;
  priceThreshold: number;
}

const ItemPriceAlertSchema: Schema = new Schema({
  username: { type: String, required: true },
  itemName: { type: String, required: true },
  itemId: { type: Number, required: true },
  itemSid: { type: Number, required: true, default: 0 },
  priceThreshold: { type: Number, required: true },
});

const ItemPriceAlertModel = mongoose.model<IItemPriceAlert>(
  "ItemPriceAlert",
  ItemPriceAlertSchema,
);

export default ItemPriceAlertModel;
