// app/api/team/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { User } from "@/models/User";
import { sendTeamInviteEmail } from "@/lib/emailTemplates";
import crypto from "crypto";
import { TeamMember } from "@/models/Teammember";

// ── helper: جيب الـ ownerId من الـ token ─────────────────────────────────
async function getOwnerId(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  if (!token) return null;

  // لو هو owner
  if (token.userId) return token.userId as string;

  return null;
}

// ── GET — جيب أعضاء الفريق ───────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const ownerId = await getOwnerId(req);
    if (!ownerId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    // تحقق إن الـ plan هو pro
    const owner = await User.findById(ownerId);
    if (!owner || owner.plan !== "pro") {
      return NextResponse.json({ error: "PRO_PLAN_ONLY" }, { status: 403 });
    }

    const members = await TeamMember.find({ ownerId }).sort({ createdAt: -1 });

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}

// ── POST — دعوة عضو جديد ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const ownerId = await getOwnerId(req);
    if (!ownerId) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const owner = await User.findById(ownerId);
    if (!owner || owner.plan !== "pro") {
      return NextResponse.json({ error: "PRO_PLAN_ONLY" }, { status: 403 });
    }

    const { email, name, role } = await req.json();

    if (!email?.trim() || !name?.trim()) {
      return NextResponse.json({ error: "TEAM_NAME_EMAIL_REQUIRED" }, { status: 400 });
    }

    // تحقق من الحد — max 5 أعضاء للـ pro
    const count = await TeamMember.countDocuments({ ownerId, status: { $ne: "disabled" } });
    if (count >= 5) {
      return NextResponse.json({ error: "TEAM_LIMIT_REACHED" }, { status: 403 });
    }

    // تحقق إن الإيميل ما يكون مكرر
    const existing = await TeamMember.findOne({
      ownerId,
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json({ error: "EMAIL_ALREADY_INVITED" }, { status: 400 });
    }

    // أنشئ token الدعوة
    const inviteToken   = crypto.randomBytes(32).toString("hex");
    const inviteExpires = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 ساعة

    const member = await TeamMember.create({
      ownerId,
      email:   email.toLowerCase().trim(),
      name:    name.trim(),
      role:    role || "member",
      status:  "pending",
      inviteToken,
      inviteExpires,
    });

    // ── إرسال إيميل الدعوة (بلغة صاحب المتجر) ──
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/team/accept?token=${inviteToken}`;

    sendTeamInviteEmail({
      to: email.trim(),
      memberName: name.trim(),
      ownerShopName: owner.shopName,
      role: role || "member",
      inviteUrl,
      preferredLanguage: owner.preferredLanguage || "ar",
    }).catch(err => console.error("Invite email error:", err));

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}
