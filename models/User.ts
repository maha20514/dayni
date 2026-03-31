import { Schema, model, Document, models } from 'mongoose';

export interface IUser extends Document {
  shopName: string;
  email: string;
  password: string;
} 

const UserSchema = new Schema({
  shopName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
},
{ timestamps: true });

export const User = models.User || model("User", UserSchema);