import mongoose, { Schema, Document } from "mongoose";
// {
//     "name": "셀레스 장검",
//     "id": 10007,
//     "sid": 0, // 강화단계
//     "minEnhance": 0, // 0~7강
//     "maxEnhance": 7, //
//     "basePrice": 215000, // 최상위 구매대기 가격
//     "currentStock": 13, // 현재 판매대기 매물
//     "totalTrades": 265147,
//     "priceMin": 23100,
//     "priceMax": 231000,
//     "lastSoldPrice": 228000,
//     "lastSoldTime": 1713412381 // 검은사막만의 시간인듯.
// }

// Item 매물의 대한 가격
export interface IItemStock extends Document {
  id: number;
  name: string;
  sid: number;
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
}

const ItemStockSchema: Schema = new Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  sid: { type: Number, required: true },
  minEnhance: { type: Number, required: true },
  maxEnhance: { type: Number, required: true },
  basePrice: { type: Number, required: true },
  currentStock: { type: Number, required: true },
  totalTrades: { type: Number, required: true },
  priceMin: { type: Number, required: true },
  priceMax: { type: Number, required: true },
  lastSoldPrice: { type: Number, required: true },
  lastSoldTime: { type: Number, required: true },
  updateAt: { type: Date, default: Date.now },
});

// id와 sid를 결합한 복합 인덱스 생성
// mongodb쉘에서는 이렇게 db.itemstocks.createIndex({ id: 1, sid: 1 }, { unique: true })
// 1의 의미 : "1"은 인덱스가 오름차순으로 생성되어야 함을 나타내는 옵션
ItemStockSchema.index({ id: 1, sid: 1 }, { unique: true });

const ItemStockModel = mongoose.model<IItemStock>("ItemStock", ItemStockSchema);

export default ItemStockModel;
