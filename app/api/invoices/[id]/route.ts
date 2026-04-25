/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { Customer } from "@/models/Customer";

export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Invoice ID is required" }, { status: 400 });
    }

    const invoice = await Invoice.findById(id);

    if (!invoice) {
      return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    }

    // جلب بيانات العميل المرتبطة
    const customer = await Customer.findById(invoice.customerId).select("name phone");

    return NextResponse.json({
      ...invoice.toObject(),
      customer: customer || { name: "غير محدد", phone: "غير محدد" }
    });

  } catch (error: any) {
    console.error("Get Invoice Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب الفاتورة" 
    }, { status: 500 });
  }
}