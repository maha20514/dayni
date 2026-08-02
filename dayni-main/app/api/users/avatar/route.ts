/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { userId, avatar } = await req.json();

    if (!userId || !avatar) {
      return NextResponse.json({ error: "userId و avatar مطلوبان" }, { status: 400 });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "تم تحديث الصورة بنجاح",
      avatar: user.avatar 
    });

  } catch (error: any) {
    console.error("Update Avatar Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء تحديث الصورة" }, { status: 500 });
  }
}