// app/api/suppliers/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Supplier } from "@/models/Supplier";
import { getToken } from "next-auth/jwt";
import { User } from "@/models/User";
import { FREE_SUPPLIER_LIMIT } from "@/lib/limits";

async function getOwnerIdFromToken(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;
  return token.userId as string;
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getOwnerIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const suppliers = await Supplier.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(suppliers);
  } catch (error: any) {
    console.error("GET /api/suppliers error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const userId = await getOwnerIdFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const { name, phone, company, notes } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: "SUPPLIER_NAME_REQUIRED" }, { status: 400 });
    }

    // Free plan: limited number of suppliers.
    const owner = await User.findById(userId).select("plan");
    if (!owner) {
      return NextResponse.json({ error: "STORE_NOT_FOUND" }, { status: 404 });
    }
    if (owner.plan === "free") {
      const count = await Supplier.countDocuments({ userId });
      if (count >= FREE_SUPPLIER_LIMIT) {
        return NextResponse.json(
          { error: "SUPPLIER_LIMIT_REACHED", vars: { limit: FREE_SUPPLIER_LIMIT } },
          { status: 403 }
        );
      }
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
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
