// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import { sendPasswordResetEmail } from "@/lib/emailTemplates";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email, preferredLanguage } = await req.json();
    if (!email) return NextResponse.json({ error: "EMAIL_REQUIRED" }, { status: 400 });

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "INVALID_EMAIL" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });

    // لا تُخبر المستخدم إذا الإيميل غير موجود (أمان)
    if (!user) return NextResponse.json({ success: true });

    if (user.provider === "google") {
      return NextResponse.json({ error: "GOOGLE_ACCOUNT_RESET" }, { status: 400 });
    }

    // ✅ اللغة الحالية بالواجهة (المرسلة من الفورم) لها الأولوية على القيمة
    // المخزّنة بقاعدة البيانات — لأن المستخدم غير مسجّل دخول هنا، وزر تبديل
    // اللغة بالـ Navbar ما يقدر يحفظ التفضيل بدون جلسة. نحدّث السجل أيضًا
    // حتى تبقى القيمتان متزامنتين لأي إيميل قادم لاحقًا.
    const lang: "ar" | "en" = preferredLanguage === "en" || preferredLanguage === "ar"
      ? preferredLanguage
      : (user.preferredLanguage || "ar");

    if (user.preferredLanguage !== lang) {
      user.preferredLanguage = lang;
      await user.save();
    }

    // احذف أي token قديم
    await PasswordResetToken.deleteMany({ userId: user._id });

    // أنشئ token جديد
    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة

    await PasswordResetToken.create({ userId: user._id, token, expiresAt });

    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/settings/reset-password?token=${token}`;

    await sendPasswordResetEmail({
      to: user.email,
      shopName: user.shopName,
      resetUrl,
      preferredLanguage: lang,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
