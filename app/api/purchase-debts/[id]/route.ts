import { PurchaseDebt } from '@/models/PurchaseDebt';
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Supplier } from '@/models/Supplier';

export async function GET(
  req: NextRequest,
   { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Purchase Debt ID is required" }, { status: 400 });
    }

    const purchaseDebt = await PurchaseDebt.findById(id)
    .populate("supplierId")
    .populate("userId");;

    if (!purchaseDebt) {
      return NextResponse.json({ error: "الديون الشرائية غير موجودة" }, { status: 404 });
    }

    const supplier = await Supplier.findById(purchaseDebt.supplierId).select("name phone");

    return NextResponse.json({
      ...purchaseDebt.toObject(),
      supplier: supplier || { name: "غير محدد", phone: "غير محدد" }
    });

  } catch (error: any) {
    console.error("Get Purchase Debt Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء جلب الدين الشرائي" 
    }, { status: 500 });
  }
}