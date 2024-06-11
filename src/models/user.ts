import mongoose, { Schema, Document } from "mongoose";
import { IItemFavorite } from "./itemFavority";
import { IItemPriceAlert } from "./itemPriceAlert";

interface IDiscordChannel {
  id: string;
  name: string;
}

export interface IUser extends Document {
  id: string;
  username: string;
  avatarUrl: string;
  itemFavorites: IItemFavorite["_id"][];
  itemPriceAlerts: IItemPriceAlert["_id"][];
  discordChannel?: IDiscordChannel;
}

const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  avatarUrl: { type: String },
  // ref에는 mongoose.model의 collection이름 그대로
  itemFavorites: [{ type: Schema.Types.ObjectId, ref: "ItemFavorite" }],
  itemPriceAlerts: [{ type: Schema.Types.ObjectId, ref: "ItemPriceAlert" }],
  discordChannel: {
    //TODO: 나중에 자동으로 알림을 보내야하니까 채널id을 알고 있어야됨.
    id: { type: String, required: true },
    name: { type: String, required: true },
  },
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
