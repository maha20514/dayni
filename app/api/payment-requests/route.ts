/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { PaymentRequest } from "@/models/PaymentRequest";
import { getToken } from "next-auth/jwt";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { plan, transferRef, notes, proofImage } = await req.json();

    if (!plan || !["basic", "pro"].includes(plan)) {
      return NextResponse.json({ error: "الخطة غير صحيحة" }, { status: 400 });
    }

    const amount = plan === "pro" ? 39 : 19;

    // Check if there's already a pending request
    const existing = await PaymentRequest.findOne({
      userId: token.userId,
      status: "pending",
    });

    if (existing) {
      return NextResponse.json(
        { error: "لديك طلب دفع قيد المراجعة بالفعل. انتظر حتى يتم مراجعته." },
        { status: 400 }
      );
    }

    const request = await PaymentRequest.create({
      userId:      token.userId,
      plan,
      amount,
      transferRef: transferRef?.trim() || "",
      notes:       notes?.trim() || "",
      proofImage:  proofImage || null,
    });

    return NextResponse.json({ success: true, requestId: request._id }, { status: 201 });
  } catch (error: any) {
    console.error("Payment request error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token?.userId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const requests = await PaymentRequest.find({ userId: token.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    return NextResponse.json(requests);
  } catch (error: any) {
    console.error("Get payment requests error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}