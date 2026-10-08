import { Schema, model, models } from "mongoose";

// One-time code that carries a finished system-browser Google sign-in back
// into the native WebView. Stored hashed; auto-deleted by the TTL index.
const MobileAuthCodeSchema = new Schema({
  codeHash: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } },
});

export const MobileAuthCode =
  models.MobileAuthCode || model("MobileAuthCode", MobileAuthCodeSchema);
