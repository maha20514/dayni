/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Notification } from "@/models/Notification";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { User } from "@/models/User";
import { hasFeature } from "@/lib/permissions";
import { Plan } from "@/lib/features";
 
// ── helper: get plan from session or DB ──
async function getUserPlan(session: any): Promise<Plan> {
  const planFromSession = (session.user as any)?.plan;
  if (planFromSession) return planFromSession as Plan;
 
  await connectDB();
  const user = await User.findById(session.user.id).select("plan");
  return (user?.plan || "free") as Plan;
}
 
// ── GET ──────────────────────────────────────
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
 
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const plan = await getUserPlan(session);
    if (!hasFeature(plan, "notifications")) {
      return NextResponse.json(
        { error: "هذه الميزة غير متاحة في خطتك الحالية" },
        { status: 403 }
      );
    }
 
    await connectDB();
    const userId = session.user.id;
 
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20);
 
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });
 
    return NextResponse.json({ notifications, count: unreadCount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
 
// ── PATCH ─────────────────────────────────────
export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
 
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
 
    const plan = await getUserPlan(session);
    if (!hasFeature(plan, "notifications")) {
      return NextResponse.json(
        { error: "هذه الميزة غير متاحة في خطتك الحالية" },
        { status: 403 }
      );
    }
 
    await connectDB();
    const userId = session.user.id;
    const { notificationIds, markAll } = await req.json();
 
    if (markAll) {
      await Notification.updateMany(
        { userId, isRead: false },
        { $set: { isRead: true } }
      );
    } else if (notificationIds?.length) {
      await Notification.updateMany(
        { _id: { $in: notificationIds }, userId },
        { $set: { isRead: true } }
      );
    }
 
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}