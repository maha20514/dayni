/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getApiOwner } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    const auth = await getApiOwner(req);
    if (!auth) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    await connectDB();

    const { avatar } = await req.json();
    const userId = auth.ownerId; // never trust a client-supplied userId

    if (!avatar) {
      return NextResponse.json({ error: "avatar مطلوب" }, { status: 400 });
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