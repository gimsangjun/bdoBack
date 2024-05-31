import mongoose, { Schema, Document } from "mongoose";
import { IItemStock } from "./itemStock";

// 기본적인 아이템 내용들. 실제 운영에서는 쓰지 않을듯. 대부분 ItemStock을 쓸듯.
export interface IItem extends Document {
  id: number;
  name: string;
  mainCategory: number;
  subCategory: number;
  grade: string;
}

const ItemSchema: Schema = new Schema({
  id: { type: Number, require: true, unique: true },
  name: { type: String, required: true },
  mainCategory: { type: Number, require: true },
  subCategory: { type: Number, require: true },
  // grade에 common, uncommon, rare, epic, legendary라는 값만 올수 있게.
  grade: {
    type: String,
    required: true,
    default: "common",
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
  },
});

const ItemModel = mongoose.model<IItem>("Item", ItemSchema);

export default ItemModel;
