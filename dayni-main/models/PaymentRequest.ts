import { Schema, model, models, Document } from "mongoose";

export interface IPaymentRequest extends Document {
  userId: string;
  plan: "basic" | "pro";
  amount: number;
  status: "pending" | "approved" | "rejected";
  proofImage?: string;
  transferRef?: string;
  notes?: string;
  createdAt: Date;
  reviewedAt?: Date;
}

const PaymentRequestSchema = new Schema({
  userId:      { type: Schema.Types.ObjectId, ref: "User", required: true },
  plan:        { type: String, enum: ["basic", "pro"], required: true },
  amount:      { type: Number, required: true },
  status:      { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  proofImage:  { type: String, default: null },
  transferRef: { type: String, default: "" },
  notes:       { type: String, default: "" },
  reviewedAt:  { type: Date, default: null },
}, { timestamps: true });

export const PaymentRequest =
  models.PaymentRequest || model<IPaymentRequest>("PaymentRequest", PaymentRequestSchema);