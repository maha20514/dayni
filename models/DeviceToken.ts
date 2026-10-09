import { Schema, model, models } from "mongoose";

const DeviceTokenSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  token: { type: String, required: true, unique: true },
  platform: { type: String, enum: ["ios", "android"], required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const DeviceToken =
  models.DeviceToken || model("DeviceToken", DeviceTokenSchema);
