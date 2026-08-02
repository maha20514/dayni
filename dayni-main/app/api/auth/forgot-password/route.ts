// app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { PasswordResetToken } from "@/models/PasswordResetToken";
import crypto from "crypto";
import nodemailer from "nodemailer";
 
export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 });
 
    // Basic email format check on server side too
    const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json({ error: "صيغة البريد الإلكتروني غير صحيحة" }, { status: 400 });
    }
 
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase().trim() });
 
    // لا تُخبر المستخدم إذا الإيميل غير موجود (أمان)
    if (!user) return NextResponse.json({ success: true });
 
    if (user.provider === "google") {
      return NextResponse.json(
        { error: "هذا الحساب مسجل عبر Google. استخدم زر تسجيل الدخول بجوجل." },
        { status: 400 }
      );
    }
 
    // احذف أي token قديم
    await PasswordResetToken.deleteMany({ userId: user._id });
 
    // أنشئ token جديد
    const token     = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // ساعة واحدة
 
    await PasswordResetToken.create({ userId: user._id, token, expiresAt });
 
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/settings/reset-password?token=${token}`;
 
    // ── Nodemailer — Gmail مع support@dayni.app عبر Gmail alias أو SMTP ──
    // إذا كنت تستخدم Gmail وعندك alias لـ support@dayni.app، الإرسال يكون عبر
    // حساب Gmail الأصلي لكن الـ "from" يظهر كـ support@dayni.app
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,       // ايميلك الحقيقي على Gmail (مثال: yourname@gmail.com)
        pass: process.env.GMAIL_APP_PASSWORD, // App Password من Google Account > Security
      },
    });
 
    await transporter.sendMail({
      from:    `"دَيني" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
      replyTo: process.env.SUPPORT_EMAIL || "support@dayni.app",
      to:      user.email,
      subject: "استعادة كلمة المرور — دَيني",
      html: `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>استعادة كلمة المرور</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;direction:rtl;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
          
          <!-- Header stripe -->
          <tr>
            <td style="background:linear-gradient(135deg,#2563eb,#4f46e5);padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:rgba(255,255,255,0.2);border-radius:16px;font-size:28px;margin-bottom:12px;">🔑</div>
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:900;letter-spacing:-0.5px;">دَيني</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">نظام إدارة الديون</p>
            </td>
          </tr>
 
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">
                استعادة كلمة المرور
              </h2>
              <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">
                مرحباً <strong>${user.shopName}</strong>،
              </p>
              <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7;">
                تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لإكمال العملية. الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.
              </p>
 
              <!-- CTA Button -->
              <div style="text-align:center;margin:0 0 32px;">
                <a href="${resetUrl}"
                   style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:16px;box-shadow:0 8px 20px rgba(37,99,235,0.35);">
                  إعادة تعيين كلمة المرور ←
                </a>
              </div>
 
              <!-- Security note -->
              <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">
                  🔒 إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. حسابك لن يتأثر.
                </p>
              </div>
 
              <!-- Fallback link -->
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
                إذا لم يعمل الزر، انسخ هذا الرابط في المتصفح:
              </p>
              <p style="margin:4px 0 0;word-break:break-all;">
                <a href="${resetUrl}" style="color:#2563eb;font-size:12px;text-decoration:underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
 
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 40px;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">
                © ${new Date().getFullYear()} دَيني — جميع الحقوق محفوظة
                <br/>
                <a href="mailto:support@dayni.app" style="color:#2563eb;text-decoration:none;">support@dayni.app</a>
              </p>
            </td>
          </tr>
 
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      // نسخة نصية احتياطية
      text: `
مرحباً ${user.shopName}،
 
تلقينا طلباً لإعادة تعيين كلمة المرور.
الرابط صالح لمدة ساعة واحدة:
 
${resetUrl}
 
إذا لم تطلب هذا، تجاهل الرسالة.
 
— فريق دَيني
support@dayni.app
      `.trim(),
    });
 
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "حدث خطأ أثناء إرسال البريد، حاول مرة أخرى" }, { status: 500 });
  }
}
 