/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const HYPERPAY_URL = "https://test.oppwa.com/v1/checkouts";
const ENTITY_ID = process.env.HYPERPAY_ENTITY_ID || "8ac7a4c9..."; // ضع Entity ID هنا
const AUTH_TOKEN = process.env.HYPERPAY_TOKEN || "Bearer OGE4M..."; // ضع Access Token هنا

export async function POST(req: NextRequest) {
  try {
    const { userId, plan, amount } = await req.json();

    if (!userId || !plan || !amount) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const paymentData = {
      entityId: ENTITY_ID,
      amount: amount.toString(),
      currency: "SAR",
      paymentType: "DB", // Debit
      notificationUrl: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/payment/callback`,
      merchantTransactionId: `dayni_${userId}_${Date.now()}`,
      customer: {
        givenName: "متجر دَيني",
        email: "customer@dayni.com",
      },
    };

    const response = await fetch(HYPERPAY_URL, {
      method: "POST",
      headers: {
        "Authorization": AUTH_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(paymentData),
    });

    const result = await response.json();

    if (result.result?.code?.startsWith("000.200")) {
      // نجح إنشاء الـ Checkout
      return NextResponse.json({
        success: true,
        paymentUrl: result.redirect.url || `https://test.oppwa.com/v1/checkouts/${result.id}/payment`,
        checkoutId: result.id,
      });
    } else {
      return NextResponse.json({
        error: result.result?.description || "فشل في إنشاء جلسة الدفع",
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error("HyperPay Error:", error);
    return NextResponse.json({ error: "حدث خطأ في الاتصال بـ HyperPay" }, { status: 500 });
  }
}