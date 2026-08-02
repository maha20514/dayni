// models/Supplier.ts
import mongoose, { Schema, model, models, Document } from "mongoose";

export interface ISupplier extends Document {
  userId:    mongoose.Types.ObjectId;
  name:      string;
  phone:     string;
  company:   string;
  totalDebt: number;
  notes:     string;
  createdAt: Date;
}

const SupplierSchema = new Schema({
  userId: {
    type:     Schema.Types.ObjectId,
    ref:      "User",
    required: true,
  },
  name: {
    type:     String,
    required: true,
    trim:     true,
  },
  phone: {
    type:  String,
    trim:  true,
    default: "",
  },
  company: {
    type:  String,
    trim:  true,
    default: "",
  },
  totalDebt: {
    type:    Number,
    default: 0,  // المبلغ المستحق للمورد
  },
  notes: {
    type:    String,
    default: "",
  },
}, { timestamps: true });

SupplierSchema.index({ userId: 1 });

export const Supplier =
  models.Supplier || model<ISupplier>("Supplier", SupplierSchema);