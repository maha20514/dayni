/* eslint-disable @typescript-eslint/no-explicit-any */

import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";
import { Notification } from "@/models/Notification";
import { sendWhatsApp } from "./whatsapp";
import { Customer } from "@/models/Customer";

type ReminderLevel = 0 | 1 | 2 | 3;

const messages: Record<ReminderLevel, string> = {
  0: "📌 تم تسجيل دين جديد",
  1: "🔔 تذكير ودي: لديك مبلغ مستحق",
  2: "⚠️ تذكير مهم: نرجو السداد",
  3: "🚨 تنبيه نهائي: يرجى السداد فورًا",
};

export async function runReminders() {
  const invoices = await Invoice.find({});

  let sent    = 0;
  let skipped = 0;

  // ✅ نجمّع الفواتير حسب العميل — تذكير واحد لكل عميل
  const customerMap = new Map<string, {
    customerId: string;
    userId:     string;
    invoices:   typeof invoices;
    oldestDate: Date;
  }>();

  for (const invoice of invoices) {
    const key = `${invoice.customerId}_${invoice.userId}`;
    if (!customerMap.has(key)) {
      customerMap.set(key, {
        customerId: invoice.customerId.toString(),
        userId:     invoice.userId.toString(),
        invoices:   [],
        oldestDate: new Date(invoice.date),
      });
    }
    const entry = customerMap.get(key)!;
    entry.invoices.push(invoice);
    // نحتفظ بأقدم فاتورة لتحديد المستوى
    if (new Date(invoice.date) < entry.oldestDate) {
      entry.oldestDate = new Date(invoice.date);
    }
  }

  // ✅ نعالج كل عميل مرة واحدة فقط
  for (const [, entry] of customerMap) {
    const { customerId, userId, invoices: customerInvoices, oldestDate } = entry;

    // حساب إجمالي الديون والمدفوعات
    const [allPayments] = await Promise.all([
      Payment.find({ customerId, userId }),
    ]);

    const totalDebt = customerInvoices.reduce(
      (sum: number, inv: any) => sum + Number(inv.amount || 0), 0
    );
    const totalPaid = allPayments.reduce(
      (sum: number, pay: any) => sum + Number(pay.amount || 0), 0
    );

    const remaining = totalDebt - totalPaid;

    // لو مسدد بالكامل — تجاوز
    if (remaining <= 0) {
      skipped++;
      continue;
    }

    // تحديد المستوى بناءً على أقدم فاتورة غير مسددة
    const daysPassed = Math.floor(
      (Date.now() - oldestDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    let level: ReminderLevel = 0;
    if      (daysPassed >= 14) level = 3;
    else if (daysPassed >= 7)  level = 2;
    else if (daysPassed >= 3)  level = 1;

    // ✅ منع التكرار — تحقق على مستوى العميل مو الفاتورة
    const exists = await Notification.findOne({
      customerId,
      userId,
      type:          "reminder",
      reminderLevel: level,
      // لم يُرسل في آخر 24 ساعة
      lastSentAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (exists) {
      skipped++;
      continue;
    }

    // إنشاء إشعار واحد للعميل
    await Notification.create({
      userId,
      customerId,
      title:         "ديني - تذكير",
      message:       `${messages[level]} — المتبقي: ${remaining.toLocaleString("ar-SA")} ريال`,
      type:          "reminder",
      reminderLevel: level,
      isRead:        false,
      isResolved:    false,
      lastSentAt:    new Date(),
    });

    // إرسال واتساب واحد للعميل
    const customer = await Customer.findById(customerId);

    if (customer?.phone) {
      const whatsappMessage = `
مرحباً ${customer.name} 👋

${messages[level]}

إجمالي المتبقي عليك:
${remaining.toLocaleString("ar-SA")} ريال

— ديني
`.trim();

      const result = await sendWhatsApp({
        to:      customer.phone,
        message: whatsappMessage,
      });

      if (result.success) {
        console.log(`✅ WhatsApp reminder sent to: ${customer.name}`);
      } else {
        console.error(`⚠️ WhatsApp failed for ${customer.name} | Reason: ${result.error}`);
      }
    }

    sent++;
  }

  return { sent, skipped };
}