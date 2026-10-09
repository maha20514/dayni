// app/api/notifications/mark-all/route.ts

import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/models/Notification";
import { getApiOwner } from "@/lib/apiAuth";

export async function PATCH(req: NextRequest) {
  const auth = await getApiOwner(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  await connectDB();

  // Only the signed-in owner's notifications; any userId in the body is ignored.
  await Notification.updateMany(
    { userId: auth.ownerId, isRead: false },
    { isRead: true }
  );

  return NextResponse.json({ success: true });
}
