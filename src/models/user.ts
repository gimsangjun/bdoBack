import mongoose, { Schema, Document } from "mongoose";
import { IItemFavorite } from "./itemFavority";

export interface IUser extends Document {
  username: string;
  password: string;
  itemFavorites: IItemFavorite["_id"][];
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  // ref에는 mongoose.model의 collection이름 그대로
  itemFavorites: [{ type: Schema.Types.ObjectId, ref: "ItemFavorite" }],
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
