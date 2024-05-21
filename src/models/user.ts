import mongoose, { Schema, Document } from "mongoose";
import { IItemFavorite } from "./itemFavority";

export interface IUser extends Document {
  id: number;
  username: string;
  avatarUrl: string;
  itemFavorites: IItemFavorite["_id"][];
}

const UserSchema: Schema = new Schema({
  id: { type: Number, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  // ref에는 mongoose.model의 collection이름 그대로
  itemFavorites: [{ type: Schema.Types.ObjectId, ref: "ItemFavorite" }],
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
