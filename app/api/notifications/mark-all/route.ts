// app/api/notifications/mark-all/route.ts

import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/models/Notification";

export async function PATCH(req: NextRequest) {
  await connectDB();

  const { userId } = await req.json();

  await Notification.updateMany(
    { userId, isRead: false },
    { isRead: true }
  );

  return NextResponse.json({ success: true });
}