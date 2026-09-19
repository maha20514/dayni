// app/api/auth/send-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import { sendVerificationOTPEmail } from "@/lib/emailTemplates";
import crypto from "crypto";

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, preferredLanguage } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: "USERID_REQUIRED" }, { status: 400 });
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "EMAIL_ALREADY_VERIFIED" }, { status: 400 });
    }

    // ✅ نفس مبدأ forgot-password: المستخدم لسا غير مسجّل دخول بهذي المرحلة
    // (يتحقق من بريده أول)، فاللغة الحالية بالواجهة (لو انبعثت) لها الأولوية
    // على القيمة المخزّنة، مع تحديث السجل حتى تبقى متزامنة.
    const lang: "ar" | "en" = preferredLanguage === "en" || preferredLanguage === "ar"
      ? preferredLanguage
      : (user.preferredLanguage || "ar");

    if (user.preferredLanguage !== lang) {
      user.preferredLanguage = lang;
      await user.save();
    }

    // احذف أي كود قديم
    await EmailVerificationToken.deleteMany({ userId });

    // أنشئ كود جديد — صالح 10 دقائق
    const code      = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await EmailVerificationToken.create({ userId, code, expiresAt });

    await sendVerificationOTPEmail({
      to: user.email,
      code,
      shopName: user.shopName,
      preferredLanguage: lang,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "SEND_OTP_FAILED" }, { status: 500 });
  }
}
