/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/emailTemplates.ts
//
// Centralized, bilingual (ar/en) HTML email templates. Every send* function
// picks its copy based on `preferredLanguage` ("ar" | "en"), defaulting to
// "ar" to match the app's historical behavior for any caller that doesn't
// pass a language explicitly.

import nodemailer from "nodemailer";

type Lang = "ar" | "en";

function getTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

const FROM_NAME: Record<Lang, string> = { ar: "دَيني", en: "Dayni" };

function wrapper(lang: Lang, headerColor: string, icon: string, title: string, subtitle: string, bodyHtml: string) {
  const dir = lang === "ar" ? "rtl" : "ltr";
  return `
<!DOCTYPE html>
<html dir="${dir}" lang="${lang}">
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:'Segoe UI',Arial,sans-serif;direction:${dir};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0"
             style="max-width:480px;background:#fff;border-radius:24px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:${headerColor};padding:32px 40px;text-align:center;">
            <div style="font-size:36px;margin-bottom:8px;">${icon}</div>
            <h1 style="margin:0;color:#fff;font-size:24px;font-weight:900;">${title}</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">${subtitle}</p>
          </td>
        </tr>
        <tr><td style="padding:40px;">${bodyHtml}</td></tr>
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © ${new Date().getFullYear()} ${FROM_NAME[lang]} &nbsp;|&nbsp;
              <a href="mailto:support@dayni.app" style="color:#2563eb;text-decoration:none;">support@dayni.app</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ─── Email verification OTP ────────────────────────────────────────────────

export async function sendVerificationOTPEmail({
  to, code, shopName, preferredLanguage = "ar",
}: { to: string; code: string; shopName: string; preferredLanguage?: Lang }) {
  const lang = preferredLanguage;
  const copy = lang === "ar"
    ? {
        subject: `${code} — رمز التحقق من بريدك الإلكتروني`,
        title: "تأكيد البريد الإلكتروني",
        subtitle: "دَيني — نظام إدارة الديون",
        greeting: `مرحباً <strong>${shopName}</strong>،`,
        instruction: "استخدم الرمز أدناه لتأكيد بريدك الإلكتروني. صالح لمدة <strong>10 دقائق</strong> فقط.",
        codeLabel: "رمز التحقق",
        expiry: "ينتهي خلال 10 دقائق",
        security: "🔒 لا تشارك هذا الرمز مع أحد. فريق دَيني لن يطلب منك هذا الرمز أبداً.",
        text: `رمز التحقق من دَيني: ${code}\n\nصالح لمدة 10 دقائق فقط.\nلا تشاركه مع أحد.\n\n— فريق دَيني`,
      }
    : {
        subject: `${code} — Verify your email`,
        title: "Verify your email",
        subtitle: "Dayni — Debt Management System",
        greeting: `Hello <strong>${shopName}</strong>,`,
        instruction: "Use the code below to verify your email. It's valid for <strong>10 minutes</strong> only.",
        codeLabel: "Verification code",
        expiry: "Expires in 10 minutes",
        security: "🔒 Don't share this code with anyone. The Dayni team will never ask you for it.",
        text: `Your Dayni verification code: ${code}\n\nValid for 10 minutes only.\nDo not share it with anyone.\n\n— The Dayni team`,
      };

  const bodyHtml = `
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">${copy.greeting}</p>
    <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7;">${copy.instruction}</p>
    <div style="background:#f1f5f9;border:2px dashed #cbd5e1;border-radius:16px;padding:24px;text-align:center;margin-bottom:32px;">
      <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;letter-spacing:2px;">${copy.codeLabel}</p>
      <div style="font-size:48px;font-weight:900;letter-spacing:12px;color:#1e40af;font-family:monospace;">${code}</div>
      <p style="margin:8px 0 0;color:#94a3b8;font-size:12px;">${copy.expiry}</p>
    </div>
    <div style="background:#fef9c3;border-radius:12px;padding:14px 18px;">
      <p style="margin:0;color:#854d0e;font-size:13px;line-height:1.7;">${copy.security}</p>
    </div>`;

  await getTransporter().sendMail({
    from:    `"${FROM_NAME[lang]}" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
    replyTo: process.env.SUPPORT_EMAIL || "support@dayni.app",
    to,
    subject: copy.subject,
    html: wrapper(lang, "linear-gradient(135deg,#2563eb,#4f46e5)", "📩", copy.title, copy.subtitle, bodyHtml),
    text: copy.text,
  });
}

// ─── Password reset ─────────────────────────────────────────────────────────

export async function sendPasswordResetEmail({
  to, shopName, resetUrl, preferredLanguage = "ar",
}: { to: string; shopName: string; resetUrl: string; preferredLanguage?: Lang }) {
  const lang = preferredLanguage;
  const copy = lang === "ar"
    ? {
        subject: "استعادة كلمة المرور — دَيني",
        title: "دَيني",
        subtitle: "نظام إدارة الديون",
        heading: "استعادة كلمة المرور",
        greeting: `مرحباً <strong>${shopName}</strong>،`,
        instruction: "تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك. اضغط على الزر أدناه لإكمال العملية. الرابط صالح لمدة <strong>ساعة واحدة</strong> فقط.",
        cta: "إعادة تعيين كلمة المرور ←",
        security: "🔒 إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة بأمان. حسابك لن يتأثر.",
        fallback: "إذا لم يعمل الزر، انسخ هذا الرابط في المتصفح:",
        text: `مرحباً ${shopName}،\n\nتلقينا طلباً لإعادة تعيين كلمة المرور.\nالرابط صالح لمدة ساعة واحدة:\n\n${resetUrl}\n\nإذا لم تطلب هذا، تجاهل الرسالة.\n\n— فريق دَيني`,
      }
    : {
        subject: "Reset your password — Dayni",
        title: "Dayni",
        subtitle: "Debt Management System",
        heading: "Reset your password",
        greeting: `Hello <strong>${shopName}</strong>,`,
        instruction: "We received a request to reset your account's password. Click the button below to continue. The link is valid for <strong>one hour</strong> only.",
        cta: "Reset password ←",
        security: "🔒 If you didn't request a password reset, you can safely ignore this email. Your account is unaffected.",
        fallback: "If the button doesn't work, copy this link into your browser:",
        text: `Hello ${shopName},\n\nWe received a request to reset your password.\nThe link is valid for one hour:\n\n${resetUrl}\n\nIf you didn't request this, ignore this email.\n\n— The Dayni team`,
      };

  const bodyHtml = `
    <h2 style="margin:0 0 12px;color:#0f172a;font-size:22px;font-weight:800;">${copy.heading}</h2>
    <p style="margin:0 0 8px;color:#475569;font-size:15px;line-height:1.7;">${copy.greeting}</p>
    <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7;">${copy.instruction}</p>
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${resetUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#ffffff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:16px;box-shadow:0 8px 20px rgba(37,99,235,0.35);">${copy.cta}</a>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;margin-bottom:24px;">
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">${copy.security}</p>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">${copy.fallback}</p>
    <p style="margin:4px 0 0;word-break:break-all;"><a href="${resetUrl}" style="color:#2563eb;font-size:12px;text-decoration:underline;">${resetUrl}</a></p>`;

  await getTransporter().sendMail({
    from:    `"${FROM_NAME[lang]}" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
    replyTo: process.env.SUPPORT_EMAIL || "support@dayni.app",
    to,
    subject: copy.subject,
    html: wrapper(lang, "linear-gradient(135deg,#2563eb,#4f46e5)", "🔑", copy.title, copy.subtitle, bodyHtml),
    text: copy.text,
  });
}

// ─── Team invite ─────────────────────────────────────────────────────────────

export async function sendTeamInviteEmail({
  to, memberName, ownerShopName, role, inviteUrl, preferredLanguage = "ar",
}: { to: string; memberName: string; ownerShopName: string; role: string; inviteUrl: string; preferredLanguage?: Lang }) {
  const lang = preferredLanguage;
  const roleLabel = lang === "ar" ? (role === "admin" ? "مدير" : "عضو") : (role === "admin" ? "Admin" : "Member");
  const copy = lang === "ar"
    ? {
        subject: `${ownerShopName} يدعوك للانضمام إلى دَيني`,
        title: "دعوة للانضمام",
        subtitle: "دَيني — نظام إدارة الديون",
        greeting: `مرحباً <strong>${memberName}</strong>،`,
        instruction: `قام <strong>${ownerShopName}</strong> بدعوتك للانضمام إلى فريق العمل على منصة دَيني بصفتك <strong>${roleLabel}</strong>.`,
        cta: "قبول الدعوة ←",
        expiry: "⏰ هذه الدعوة صالحة لمدة <strong>48 ساعة</strong> فقط.<br/>إذا لم تكن تتوقع هذه الدعوة، يمكنك تجاهلها.",
      }
    : {
        subject: `${ownerShopName} invited you to join Dayni`,
        title: "You're invited",
        subtitle: "Dayni — Debt Management System",
        greeting: `Hello <strong>${memberName}</strong>,`,
        instruction: `<strong>${ownerShopName}</strong> has invited you to join their team on Dayni as <strong>${roleLabel}</strong>.`,
        cta: "Accept invite ←",
        expiry: "⏰ This invite is valid for <strong>48 hours</strong> only.<br/>If you weren't expecting this, you can ignore it.",
      };

  const bodyHtml = `
    <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.7;">${copy.greeting}</p>
    <p style="margin:0 0 32px;color:#475569;font-size:15px;line-height:1.7;">${copy.instruction}</p>
    <div style="text-align:center;margin:0 0 32px;">
      <a href="${inviteUrl}" style="display:inline-block;background:linear-gradient(135deg,#2563eb,#4f46e5);color:#fff;text-decoration:none;font-size:16px;font-weight:700;padding:16px 40px;border-radius:16px;box-shadow:0 8px 20px rgba(37,99,235,0.35);">${copy.cta}</a>
    </div>
    <div style="background:#f1f5f9;border-radius:12px;padding:16px 20px;">
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">${copy.expiry}</p>
    </div>`;

  await getTransporter().sendMail({
    from: `"${FROM_NAME[lang]}" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
    to,
    subject: copy.subject,
    html: wrapper(lang, "linear-gradient(135deg,#2563eb,#4f46e5)", "👥", copy.title, copy.subtitle, bodyHtml),
  }).catch(err => console.error("Invite email error:", err));
}
