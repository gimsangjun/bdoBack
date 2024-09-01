import mongoose, { Schema, Document } from "mongoose";

export interface IItem extends Document {
  id: number;
  sid: number; // 강화 등급이 있는 아이템의 경우
  name: string;
  mainCategory: number; // 1 - 가공무역
  subCategory: number; // 1-1 목재, 1-2 광석
  price: number;
  grade: string; // 아이템 등급, 색깔을 주기 위함.
  imgUrl: string;
  type: string; // 강화 정보를 구별하기 위함.
  details: string; // 아이템 상세 정보
  updateAt: Date;
}

const ItemSchema: Schema = new Schema(
  {
    id: { type: Number, require: true, unique: true },
    name: { type: String, required: true },
    mainCategory: { type: Number, require: true },
    subCategory: { type: Number, require: true },
    price: { type: Number, default: 0 },
    grade: {
      type: String,
      required: true,
      default: "common",
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
    },
    imgUrl: { type: String, default: "" },
    type: { type: String, default: "" },
    details: { type: String, default: "" },
    updateAt: { type: Date, default: Date.now },
  },
  { strict: false }, // 스키마에 정의되지 않은 추가 필드들을 허용
);

const ItemModel = mongoose.model<IItem>("Item", ItemSchema);

export default ItemModel;
