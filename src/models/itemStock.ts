import mongoose, { Schema, Document } from "mongoose";

// Item 매물의 대한 가격
// 기본 Item에 내가 커스텀으로 추가한 데이터들. 이것을 주로씀.
export interface IItemStock extends Document {
  id: number;
  name: string;
  sid: number; // 강화등급이 있는 아이템의 경우.
  mainCategory: number;
  subCategory: number;
  imgUrl: string;
  minEnhance: number;
  maxEnhance: number;
  basePrice: number;
  currentStock: number; // 현재 매물
  totalTrades: number;
  priceMin: number;
  priceMax: number;
  lastSoldPrice: number;
  lastSoldTime: number;
  updateAt: Date;
  grade: string; // 아이템 등급 - 색깔 효과를 위함.
  type: string; // 강화 정보를 구별하기 위함 - ex: 검은별 무기, 악세사리, 고드아이드
  details: string; // 아이템 상세 정보
}

const ItemStockSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  sid: { type: Number, required: true },
  mainCategory: { type: Number, default: 0 },
  subCategory: { type: Number, default: 0 },
  imgUrl: { type: String, default: "" },
  minEnhance: { type: Number, default: 0 },
  maxEnhance: { type: Number, default: 0 },
  basePrice: { type: Number, default: 0 },
  currentStock: { type: Number, default: 0 },
  totalTrades: { type: Number, default: 0 },
  priceMin: { type: Number, default: 0 },
  priceMax: { type: Number, default: 0 },
  lastSoldPrice: { type: Number, default: 0 },
  lastSoldTime: { type: Number, default: 0 },
  updateAt: { type: Date, default: Date.now },
  // grade에 common, uncommon, rare, epic, legendary라는 값만 올수 있게.
  grade: {
    type: String,
    default: "common",
    enum: ["common", "uncommon", "rare", "epic", "legendary"],
  },
  type: { type: String, default: "" },
  details: { type: String, default: "" },
});

// id와 sid를 결합한 복합 인덱스 생성
// mongodb쉘에서는 이렇게 db.itemstocks.createIndex({ id: 1, sid: 1 }, { unique: true })
// 1의 의미 : "1"은 인덱스가 오름차순으로 생성되어야 함을 나타내는 옵션
ItemStockSchema.index({ id: 1, sid: 1 }, { unique: true });

const ItemStockModel = mongoose.model<IItemStock>("ItemStock", ItemStockSchema);

export default ItemStockModel;
