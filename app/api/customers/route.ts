/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";

export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();

    const { userId, name, phone } = body;

    if (!userId || !name?.trim() || !phone?.trim()) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    // جلب بيانات المستخدم
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    // تقييد عدد العملاء في الخطة المجانية
    if (user.plan === "free") {
      const customerCount = await Customer.countDocuments({ userId });

      if (customerCount >= user.maxCustomers) {
        return NextResponse.json({ 
          error: `لقد وصلت إلى الحد الأقصى (${user.maxCustomers} عملاء) في الخطة المجانية.\n\nيرجى الترقية إلى الخطة الأساسية (19 ريال) لإضافة المزيد من العملاء.` 
        }, { status: 403 });
      }
    }

    const customer = await Customer.create({
      userId,
      name: name.trim(),
      phone: phone.trim(),
    });

    return NextResponse.json(customer, { status: 201 });

  } catch (error: any) {
    console.error("Create Customer Error:", error);
    return NextResponse.json({ 
      error: "حدث خطأ أثناء إضافة العميل" 
    }, { status: 500 });
  }
}