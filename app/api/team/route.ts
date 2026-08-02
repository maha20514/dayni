// app/api/team/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { getToken } from "next-auth/jwt";
import { User } from "@/models/User";
import nodemailer from "nodemailer";
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
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    // تحقق إن الـ plan هو pro
    const owner = await User.findById(ownerId);
    if (!owner || owner.plan !== "pro") {
      return NextResponse.json(
        { error: "هذه الميزة متاحة في الباقة الاحترافية فقط" },
        { status: 403 }
      );
    }

    const members = await TeamMember.find({ ownerId }).sort({ createdAt: -1 });

    return NextResponse.json({ members });
  } catch (error: any) {
    console.error("GET /api/team error:", error);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

// ── POST — دعوة عضو جديد ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const ownerId = await getOwnerId(req);
    if (!ownerId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const owner = await User.findById(ownerId);
    if (!owner || owner.plan !== "pro") {
      return NextResponse.json(
        { error: "هذه الميزة متاحة في الباقة الاحترافية فقط" },
        { status: 403 }
      );
    }

    const { email, name, role } = await req.json();

    if (!email?.trim() || !name?.trim()) {
      return NextResponse.json(
        { error: "الاسم والبريد الإلكتروني مطلوبان" },
        { status: 400 }
      );
    }

    // تحقق من الحد — max 5 أعضاء للـ pro
    const count = await TeamMember.countDocuments({ ownerId, status: { $ne: "disabled" } });
    if (count >= 5) {
      return NextResponse.json(
        { error: "وصلت للحد الأقصى (5 أعضاء)" },
        { status: 403 }
      );
    }

    // تحقق إن الإيميل ما يكون مكرر
    const existing = await TeamMember.findOne({
      ownerId,
      email: email.toLowerCase().trim(),
    });
    if (existing) {
      return NextResponse.json(
        { error: "هذا البريد الإلكتروني مدعو مسبقاً" },
        { status: 400 }
      );
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

    // ── إرسال إيميل الدعوة ──
    const inviteUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/team/accept?token=${inviteToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from:    `"دَيني" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
      to:      email.trim(),
      subject: `${owner.shopName} يدعوك للانضمام إلى دَيني`,
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:500px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">👥</div>
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:900;">دعوة للانضمام</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">دَيني — نظام إدارة الديون</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">
              مرحباً <strong>${name}</strong>،
            </p>
            <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7;">
              قام <strong>${owner.shopName}</strong> بدعوتك للانضمام إلى فريق العمل على منصة دَيني
              بصفتك <strong>${role === "admin" ? "مدير" : "عضو"}</strong>.
            </p>
            <div style="text-align:center;margin:0 0 32px;">
              <a href="${inviteUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;
                        text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;
                        border-radius:16px;box-shadow:0 8px 20px rgba(37,99,235,0.35);">
                قبول الدعوة ←
              </a>
            </div>
            <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;">
              <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">
                ⏰ هذه الدعوة صالحة لمدة <strong>48 ساعة</strong> فقط.
                <br/>إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهلها.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © ${new Date().getFullYear()} دَيني &nbsp;|&nbsp;
              <a href="mailto:support@dayni.app" style="color:#2563eb;text-decoration:none;">support@dayni.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    }).catch(err => console.error("Invite email error:", err));

    return NextResponse.json({ success: true, member }, { status: 201 });
  } catch (error: any) {
    console.error("POST /api/team error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء إرسال الدعوة" }, { status: 500 });
  }
}