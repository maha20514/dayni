/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("📥 Invoice Body Received:", body);

    const { userId, customerId, amount, description } = body;

    if (!userId || !customerId || !amount || amount <= 0 || !description) {
      return NextResponse.json({ 
        error: "جميع البيانات مطلوبة (userId, customerId, amount, description)" 
      }, { status: 400 });
    }

    // التحقق من وجود المستخدم والعميل
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    // إنشاء الفاتورة
    const invoice = await Invoice.create({
      userId,
      customerId,
      amount: Number(amount),
      description: description.trim(),
      date: new Date(),
    });

    // تحديث رصيد العميل (+)
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalDebt: Number(amount) } },
      { new: true }
    );

    console.log("✅ Invoice Created Successfully:", invoice._id);

    return NextResponse.json(invoice, { status: 201 });

  } catch (error: any) {
    console.error("❌ Create Invoice Error:", error.message);
    return NextResponse.json({ 
      error: "Failed to create invoice", 
      details: error.message 
    }, { status: 500 });
  }
}