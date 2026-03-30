
import { Schema, model, models, Document } from "mongoose";

export interface ICustomer extends Document {
  name: string;
  phone: string;
  totalDebt: number;
  createdAt: Date;
}

const CustomerSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  totalDebt: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

export const Customer = models.Customer || model("Customer", CustomerSchema);



