// app/api/auth/register/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import crypto from "crypto";

// ── مباشرةً هنا بدون fetch داخلي ──────────────────────────────────────────
async function sendVerificationOTP(userId: string, email: string, shopName: string) {
  // احذف أي كود قديم
  await EmailVerificationToken.deleteMany({ userId });

  // كود 6 أرقام صالح 10 دقائق
  const code      = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await EmailVerificationToken.create({ userId, code, expiresAt });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  await transporter.sendMail({
    from:    `"دَيني" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
    replyTo: process.env.SUPPORT_EMAIL || "support@dayni.app",
    to:      email,
    subject: `${code} — رمز التحقق من بريدك الإلكتروني`,
    html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:480px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">📩</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">تأكيد البريد الإلكتروني</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">دَيني — نظام إدارة الديون</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
              مرحباً <strong>${shopName}</strong>،
            </p>
            <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7;">
              استخدم الرمز أدناه لتأكيد بريدك الإلكتروني. صالح لمدة <strong>10 دقائق</strong> فقط.
            </p>
            <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;">
              <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;letter-spacing:2px;">رمز التحقق</p>
              <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#1e40af;font-family:monospace;">
                ${code}
              </div>
              <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">ينتهي خلال 10 دقائق</p>
            </div>
            <div style="background:#fef9c3;border-radius:12px;padding:14px 18px;">
              <p style="margin:0;color:#854d0e;font-size:13px;line-height:1.7;">
                🔒 لا تشارك هذا الرمز مع أحد. فريق دَيني لن يطلب منك هذا الرمز أبداً.
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
    text: `رمز التحقق من دَيني: ${code}\n\nصالح لمدة 10 دقائق فقط.\nلا تشاركه مع أحد.\n\n— فريق دَيني`,
  });
}

// ── Register Route ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { shopName, email, password } = await req.json();

    // ── Validation ──
    if (!shopName?.trim() || !email?.trim() || !password) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }

    // ── Check duplicate ──
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم مسبقاً" }, { status: 400 });
    }

    // ── Create user ──
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      shopName:          shopName.trim(),
      email:             email.toLowerCase().trim(),
      password:          hashedPassword,
      plan:              "free",
      maxCustomers:      10,
      subscriptionStart: new Date(),
      isActive:          true,
      isVerified:        false,
    });

    // ── Send OTP — لا ننتظره يكمل قبل ما نرد ──
    // نرسل الرد فوراً والإيميل يتبعثر في الخلفية
    sendVerificationOTP(
      newUser._id.toString(),
      newUser.email,
      newUser.shopName
    ).catch(err => console.error("OTP send error (background):", err));

    // ── رد فوري للمستخدم ──
    return NextResponse.json({
      success:      true,
      userId:       newUser._id.toString(),
      shopName:     newUser.shopName,
      email:        newUser.email,
      plan:         newUser.plan,
      maxCustomers: newUser.maxCustomers,
      isVerified:   false,
    }, { status: 201 });

  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json({ error: "حدث خطأ أثناء التسجيل" }, { status: 500 });
  }
}