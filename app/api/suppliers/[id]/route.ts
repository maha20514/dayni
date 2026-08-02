// app/api/suppliers/[id]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Supplier } from "@/models/Supplier";
import { PurchaseDebt } from "@/models/PurchaseDebt";
import { getToken } from "next-auth/jwt";
import { PurchasePayment } from "@/models/PurchasePayment";

async function getOwnerIdFromToken(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.userId as string | null;
}

// ── GET — جيب المورد مع معاملاته ─────────────────────────────────────────────
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getOwnerIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    const supplier = await Supplier.findOne({ _id: id, userId }).lean();
    if (!supplier) {
      return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
    }

    const [debts, payments] = await Promise.all([
      PurchaseDebt.find({ supplierId: id, userId }).lean(),
      PurchasePayment.find({ supplierId: id, userId }).lean(),
    ]);

    const transactions = [
      ...debts.map((d: any)    => ({ ...d, type: "دين شراء" })),
      ...payments.map((p: any) => ({ ...p, type: "دفعة"     })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const totalDebt = debts.reduce((s: number, d: any) => s + Number(d.amount || 0), 0);
    const totalPaid = payments.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);

    return NextResponse.json({
      ...supplier,
      totalDebt,
      totalPaid,
      remaining: totalDebt - totalPaid,
      transactions,
    });
  } catch (error: any) {
    console.error("GET /api/suppliers/[id] error:", error);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}

// ── DELETE — حذف المورد وكل بياناته ──────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const userId = await getOwnerIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;

    const supplier = await Supplier.findOne({ _id: id, userId });
    if (!supplier) {
      return NextResponse.json({ error: "المورد غير موجود" }, { status: 404 });
    }

    await Promise.all([
      PurchaseDebt.deleteMany({ supplierId: id }),
      PurchasePayment.deleteMany({ supplierId: id }),
      Supplier.findByIdAndDelete(id),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/suppliers/[id] error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الحذف" }, { status: 500 });
  }
}