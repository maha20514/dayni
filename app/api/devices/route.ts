import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { DeviceToken } from "@/models/DeviceToken";

// Register (or re-assign) a push token for the signed-in user.
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token, platform } = await req.json();
  if (typeof token !== "string" || token.length < 20 || !["ios", "android"].includes(platform)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  await connectDB();
  await DeviceToken.findOneAndUpdate(
    { token },
    { userId: session.user.id, platform, updatedAt: new Date() },
    { upsert: true }
  );
  return NextResponse.json({ success: true });
}

// Unregister on logout.
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { token } = await req.json();
  await connectDB();
  await DeviceToken.deleteOne({ token, userId: session.user.id });
  return NextResponse.json({ success: true });
}
