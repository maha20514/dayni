import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { Notification } from "@/models/Notification";

export const checkOverdue = async () => {
  await connectDB();

  const invoices = await Invoice.find();

  const now = new Date();

  for (const inv of invoices) {
    const days =
      (now.getTime() - new Date(inv.date).getTime()) /
      (1000 * 60 * 60 * 24);

    if (days > 30) {
      await Notification.create({
        userId: inv.userId,
        customerId: inv.customerId,
        title: "دين متأخر 🚨",
        message: `فاتورة بقيمة ${inv.amount} ريال متأخرة ${Math.floor(
          days
        )} يوم`,
        type: "reminder",
      });
    }
  }

  console.log("Overdue check done");
};