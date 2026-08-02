/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PaymentRequest } from "@/models/PaymentRequest";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "dayni-admin-2026";

export async function GET(req: NextRequest) {
  try {
    const adminHeader = req.headers.get("x-admin-secret");
    if (adminHeader !== ADMIN_SECRET) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    await connectDB();

    const requests = await PaymentRequest.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "shopName email plan")
      .lean();

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Admin get all requests error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}