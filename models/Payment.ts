import mongoose,  { Schema , model , models , Document } from "mongoose";

export interface IPayment extends Document{
  customerId: mongoose.Types.ObjectId;
  amount: number;
  userId: mongoose.Types.ObjectId;
  date: Date;
}

const PaymentSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now }
});

export const Payment = models.Payment || model("Payment", PaymentSchema);
 