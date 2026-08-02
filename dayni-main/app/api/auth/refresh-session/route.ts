/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";
import { encode } from "next-auth/jwt";

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findById(session.user.id).lean() as any;

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // بنّ token جديد بالبيانات الحديثة من DB
  const newToken = {
    userId:       user._id.toString(),
    shopName:     user.shopName,
    plan:         user.plan,
    maxCustomers: user.maxCustomers,
    isActive:     user.isActive,
    avatar:       user.avatar || null,
    email:        user.email,
    name:         user.shopName,
    sub:          user._id.toString(),
    role:         user.role || "user",
  };

  const encoded = await encode({
    token:  newToken,
    secret: process.env.NEXTAUTH_SECRET!,
  });

  // احقن الـ cookie الجديد
  const isProd    = process.env.NODE_ENV === "production";
  const cookieName = isProd
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";

  const response = NextResponse.json({ success: true, plan: user.plan });

  response.cookies.set(cookieName, encoded, {
    httpOnly: true,
    secure:   isProd,
    sameSite: "lax",
    path:     "/",
    maxAge:   30 * 24 * 60 * 60,
  });

  return response;
}