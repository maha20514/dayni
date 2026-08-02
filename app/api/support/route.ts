// app/api/support/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { subject, message, shopName, email, plan } = await req.json();

    if (!subject?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "البيانات ناقصة" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const planLabel = plan === "pro" ? "⚡ PRO — أولوية" : plan === "basic" ? "Basic" : "مجاني";
    const priority  = plan === "pro" ? "high" : "normal";

    await transporter.sendMail({
      from:    `"${shopName} via دَيني" <${process.env.GMAIL_USER}>`,
      to:       process.env.GMAIL_USER!,
      replyTo:  email,
      subject:  `[${planLabel}] ${subject} — ${shopName}`,
      priority,
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:560px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:${plan === "pro" ? "linear-gradient(135deg,#7c3aed,#4f46e5)" : "linear-gradient(135deg,#2563eb,#4f46e5)"};padding:28px 40px;">
            <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;">
              ${plan === "pro" ? "⚡ طلب دعم بأولوية" : "📧 طلب دعم جديد"}
            </h1>
            <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${planLabel}</p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 40px;">

            <!-- Info -->
            <table width="100%" style="background:#f8fafc;border-radius:12px;padding:16px;margin-bottom:24px;">
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:13px;">المتجر:</span>
                  <strong style="color:#0f172a;font-size:13px;margin-right:8px;">${shopName}</strong>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:13px;">البريد:</span>
                  <a href="mailto:${email}" style="color:#2563eb;font-size:13px;margin-right:8px;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:6px 0;">
                  <span style="color:#64748b;font-size:13px;">الباقة:</span>
                  <strong style="color:#0f172a;font-size:13px;margin-right:8px;">${planLabel}</strong>
                </td>
              </tr>
            </table>

            <!-- Subject -->
            <h2 style="margin:0 0 12px;color:#0f172a;font-size:18px;font-weight:800;">${subject}</h2>

            <!-- Message -->
            <div style="background:#f1f5f9;border-right:4px solid ${plan === "pro" ? "#7c3aed" : "#2563eb"};border-radius:8px;padding:16px 20px;">
              <p style="margin:0;color:#475569;font-size:15px;line-height:1.8;white-space:pre-wrap;">${message}</p>
            </div>

            <!-- Reply CTA -->
            <div style="margin-top:24px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${subject}"
                 style="display:inline-block;background:${plan === "pro" ? "#7c3aed" : "#2563eb"};color:#fff;
                        text-decoration:none;font-size:15px;font-weight:700;padding:14px 32px;
                        border-radius:14px;">
                الرد على ${shopName} ←
              </a>
            </div>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:16px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              دَيني — نظام إدارة الديون | support@dayni.app
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`,
    });

    // أرسل تأكيد للمستخدم
    await transporter.sendMail({
      from:    `"دَيني" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
      to:      email,
      subject: `تم استلام طلبك — ${subject}`,
      html: `
<div dir="rtl" style="font-family:'Segoe UI',Arial,sans-serif;max-width:480px;margin:auto;padding:32px;">
  <h2 style="color:#1e40af;">مرحباً ${shopName} 👋</h2>
  <p style="color:#475569;line-height:1.7;">
    تم استلام طلب الدعم الخاص بك بنجاح.
    <br/>
    سنرد عليك ${plan === "pro" ? "<strong>خلال 4 ساعات عمل</strong>" : "في أقرب وقت"}.
  </p>
  <div style="background:#f1f5f9;border-radius:12px;padding:16px;margin:20px 0;">
    <p style="margin:0;color:#64748b;font-size:13px;"><strong>الموضوع:</strong> ${subject}</p>
  </div>
  <p style="color:#94a3b8;font-size:12px;">— فريق دَيني | support@dayni.app</p>
</div>`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Support API error:", err);
    return NextResponse.json({ error: "فشل الإرسال" }, { status: 500 });
  }
}