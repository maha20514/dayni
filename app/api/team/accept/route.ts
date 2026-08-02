// app/api/team/accept/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { TeamMember } from "@/models/Teammember";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" },
        { status: 400 }
      );
    }

    // جيب الـ member بالـ token
    const member = await TeamMember.findOne({ inviteToken: token });

    if (!member) {
      return NextResponse.json(
        { error: "رابط الدعوة غير صالح أو منتهي الصلاحية" },
        { status: 400 }
      );
    }

    // تحقق من انتهاء الصلاحية
    if (member.inviteExpires && member.inviteExpires < new Date()) {
      return NextResponse.json(
        { error: "انتهت صلاحية رابط الدعوة، اطلب من صاحب المتجر إرسال دعوة جديدة" },
        { status: 400 }
      );
    }

    // hash الباسوورد
    const hashed = await bcrypt.hash(password, 10);

    // فعّل الحساب
    member.password      = hashed;
    member.status        = "active";
    member.inviteToken   = null;
    member.inviteExpires = null;
    await member.save();

    return NextResponse.json({
      success: true,
      email:   member.email,
      name:    member.name,
      role:    member.role,
      ownerId: member.ownerId.toString(),
    });
  } catch (error: any) {
    console.error("Accept invite error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}