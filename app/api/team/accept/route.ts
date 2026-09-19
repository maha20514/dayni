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
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "PASSWORD_TOO_SHORT" }, { status: 400 });
    }

    // جيب الـ member بالـ token
    const member = await TeamMember.findOne({ inviteToken: token });

    if (!member) {
      return NextResponse.json({ error: "INVITE_INVALID" }, { status: 400 });
    }

    // تحقق من انتهاء الصلاحية
    if (member.inviteExpires && member.inviteExpires < new Date()) {
      return NextResponse.json({ error: "INVITE_EXPIRED" }, { status: 400 });
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
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
