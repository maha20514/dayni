/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ← غيرناه إلى Promise
) {
  try {
    await connectDB();
    
    const { id } = await params;   // ← مهم جداً: await params

    if (!id) {
      return NextResponse.json({ error: "Customer ID missing" }, { status: 400 });
    }

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const invoices = await Invoice.find({ customerId: id }).lean();
    const payments = await Payment.find({ customerId: id }).lean();

    const transactions = [
      ...invoices.map((i: any) => ({ ...i, type: "فاتورة" })),
      ...payments.map((p: any) => ({ ...p, type: "سند" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ ...customer, transactions });
  } catch (error) {
    console.error("GET /customers/[id] error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ← غيرناه إلى Promise
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "معرف العميل مطلوب" }, { status: 400 });
    }

    // التحقق من وجود العميل
    const customer = await Customer.findById(id);
    if (!customer) {
      return NextResponse.json({ error: "العميل غير موجود" }, { status: 404 });
    }

    // حذف كل ما يتعلق بالعميل (الفواتير + المدفوعات)
    await Invoice.deleteMany({ customerId: id });
    await Payment.deleteMany({ customerId: id });

    // حذف العميل نفسه
    await Customer.findByIdAndDelete(id);

    return NextResponse.json({ 
      message: "تم حذف العميل وبياناته بنجاح" 
    });

  } catch (error: any) {
    console.error("Delete Customer Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء حذف العميل" 
    }, { status: 500 });
  }
}