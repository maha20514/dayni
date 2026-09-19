/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Supplier } from "@/models/Supplier";
import { getToken } from "next-auth/jwt";
import { PurchasePayment } from "@/models/PurchasePayment";

async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.userId as string | null;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { supplierId, amount, notes } = await req.json();

    if (!supplierId || !amount || amount <= 0) {
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    const supplier = await Supplier.findOne({ _id: supplierId, userId });
    if (!supplier) {
      return NextResponse.json({ error: "SUPPLIER_NOT_FOUND" }, { status: 404 });
    }

    const payment = await PurchasePayment.create({
      userId,
      supplierId,
      amount: Number(amount),
      notes:  notes?.trim() || "",
    });

    // تحديث رصيد المورد
    await Supplier.findByIdAndUpdate(supplierId, {
      $inc: { totalDebt: -Number(amount) },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/purchase-payments error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
