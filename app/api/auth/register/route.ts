/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { shopName, email, password } = await req.json();

    if (!shopName || !email || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم مسبقاً" }, { status: 400 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      shopName: shopName.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      plan: "free",
      maxCustomers: 10,
      subscriptionStart: new Date(),
      isActive: true,
    });

    return NextResponse.json({
      success: true,
      userId: newUser._id.toString(),
      shopName: newUser.shopName,
      plan: newUser.plan,
      maxCustomers: newUser.maxCustomers,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}