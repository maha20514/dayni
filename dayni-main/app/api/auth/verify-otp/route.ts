// app/api/auth/verify-otp/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, code } = await req.json();

    if (!userId || !code) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const record = await EmailVerificationToken.findOne({ userId });

    if (!record) {
      return NextResponse.json(
        { error: "الكود غير موجود أو منتهي الصلاحية، اطلب كوداً جديداً" },
        { status: 400 }
      );
    }

    // منتهي الصلاحية
    if (record.expiresAt < new Date()) {
      await EmailVerificationToken.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "انتهت صلاحية الكود، اطلب كوداً جديداً" },
        { status: 400 }
      );
    }

    // brute-force protection — max 5 محاولات
    if (record.attempts >= 5) {
      await EmailVerificationToken.deleteOne({ _id: record._id });
      return NextResponse.json(
        { error: "تجاوزت عدد المحاولات المسموح بها، اطلب كوداً جديداً" },
        { status: 429 }
      );
    }

    // كود غلط
    if (record.code !== code.trim()) {
      await EmailVerificationToken.findByIdAndUpdate(record._id, {
        $inc: { attempts: 1 },
      });
      const remaining = 5 - (record.attempts + 1);
      return NextResponse.json(
        { error: `الكود غير صحيح — تبقى ${remaining} محاولات` },
        { status: 400 }
      );
    }

    // ✅ صحيح — حدّث المستخدم
    await User.findByIdAndUpdate(userId, { isVerified: true });
    await EmailVerificationToken.deleteOne({ _id: record._id });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}