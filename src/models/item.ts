import mongoose, { Schema, Document } from "mongoose";
import { IItemStock } from "./itemStock";

// 기본적인 아이템 내용들. 실제 운영에서는 쓰지 않을듯. 대부분 ItemStock을 쓸듯.
export interface IItem extends Document {
  id: number;
  name: string;
  mainCategory: number;
  subCategory: number;
  grade: string;
  imgUrl: string;
}

const ItemSchema: Schema = new Schema({
  id: { type: Number, require: true, unique: true },
  name: { type: String, required: true },
  mainCategory: { type: Number, require: true },
  subCategory: { type: Number, require: true },
  imgUrl: { type: String, default: "" },
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

// imgUrl 업데이트하는 쿼리

// db.items.updateMany(
//   { name: "데보레카 허리띠" },
//   {
//     $set: {
//       imgUrl:
//         "https://cdn.bdolytics.com/img/new_icon/06_pc_equipitem/00_common/18_belt/00012276.webp",
//     },
//   },
// );

// db.items.find().forEach(function(item) {
//   db.itemstocks.updateMany(
//     { name: item.name },
//     { $set: { imgUrl: item.imgUrl } }
//   );
// });
// MongoDB 쉘에 접속
// `Item` 컬렉션에서 모든 아이템을 순회하며 `ItemStock` 컬렉션을 업데이트
