/* eslint-disable @typescript-eslint/no-explicit-any */
// Daily payment reminders (run by the cron in vercel.json -> /api/notifications/reminders).
// Only Pro owners ("notifications" feature). One reminder per customer, escalating with the
// age of the oldest UNPAID invoice (payments are applied to the oldest invoices first).

import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";
import { Notification } from "@/models/Notification";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";
import { sendWhatsApp, waParam } from "./whatsapp";
import { createNotification } from "./createNotification";

type ReminderLevel = 0 | 1 | 2 | 3;

const messages: Record<ReminderLevel, string> = {
  0: "📌 تم تسجيل دين جديد",
  1: "🔔 تذكير ودي: لديك مبلغ مستحق",
  2: "⚠️ تذكير مهم: نرجو السداد",
  3: "🚨 تنبيه نهائي: يرجى السداد فورًا",
};

// Same wording without emojis, used as a WhatsApp template variable.
const templateText: Record<ReminderLevel, string> = {
  0: "تم تسجيل دين جديد",
  1: "تذكير ودي بالمبلغ المستحق",
  2: "تذكير مهم، نرجو السداد",
  3: "تنبيه نهائي، يرجى السداد فورا",
};

const DAY = 24 * 60 * 60 * 1000;
// Same level is repeated at most once per week; a higher level is sent immediately.
const REPEAT_AFTER_DAYS = 7;

export async function runReminders() {
  let sent = 0;
  let skipped = 0;

  const proUsers = await User.find({ plan: "pro", isActive: { $ne: false } }).select("_id shopName");

  for (const owner of proUsers) {
    const userId = owner._id;
    const invoices = await Invoice.find({ userId }).sort({ date: 1 });
    if (!invoices.length) continue;

    const byCustomer = new Map<string, any[]>();
    for (const inv of invoices) {
      const k = String(inv.customerId);
      if (!byCustomer.has(k)) byCustomer.set(k, []);
      byCustomer.get(k)!.push(inv);
    }

    for (const [customerId, custInvoices] of byCustomer) {
      const payments = await Payment.find({ customerId, userId });
      const totalDebt = custInvoices.reduce((s, i) => s + Number(i.amount || 0), 0);
      const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);
      const remaining = totalDebt - totalPaid;

      if (remaining <= 0) { skipped++; continue; }

      // FIFO: find the oldest invoice that is not fully covered by payments.
      let credit = totalPaid;
      let oldestUnpaid: Date = new Date(custInvoices[0].date);
      for (const inv of custInvoices) {
        const amt = Number(inv.amount || 0);
        if (credit >= amt) { credit -= amt; continue; }
        oldestUnpaid = new Date(inv.date);
        break;
      }

      const daysPassed = Math.floor((Date.now() - oldestUnpaid.getTime()) / DAY);
      let level: ReminderLevel = 0;
      if (daysPassed >= 14) level = 3;
      else if (daysPassed >= 7) level = 2;
      else if (daysPassed >= 3) level = 1;

      // Level 0 is the "new debt" message already sent when the invoice is created.
      if (level === 0) { skipped++; continue; }

      const last = await Notification.findOne({ customerId, userId, type: "reminder" })
        .sort({ lastSentAt: -1 });
      if (
        last &&
        Number(last.reminderLevel ?? 0) >= level &&
        Date.now() - new Date(last.lastSentAt).getTime() < REPEAT_AFTER_DAYS * DAY
      ) { skipped++; continue; }

      const customer = await Customer.findById(customerId);
      if (!customer) { skipped++; continue; }

      const amountText = remaining.toLocaleString("ar-SA");

      // In-app + push notification for the shop owner.
      await createNotification({
        userId: String(userId),
        customerId,
        title: "ديني - تذكير",
        message: `${messages[level]} — ${customer.name}: ${amountText} ريال`,
        type: "reminder",
        reminderLevel: level,
      });

      // WhatsApp to the customer.
      if (customer.phone) {
        const result = await sendWhatsApp({
          to: customer.phone,
          kind: "reminder",
          params: [
            waParam(customer.name),
            waParam(owner.shopName),
            waParam(remaining.toLocaleString("en-US")),
            waParam(templateText[level]),
          ],
          message: `مرحباً ${customer.name} 👋

${messages[level]}

إجمالي المتبقي عليك لدى ${owner.shopName}:
${amountText} ريال

— دَيني`,
        });
        if (!result.success) {
          console.error(`⚠️ WhatsApp reminder failed for ${customer.name} | ${result.error}`);
        }
      }

      sent++;
    }
  }

  return { sent, skipped, owners: proUsers.length };
}
