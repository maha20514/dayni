// app/api/team/[memberId]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { TeamMember } from "@/models/Teammember";

async function getOwnerId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  return token?.userId as string | null;
}

// ── PATCH — تعديل الدور أو الحالة ────────────────────────────────────────
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    await connectDB();
    const ownerId = await getOwnerId(req);
    if (!ownerId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { memberId } = await params;
    const { role, status } = await req.json();

    const member = await TeamMember.findOne({ _id: memberId, ownerId });
    if (!member) {
      return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
    }

    if (role)   member.role   = role;
    if (status) member.status = status;
    await member.save();

    return NextResponse.json({ success: true, member });
  } catch (error: any) {
    console.error("PATCH /api/team/[id] error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// ── DELETE — حذف العضو ───────────────────────────────────────────────────
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    await connectDB();
    const ownerId = await getOwnerId(req);
    if (!ownerId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { memberId } = await params;

    const member = await TeamMember.findOneAndDelete({ _id: memberId, ownerId });
    if (!member) {
      return NextResponse.json({ error: "العضو غير موجود" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("DELETE /api/team/[id] error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}