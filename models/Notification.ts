import mongoose, { Schema, model, models } from "mongoose";

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  customerId: { type: Schema.Types.ObjectId, ref: "Customer" },

  title: { type: String, required: true },
  message: { type: String, required: true },

  type: {
    type: String,
    enum: ["invoice", "payment", "reminder"],
    default: "reminder",
  },

isRead: { type: Boolean, default: false },
  lastSentAt: {type: Date, default: Date.now },
reminderLevel: { type: Number, enum: [0, 1, 2, 3] }, // 0 = جديد، 1 = بعد 3 أيام، 2 = بعد 7، 3 = بعد 14
isResolved: { type: Boolean, default: false },   // إذا تم الدفع
invoiceId: { type: Schema.Types.ObjectId, ref: "Invoice" },     // ربط بالفاتورة

  createdAt: { type: Date, default: Date.now },
});

export const Notification =
  models.Notification || model("Notification", NotificationSchema);