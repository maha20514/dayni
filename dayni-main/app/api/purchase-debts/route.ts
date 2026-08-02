// app/api/purchase-debts/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PurchaseDebt } from "@/models/PurchaseDebt";
import { Supplier } from "@/models/Supplier";
import { getToken } from "next-auth/jwt";

async function getUserId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.userId as string | null;
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { supplierId, amount, description, dueDate } = await req.json();

    if (!supplierId || !amount || amount <= 0) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const supplier = await Supplier.findOne({ _id: supplierId, userId });
    if (!supplier) {
      return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
    }

    const debt = await PurchaseDebt.create({
      userId,
      supplierId,
      amount:      Number(amount),
      description: description?.trim() || "",
      dueDate:     dueDate ? new Date(dueDate) : null,
    });

    // تحديث رصيد المورد
    await Supplier.findByIdAndUpdate(supplierId, {
      $inc: { totalDebt: Number(amount) },
    });

    return NextResponse.json(debt, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/purchase-debts error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
