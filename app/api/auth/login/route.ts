/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ 
        error: "البريد الإلكتروني وكلمة المرور مطلوبان" 
      }, { status: 400 });
    }

    const normalizedEmail = email.toString().trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json({ 
        error: "هذا البريد الإلكتروني غير مسجل" 
      }, { status: 400 });
    }

    // التحقق من كلمة المرور
    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      console.log("❌ Incorrect password for:", normalizedEmail);
      return NextResponse.json({ 
        error: "كلمة المرور غير صحيحة" 
      }, { status: 400 });
    }

    // === التحقق من حالة الاشتراك (محسن) ===
    const isActive = user.isActive !== false;   // إذا كان undefined أو true → نشط

    if (!isActive) {
      return NextResponse.json({ 
        error: "حسابك غير نشط. يرجى التواصل مع الدعم" 
      }, { status: 403 });
    }

    console.log("✅ Login successful for:", normalizedEmail);

    return NextResponse.json({
      success: true,
      userId: user._id.toString(),
      shopName: user.shopName || "متجري",
      email: user.email,                    
      avatar: user.avatar || "/default-avatar.png", 
      plan: user.plan || "free",
      maxCustomers: user.maxCustomers || 10,
      isActive: isActive,
    });

  } catch (error: any) {
    console.error("Login API Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ في الخادم" 
    }, { status: 500 });
  }
}