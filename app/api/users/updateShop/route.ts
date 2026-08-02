/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/users/updateShop/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { getToken } from "next-auth/jwt";

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // 🔥 جيب المستخدم من DB
    const currentUser = await User.findOne({ email: token.email });

    if (!currentUser) {
      return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    }

    const body = await req.json();
    const { shopName, avatar, email } = body;

    const updateData: any = {};

    if (shopName) updateData.shopName = shopName.trim();
    if (avatar) updateData.avatar = avatar;

    // 🔒 منع تغيير الإيميل لحساب Google
    if (email) {
      if (!currentUser.password) {
        return NextResponse.json(
          { error: "لا يمكن تغيير الإيميل لحسابات جوجل" },
          { status: 400 }
        );
      }

      updateData.email = email.toLowerCase().trim();
    }

    const user = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { new: true }
    );

    return NextResponse.json({
      message: "تم التحديث بنجاح",
      user,
    });
  } catch (error: any) {
    console.error("Update Shop Error:", error);
    return NextResponse.json(
      { error: "فشل في التحديث" },
      { status: 500 }
    );
  }
}