/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";
import { createNotification } from "@/lib/createNotification";
import { sendWhatsApp } from "@/lib/whatsapp";
import { getToken } from "next-auth/jwt";
 
export async function POST(req: NextRequest) {
  try {
    await connectDB();
 
    const body = await req.json();
    console.log("📥 Payment Body Received:", body);
 
    const { userId, customerId, amount } = body;
 
    if (!userId || !customerId || !amount || amount <= 0) {
      return NextResponse.json(
        { error: "customerId and valid amount are required" },
        { status: 400 }
      );
    }
 
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }
 
    const payment = await Payment.create({
      userId,
      customerId,
      amount: Number(amount),
      date: new Date(),
    });
 
    // ── Update customer balance ──
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalDebt: -Number(amount) } },
      { new: true }
    );
 
    console.log("✅ Payment Created:", payment._id);
 
    // ── In-app notification ──
    await createNotification({
      userId,
      customerId,
      title: "تم تسجيل دفعة",
      message: `تم استلام مبلغ ${amount} ريال`,
      type: "payment",
    });
 
    // ── WhatsApp notification ──
    if (customer.phone) {
      const receiptLink = `${process.env.NEXT_PUBLIC_SITE_URL}/payments/${payment._id}`;
 
      const waResult = await sendWhatsApp({
        to: customer.phone,
        message: `مرحباً ${customer.name} 👋
 
✅ تأكيد استلام دفعة
 
تم استلام مبلغ:
💰 ${Number(amount).toLocaleString("ar-SA")} ريال
 
🔗 سند الاستلام:
${receiptLink}
 
شكراً لسدادك 🙏
 
— فريق دَيني 💙`,
      });
 
      if (!waResult.success) {
        console.warn(
          "⚠️ WhatsApp failed for payment",
          payment._id,
          "| Reason:",
          waResult.error
        );
      }
    } else {
      console.warn("⚠️ Customer has no phone:", customer.name);
    }
 
    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("❌ Create Payment Error:", error.message);
    return NextResponse.json(
      { error: "Failed to create payment", details: error.message },
      { status: 500 }
    );
  }
}
 
// ── GET: return only the authenticated user's payments ──
export async function GET(req: NextRequest) {
  try {
    await connectDB();
 
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
 
    if (!token?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }
 
    const user = await User.findOne({ email: token.email }).select("_id");
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }
 
    const payments = await Payment.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();
 
    return NextResponse.json(payments, { status: 200 });
  } catch (error: any) {
    console.error("❌ Fetch Payments Error:", error.message);
    return NextResponse.json(
      { error: "Failed to fetch payments", details: error.message },
      { status: 500 }
    );
  }
}