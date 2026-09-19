// app/api/auth/register/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import bcrypt from "bcryptjs";
import { sendVerificationOTPEmail } from "@/lib/emailTemplates";
import crypto from "crypto";

// ── مباشرةً هنا بدون fetch داخلي ──────────────────────────────────────────
async function sendVerificationOTP(userId: string, email: string, shopName: string, preferredLanguage: "ar" | "en") {
  // احذف أي كود قديم
  await EmailVerificationToken.deleteMany({ userId });

  // كود 6 أرقام صالح 10 دقائق
  const code      = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerificationToken.create({ userId, code, expiresAt });

  await sendVerificationOTPEmail({ to: email, code, shopName, preferredLanguage });
}

// ── Register Route ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { shopName, email, password, preferredLanguage } = await req.json();
    const lang: "ar" | "en" = preferredLanguage === "en" ? "en" : "ar";

    // ── Validation ──
    if (!shopName?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "MISSING_FIELDS" }, { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    // ── Check duplicate ──
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "EMAIL_ALREADY_USED" }, { status: 400 });
    }

    // ── Create user ──
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      shopName:          shopName.trim(),
      email:             email.toLowerCase().trim(),
      password:          hashedPassword,
      plan:              "free",
      maxCustomers:      10,
      subscriptionStart: new Date(),
      isActive:          true,
      isVerified:        false,
      preferredLanguage: lang,
    });

    // ── Send OTP — لا ننتظره يكمل قبل ما نرد ──
    sendVerificationOTP(
      newUser._id.toString(),
      newUser.email,
      newUser.shopName,
      lang
    ).catch(err => console.error("OTP send error (background):", err));

    // ── رد فوري للمستخدم ──
    return NextResponse.json({
      success:      true,
      userId:       newUser._id.toString(),
      shopName:     newUser.shopName,
      email:        newUser.email,
      plan:         newUser.plan,
      maxCustomers: newUser.maxCustomers,
      isVerified:   false,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
