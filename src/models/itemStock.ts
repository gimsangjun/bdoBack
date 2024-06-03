import mongoose, { Schema, Document } from "mongoose";

// Item 매물의 대한 가격
export interface IItemStock extends Document {
  id: number;
  name: string;
  sid: number;
  mainCategory: number;
  subCategory: number;
  imgUrl: string;
  minEnhance: number;
  maxEnhance: number;
  basePrice: number;
  currentStock: number;
  totalTrades: number;
  priceMin: number;
  priceMax: number;
  lastSoldPrice: number;
  lastSoldTime: number;
  updateAt: Date;
  grade: string;
}

const ItemStockSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  sid: { type: Number, required: true },
  mainCategory: { type: Number, required: true, default: 0 },
  subCategory: { type: Number, required: true, default: 0 },
  imgUrl: { type: String, default: "" },
  minEnhance: { type: Number, required: true, default: 0 },
  maxEnhance: { type: Number, required: true, default: 0 },
  basePrice: { type: Number, required: true, default: 0 },
  currentStock: { type: Number, required: true, default: 0 },
  totalTrades: { type: Number, required: true, default: 0 },
  priceMin: { type: Number, required: true, default: 0 },
  priceMax: { type: Number, required: true, default: 0 },
  lastSoldPrice: { type: Number, required: true, default: 0 },
  lastSoldTime: { type: Number, required: true, default: 0 },
  updateAt: { type: Date, default: Date.now },
  // grade에 common, uncommon, rare, epic, legendary라는 값만 올수 있게.
  grade: {
    type: String,
    required: true,
    default: "common",
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
  },
});

// id와 sid를 결합한 복합 인덱스 생성
// mongodb쉘에서는 이렇게 db.itemstocks.createIndex({ id: 1, sid: 1 }, { unique: true })
// 1의 의미 : "1"은 인덱스가 오름차순으로 생성되어야 함을 나타내는 옵션
ItemStockSchema.index({ id: 1, sid: 1 }, { unique: true });

const ItemStockModel = mongoose.model<IItemStock>("ItemStock", ItemStockSchema);

export default ItemStockModel;
