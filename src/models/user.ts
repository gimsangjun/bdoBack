import mongoose, { Schema, Document } from "mongoose";
export interface IUser extends Document {
  id: string;
  username: string;
  role: "admin" | "user";
  avatarUrl: string;
}

const UserSchema: Schema = new Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  role: { type: String, enum: ["admin", "user"], default: "user" },
  avatarUrl: { type: String },
});

const UserModel = mongoose.model<IUser>("User", UserSchema);

export default UserModel;
