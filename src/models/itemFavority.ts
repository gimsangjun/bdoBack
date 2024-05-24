import mongoose, { Schema, Document } from "mongoose";

export interface IItemFavorite extends Document {
  username: string;
  name: string;
  id: number;
  sid: number;
  mainCategory: number;
  subCategory: number;
}

const ItemFavoriteSchema: Schema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: Number, required: true },
  sid: { type: Number, required: true, default: 0 },
  mainCategory: { type: Number, required: true },
  subCategory: { type: Number, required: true },
});

const ItemFavoriteModel = mongoose.model<IItemFavorite>(
  "ItemFavorite",
  ItemFavoriteSchema,
);

export default ItemFavoriteModel;
