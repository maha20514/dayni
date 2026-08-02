// app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    await connectDB();

    const record = await PasswordResetToken.findOne({ token });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "الرابط منتهي الصلاحية أو غير صالح" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(record.userId, { password: hashed });
    await PasswordResetToken.deleteOne({ token }); // احذف بعد الاستخدام

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}