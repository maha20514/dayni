// app/api/notifications/[id]/route.ts
import { connectDB } from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import { Notification } from "@/models/Notification";
 
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
 
  await Notification.findByIdAndUpdate(id, { isRead: true });
 
  return NextResponse.json({ success: true });
}
 
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
 
  await Notification.findByIdAndDelete(id);
 
  return NextResponse.json({ success: true });
}