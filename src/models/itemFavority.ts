import mongoose, { Schema, Document } from "mongoose";

interface IPriceAlert {
  priceThreshold: number; // 특정 가격 임계치
  alertEnabled: boolean; // 알림 활성화 여부
}

export interface IItemFavorite extends Document {
  username: string;
  name: string;
  id: number;
  sid: number;
  mainCategory: number;
  subCategory: number;
  priceAlert: IPriceAlert | null; // 특정 가격에 대한 알림 정보
}

const ItemFavoriteSchema: Schema = new Schema({
  username: { type: String, required: true },
  name: { type: String, required: true },
  id: { type: Number, required: true },
  sid: { type: Number, required: true, default: 0 },
  mainCategory: { type: Number, required: true },
  subCategory: { type: Number, required: true },
  priceAlert: {
    // 특정 가격에 대한 알림 정보를 담는 서브스키마
    priceThreshold: { type: Number, default: 0 }, // 특정 가격 임계치
    alertEnabled: { type: Boolean, default: false }, // 알림 활성화 여부
  },
});

const ItemFavoriteModel = mongoose.model<IItemFavorite>("ItemFavorite", ItemFavoriteSchema);

export default ItemFavoriteModel;
