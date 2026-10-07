// app/api/notifications/[id]/route.ts
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/models/Notification";
import { getApiOwner } from "@/lib/apiAuth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getApiOwner(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  await Notification.updateOne({ _id: id, userId: auth.ownerId }, { isRead: true });

  return NextResponse.json({ success: true });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getApiOwner(req);
  if (!auth) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  await connectDB();
  const { id } = await params;

  await Notification.deleteOne({ _id: id, userId: auth.ownerId });

  return NextResponse.json({ success: true });
}
