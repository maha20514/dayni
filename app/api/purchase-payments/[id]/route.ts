import { Supplier } from '@/models/Supplier';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PurchasePayment } from "@/models/PurchasePayment";

export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Purchase Payment ID is required" }, { status: 400 });
    }

    const purchasePayment = await PurchasePayment.findById(id);

    if (!purchasePayment) {
      return NextResponse.json({ error: "السند غير موجود" }, { status: 404 });
    }

    const supplier = await Supplier.findById(purchasePayment.supplierId).select("name phone");

    return NextResponse.json({
      ...purchasePayment.toObject(),
      supplier: supplier || { name: "غير محدد", phone: "غير محدد" }
    });

  } catch (error: any) {
    console.error("Get Purchase Payment Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب السند" 
    }, { status: 500 });
  }
}