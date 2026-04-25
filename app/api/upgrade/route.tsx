/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, newPlan } = await req.json();

    if (!userId || !newPlan) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const validPlans = ["free", "basic", "pro"];
    if (!validPlans.includes(newPlan)) {
      return NextResponse.json({ error: "نوع الخطة غير صالح" }, { status: 400 });
    }

    let maxCustomers = 10;
    if (newPlan === "basic") maxCustomers = 999999;   // غير محدود
    if (newPlan === "pro") maxCustomers = 999999;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        plan: newPlan,
        maxCustomers: maxCustomers,
        subscriptionStart: new Date(),
        // subscriptionEnd: يمكن إضافته لاحقاً إذا أردت اشتراك شهري
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `تم الترقية بنجاح إلى خطة ${newPlan === "basic" ? "الأساسية" : "الاحترافية"}`,
      plan: updatedUser.plan,
      maxCustomers: updatedUser.maxCustomers,
    });

  } catch (error: any) {
    console.error("Upgrade Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء الترقية" }, { status: 500 });
  }
}