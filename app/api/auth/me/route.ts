/* eslint-disable @typescript-eslint/no-explicit-any */
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
   // ✅ أضف هذا — لو member استخدم ownerId
  const userId = (session.user as any).isMember
    ? (session.user as any).ownerId || session.user.id
    : session.user.id;
    
  const user = await User.findById(userId)
    .select("plan maxCustomers isActive")
    .lean();

  // ✅ المستخدم محذوف من DB
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({
    plan:         user.plan,
    maxCustomers: user.maxCustomers,
    isActive:     user.isActive,
  },
{
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate", // ✅ منع الـ cache
      },
    });

}