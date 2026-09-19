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
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    await connectDB();

    const record = await PasswordResetToken.findOne({ token });

    if (!record || record.expiresAt < new Date()) {
      return NextResponse.json({ error: "RESET_LINK_EXPIRED" }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(record.userId, { password: hashed });
    await PasswordResetToken.deleteOne({ token }); // احذف بعد الاستخدام

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
