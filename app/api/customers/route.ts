/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";
import { getToken } from "next-auth/jwt";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const ownerId = token.userId as string;

    if (!ownerId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const customers = await Customer.find({ userId: ownerId })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(customers);
  } catch (error: any) {
    console.error("Customers API Error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // ✅ الـ member بدور "member" ما يقدر يضيف — فقط "admin" يقدر
    const isMember   = (token as any).isMember;
    const memberRole = (token as any).memberRole;

    if (isMember && memberRole !== "admin") {
      return NextResponse.json({ error: "NO_PERMISSION_ADD_CUSTOMER" }, { status: 403 });
    }

    // ✅ ownerId سواء كان owner أو admin member
    const ownerId = token.userId as string;

    if (!ownerId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // جيب بيانات الـ owner للتحقق من الباقة
    const owner = await User.findById(ownerId);
    if (!owner) {
      return NextResponse.json({ error: "STORE_NOT_FOUND" }, { status: 404 });
    }

    const body = await req.json();
    const { name, phone } = body;

    if (!name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    // نظام الباقات
    if (owner.plan === "free") {
      const count = await Customer.countDocuments({ userId: ownerId });
      if (count >= owner.maxCustomers) {
        return NextResponse.json(
          { error: "CUSTOMER_LIMIT_REACHED", vars: { limit: owner.maxCustomers } },
          { status: 403 }
        );
      }
    }

    const customer = await Customer.create({
      userId: ownerId,
      name:   name.trim(),
      phone:  phone.trim(),
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error: any) {
    console.error("Create Customer Error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
