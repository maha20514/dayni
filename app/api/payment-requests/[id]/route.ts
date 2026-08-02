/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PaymentRequest } from "@/models/PaymentRequest";
import { User } from "@/models/User";
import { getToken } from "next-auth/jwt";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "dayni-admin-2026";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    // Auth: check either admin secret header OR admin user role
    const adminHeader = req.headers.get("x-admin-secret");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    const isAdmin =
      adminHeader === ADMIN_SECRET ||
      (token as any)?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { id } = await params;
    const { status } = await req.json();

    if (!["approved", "rejected"].includes(status)) {
      return NextResponse.json({ error: "الحالة غير صحيحة" }, { status: 400 });
    }

    const request = await PaymentRequest.findById(id);
    if (!request) {
      return NextResponse.json({ error: "الطلب غير موجود" }, { status: 404 });
    }

    request.status = status;
    request.reviewedAt = new Date();
    await request.save();

    // If approved, upgrade user plan
    if (status === "approved") {
      const maxCustomers = request.plan === "pro" ? 999999 : 100;
      await User.findByIdAndUpdate(request.userId, {
        plan:              request.plan,
        isActive:          true,
        maxCustomers,
        subscriptionStart: new Date(),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin approve error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// GET all pending requests (admin only)
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const adminHeader = req.headers.get("x-admin-secret");
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const isAdmin =
      adminHeader === ADMIN_SECRET ||
      (token as any)?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const requests = await PaymentRequest.find({})
      .sort({ createdAt: -1 })
      .populate("userId", "shopName email plan")
      .lean();

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Admin get requests error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}