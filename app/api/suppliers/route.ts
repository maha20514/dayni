// app/api/suppliers/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Supplier } from "@/models/Supplier";
import { getToken } from "next-auth/jwt";

async function getOwnerIdFromToken(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  return token.userId as string;
}

// ── GET — جيب الموردين ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getOwnerIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const suppliers = await Supplier.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ error: "خطأ داخلي" }, { status: 500 });
  }
}

// ── POST — أضف مورد جديد ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getOwnerIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { name, phone, company, notes } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "اسم المورد مطلوب" }, { status: 400 });
    }

    const supplier = await Supplier.create({
      userId,
      name:    name.trim(),
      phone:   phone?.trim()   || "",
      company: company?.trim() || "",
      notes:   notes?.trim()   || "",
    });

    return NextResponse.json(supplier, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/suppliers error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الإضافة" }, { status: 500 });
  }
}