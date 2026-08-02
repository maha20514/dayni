// models/PurchaseDebt.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

export interface IPurchaseDebt extends Document {
  userId:      mongoose.Types.ObjectId;
  supplierId:  mongoose.Types.ObjectId;
  amount:      number;
  description: string;
  dueDate:     Date | null;   // موعد السداد
  date:        Date;
}

const PurchaseDebtSchema = new Schema({
  userId: {
    type:     Schema.Types.ObjectId,
    ref:      "User",
    required: true,
  },
  supplierId: {
    type:     Schema.Types.ObjectId,
    ref:      "Supplier",
    required: true,
  },
  amount: {
    type:     Number,
    required: true,
    min:      0,
  },
  description: {
    type:    String,
    trim:    true,
    default: "",
  },
  dueDate: {
    type:    Date,
    default: null,
  },
  date: {
    type:    Date,
    default: Date.now,
  },
}, { timestamps: true });

PurchaseDebtSchema.index({ userId: 1, supplierId: 1 });

export const PurchaseDebt =
  models.PurchaseDebt || model<IPurchaseDebt>("PurchaseDebt", PurchaseDebtSchema);


