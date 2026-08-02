/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";
import { createNotification } from "@/lib/createNotification";
import { sendWhatsApp } from "@/lib/whatsapp";
import { getToken } from "next-auth/jwt";
 
export async function POST(req: NextRequest) {
  try {
    await connectDB();
 
    const body = await req.json();
    console.log("📥 Invoice Body Received:", body);
 
    const { userId, customerId, amount, description } = body;
 
    if (!userId || !customerId || !amount || amount <= 0 || !description) {
      return NextResponse.json(
        {
          error:
            "جميع البيانات مطلوبة (userId, customerId, amount, description)",
        },
        { status: 400 }
      );
    }
 
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
 
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json(
        { error: "العميل غير موجود" },
        { status: 404 }
      );
    }
 
    const invoice = await Invoice.create({
      userId,
      customerId,
      amount: Number(amount),
      description: description.trim(),
      date: new Date(),
    });
 
    const invoiceLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invoices/${invoice._id}`;
 
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalDebt: Number(amount) } },
      { new: true }
    );

    if (!customer.phone) {
  console.warn("No phone number");
  return;
}
 
    await createNotification({
      userId,
      customerId,
      title: "تم إضافة فاتورة جديدة",
      message: `تم تسجيل دين بقيمة ${amount} ريال`,
      type: "invoice",
    });
 
    // 📱 WhatsApp Notification
    if (customer.phone) {
      const waResult = await sendWhatsApp({
        to: customer.phone,
        message: `مرحباً ${customer.name} 👋
 
📢 إشعار من دَيني
 
تم تسجيل فاتورة جديدة عليك:
 
💰 المبلغ: ${amount} ريال
📝 التفاصيل: ${description}
 
🔗 رابط الفاتورة:
${invoiceLink}
 
نرجو السداد في أقرب وقت 🙏
 
— فريق دَيني 💙`,
      });
 
      if (!waResult.success) {
        console.warn("⚠️ WhatsApp failed for invoice", invoice._id, "| Reason:", waResult.error);
      }
    } else {
      console.warn("⚠️ Customer has no phone:", customer.name);
    }
 
    console.log("✅ Invoice Created Successfully:", invoice._id);
 
    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("❌ Create Invoice Error:", error.message);
    return NextResponse.json(
      {
        error: "Failed to create invoice",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
 
// ── GET: return only the authenticated user's invoices ──
export async function GET(req: NextRequest) {
  try {
    await connectDB();
 
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });
 
    if (!token?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
 
    const user = await User.findOne({ email: token.email }).select("_id");
    if (!user) {
      return NextResponse.json(
        { error: "المستخدم غير موجود" },
        { status: 404 }
      );
    }
 
    const invoices = await Invoice.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
 
    return NextResponse.json(invoices, { status: 200 });
  } catch (error: any) {
    console.error("❌ Fetch Invoices Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch invoices", details: error.message },
      { status: 500 }
    );
  }
}