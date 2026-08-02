// ─────────────────────────────────────────────────────────────────────────────

// models/PurchasePayment.ts
import mongoose2, { Schema as Schema2, model as model2, models as models2, Document as Document2 } from "mongoose";

export interface IPurchasePayment extends Document2 {
  userId:     mongoose2.Types.ObjectId;
  supplierId: mongoose2.Types.ObjectId;
  amount:     number;
  date:       Date;
  notes:      string;
}

const PurchasePaymentSchema = new Schema2({
  userId: {
    type:     Schema2.Types.ObjectId,
    ref:      "User",
    required: true,
  },
  supplierId: {
    type:     Schema2.Types.ObjectId,
    ref:      "Supplier",
    required: true,
  },
  amount: {
    type:     Number,
    required: true,
    min:      0,
  },
  date: {
    type:    Date,
    default: Date.now,
  },
  notes: {
    type:    String,
    default: "",
  },
}, { timestamps: true });

PurchasePaymentSchema.index({ userId: 1, supplierId: 1 });

export const PurchasePayment =
  models2.PurchasePayment ||
  model2<IPurchasePayment>("PurchasePayment", PurchasePaymentSchema);