import mongoose, { Schema, Document } from "mongoose";
import { IItemStock } from "./itemStock";

export interface IItem extends Document {
  id: number;
  name: string;
  mainCategory: number;
  subCategory: number;
  price: IItemStock["_id"][]; // "_id" : MongoDB에서 사용되는 기본 ID 필드, []: 이것은 배열
}

const ItemSchema: Schema = new Schema({
  id: { type: Number, require: true, unique: true },
  name: { type: String, required: true },
  mainCategory: { type: Number, require: true },
  subCategory: { type: Number, require: true },
  price: [{ type: Schema.Types.ObjectId, ref: "ItemStock" }], // 스키마 설정이 중요함.
});

const ItemModel = mongoose.model<IItem>("Item", ItemSchema);

export default ItemModel;
