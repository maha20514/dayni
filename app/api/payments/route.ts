/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { Customer } from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    console.log("📥 Payment Body Received:", body);

    const { userId, customerId, amount } = body;

    if (!userId || !customerId || !amount || amount <= 0) {
      return NextResponse.json({ 
        error: "customerId and valid amount are required" 
      }, { status: 400 });
    }

    const payment = await Payment.create({
      userId,
      customerId,
      amount: Number(amount),
      date: new Date(),
    });

    // تقليل الرصيد (دفع)
    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalDebt: -Number(amount) } },
      { new: true }
    );

    console.log("✅ Payment Created Successfully:", payment._id);

    return NextResponse.json(payment, { status: 201 });

  } catch (error: any) {
    console.error("❌ Create Payment Error:", error.message);
    return NextResponse.json({ 
      error: "Failed to create payment", 
      details: error.message 
    }, { status: 500 });
  }
}