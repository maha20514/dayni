import mongoose ,{ Schema , model, models, Document } from "mongoose";

export interface IInvoice extends Document {
  customerId: mongoose.Types.ObjectId;
  amount: number;
  description: string;
  userId: mongoose.Types.ObjectId;
  date: Date;
}

const InvoiceSchema = new Schema({
  customerId: { type: Schema.Types.ObjectId, ref: "Customer", required: true },
  amount: { type: Number, required: true },
  description: { type: String },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  date: { type: Date, default: Date.now },
  
},
{ timestamps: true });
export const Invoice = models.Invoice || model("Invoice", InvoiceSchema);

