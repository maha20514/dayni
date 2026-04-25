/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Payment } from "@/models/Payment";
import { Customer } from "@/models/Customer";

export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    const payment = await Payment.findById(id);

    if (!payment) {
      return NextResponse.json({ error: "السند غير موجود" }, { status: 404 });
    }

    // جلب بيانات العميل
    const customer = await Customer.findById(payment.customerId).select("name phone");

    return NextResponse.json({
      ...payment.toObject(),
      customer: customer || { name: "غير محدد", phone: "غير محدد" }
    });

  } catch (error: any) {
    console.error("Get Payment Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب السند" 
    }, { status: 500 });
  }
}