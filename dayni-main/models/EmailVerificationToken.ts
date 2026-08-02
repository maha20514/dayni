// models/EmailVerificationToken.ts
import { Schema, model, models } from "mongoose";

const EmailVerificationTokenSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
  code:      { type: String, required: true },          // 6-digit OTP
  expiresAt: { type: Date,   required: true },          // 10 دقائق
  attempts:  { type: Number, default: 0 },              // منع brute-force
});

// auto-delete بعد انتهاء الصلاحية
EmailVerificationTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const EmailVerificationToken =
  models.EmailVerificationToken ||
  model("EmailVerificationToken", EmailVerificationTokenSchema);