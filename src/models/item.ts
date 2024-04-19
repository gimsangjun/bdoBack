import mongoose, { Schema, Document } from "mongoose";
import { IItemStock } from "./itemStock";

export interface IItem extends Document {
  id: number;
  name: string;
  mainCategory: number;
  subCategory: number;
  price: IItemStock["_id"][]; // TODO: 정확히 어떤 뜻인가?
}

const ItemSchema: Schema = new Schema({
  id: { type: Number, require: true, unique: true },
  name: { type: String, required: true },
  mainCategory: { type: Number, require: true },
  subCategory: { type: Number, require: true },
  price: [{ type: Schema.Types.ObjectId, ref: "ItemStock" }],
});

const ItemModel = mongoose.model<IItem>("Item", ItemSchema);

export default ItemModel;
