// models/PasswordResetToken.ts
import { Schema, model, models } from "mongoose";

const PasswordResetTokenSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
  token:     { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
});

export const PasswordResetToken =
  models.PasswordResetToken || model("PasswordResetToken", PasswordResetTokenSchema);