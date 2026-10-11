/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/emailTemplates.ts
//
// Centralized, bilingual (ar/en) HTML email templates. Every send* function
// picks its copy based on `preferredLanguage` ("ar" | "en"), defaulting to
// "ar" to match the app's historical behavior for any caller that doesn't
// pass a language explicitly.

import nodemailer from "nodemailer";

type Lang = "ar" | "en";

function gmailTransporter() {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
}

type MailOpts = { from: string; to: string; subject: string; html: string; text?: string; replyTo?: string };

// Sends through Resend (fast, authenticated with SPF/DKIM on dayni.app) when
// RESEND_API_KEY is set; falls back to Gmail SMTP if it is unset or fails.
async function sendViaResend(o: MailOpts) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || o.from,
      to: [o.to],
      subject: o.subject,
      html: o.html,
      text: o.text,
      reply_to: o.replyTo,
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text().catch(() => "")}`);
}

export function getTransporter() {
  return {
    async sendMail(o: MailOpts) {
      if (process.env.RESEND_API_KEY) {
        try { return await sendViaResend(o); }
        catch (err) { console.error("Resend failed, falling back to Gmail:", err); }
      }
      return gmailTransporter().sendMail(o);
    },
  };
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

// ─── Welcome (after the account is verified / Google sign-up) ───────────────

const SITE = () => process.env.NEXT_PUBLIC_SITE_URL || "https://dayni.app";

function button(href: string, label: string) {
  return `<p style="text-align:center;margin:28px 0;"><a href="${href}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;font-weight:800;font-size:15px;padding:14px 32px;border-radius:14px;">${label}</a></p>`;
}

export async function sendWelcomeEmail({
  to, shopName, preferredLanguage = "ar",
}: { to: string; shopName: string; preferredLanguage?: Lang }) {
  const lang = preferredLanguage;
  const copy = lang === "ar"
    ? {
        subject: "أهلاً بك في دَيني 🎉 ابدأ في 3 خطوات",
        title: "أهلاً بك في دَيني",
        subtitle: "تم تأكيد حسابك بنجاح",
        intro: `مرحباً <strong>${shopName}</strong>، يسعدنا انضمامك! دَيني يساعدك تسجّل ديون عملائك وتتابع التحصيل بسهولة، من الجوال ومن الموقع.`,
        stepsTitle: "ابدأ في 3 خطوات",
        steps: [
          "أضف أول عميل (الاسم ورقم الجوال)",
          "سجّل دين عليه كفاتورة، وشارك رابط الفاتورة أو ملف PDF",
          "سجّل الدفعات وتابع المتبقي على كل عميل لحظياً",
        ],
        more: "وتقدر تستخدم أيضاً: إدارة الموردين، تقارير التحصيل، وإضافة فريق عمل بصلاحيات مختلفة.",
        plan: "حسابك الحالي مجاني ويتيح حتى 10 عملاء و5 موردين. للترقية إلى عملاء وموردين غير محدودين وتذكيرات واتساب تلقائية، ادخل على dayni.app وغيّر الباقة من هناك.",
        cta: "افتح دَيني",
        help: "عندك سؤال؟ ردّ على هذا الإيميل أو راسلنا على support@dayni.app",
        text: `أهلاً بك في دَيني!\n\nابدأ في 3 خطوات:\n1) أضف أول عميل\n2) سجّل دين عليه كفاتورة\n3) سجّل الدفعات وتابع المتبقي\n\n${SITE()}/dashboard\n\n— فريق دَيني`,
      }
    : {
        subject: "Welcome to Dayni 🎉 Get started in 3 steps",
        title: "Welcome to Dayni",
        subtitle: "Your account is verified",
        intro: `Hi <strong>${shopName}</strong>, great to have you! Dayni helps you record customer debts and follow up on collections, from your phone or the web.`,
        stepsTitle: "Get started in 3 steps",
        steps: [
          "Add your first customer (name and phone number)",
          "Record a debt for them as an invoice and share the invoice link or PDF",
          "Record payments and see each customer's remaining balance instantly",
        ],
        more: "You can also manage suppliers, view collection reports, and add team members with different permissions.",
        plan: "Your free plan includes up to 10 customers and 5 suppliers. To get unlimited customers and suppliers and automatic WhatsApp reminders, sign in at dayni.app and change your plan there.",
        cta: "Open Dayni",
        help: "Questions? Reply to this email or write to support@dayni.app",
        text: `Welcome to Dayni!\n\nGet started in 3 steps:\n1) Add your first customer\n2) Record a debt as an invoice\n3) Record payments and track the balance\n\n${SITE()}/dashboard\n\n— The Dayni team`,
      };

  const stepsHtml = copy.steps.map((t, i) =>
    `<tr><td style="vertical-align:top;padding:6px 0;width:34px;"><div style="width:26px;height:26px;border-radius:50%;background:#dbeafe;color:#1e40af;font-weight:900;font-size:13px;text-align:center;line-height:26px;">${i + 1}</div></td><td style="padding:6px 0;color:#334155;font-size:14px;line-height:1.7;">${t}</td></tr>`
  ).join("");

  const bodyHtml = `
    <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">${copy.intro}</p>
    <p style="margin:0 0 8px;color:#0f172a;font-size:15px;font-weight:800;">${copy.stepsTitle}</p>
    <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">${stepsHtml}</table>
    <p style="margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.7;">${copy.more}</p>
    ${button(`${SITE()}/dashboard`, copy.cta)}
    <div style="background:#f1f5f9;border-radius:12px;padding:14px 18px;margin-bottom:16px;">
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.7;">${copy.plan}</p>
    </div>
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">${copy.help}</p>`;

  await getTransporter().sendMail({
    from:    `"${FROM_NAME[lang]}" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
    replyTo: process.env.SUPPORT_EMAIL || "support@dayni.app",
    to,
    subject: copy.subject,
    html: wrapper(lang, "linear-gradient(135deg,#2563eb,#4f46e5)", "🎉", copy.title, copy.subtitle, bodyHtml),
    text: copy.text,
  });
}

// ─── Reminder to verify the email (attempt 1 = after ~1 day, 2 = last one) ───

export async function sendVerifyReminderEmail({
  to, shopName, attempt, preferredLanguage = "ar",
}: { to: string; shopName: string; attempt: 1 | 2; preferredLanguage?: Lang }) {
  const lang = preferredLanguage;
  const last = attempt === 2;
  const copy = lang === "ar"
    ? {
        subject: last ? "تذكير أخير: فعّل حسابك في دَيني" : "باقي خطوة واحدة لتفعيل حسابك في دَيني",
        title: last ? "تذكير أخير" : "فعّل حسابك",
        subtitle: "بريدك الإلكتروني لم يُؤكَّد بعد",
        body: `مرحباً <strong>${shopName}</strong>، سجّلت في دَيني لكن بريدك الإلكتروني ما زال غير مؤكد، ولا تقدر تستخدم حسابك قبل التأكيد.<br/><br/>سجّل دخولك الآن وسنرسل لك رمز تحقق جديد خلال لحظات.${last ? "<br/><br/>هذا آخر تذكير نرسله لك." : ""}`,
        cta: "تسجيل الدخول وتأكيد الحساب",
        ignore: "إذا لم تسجّل في دَيني، تجاهل هذا الإيميل.",
        text: `سجّلت في دَيني لكن بريدك لم يُؤكَّد بعد. سجّل دخولك لنرسل لك رمز تحقق جديد: ${SITE()}/login`,
      }
    : {
        subject: last ? "Last reminder: activate your Dayni account" : "One step left to activate your Dayni account",
        title: last ? "Last reminder" : "Activate your account",
        subtitle: "Your email hasn't been verified yet",
        body: `Hi <strong>${shopName}</strong>, you signed up for Dayni but your email is still unverified, so you can't use your account yet.<br/><br/>Sign in now and we'll send you a new verification code in a moment.${last ? "<br/><br/>This is the last reminder we'll send." : ""}`,
        cta: "Sign in and verify",
        ignore: "If you didn't sign up for Dayni, you can ignore this email.",
        text: `You signed up for Dayni but your email isn't verified yet. Sign in and we'll send you a new code: ${SITE()}/login`,
      };

  const bodyHtml = `
    <p style="margin:0;color:#475569;font-size:15px;line-height:1.8;">${copy.body}</p>
    ${button(`${SITE()}/login`, copy.cta)}
    <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.7;">${copy.ignore}</p>`;

  await getTransporter().sendMail({
    from:    `"${FROM_NAME[lang]}" <${process.env.SUPPORT_EMAIL || "support@dayni.app"}>`,
    replyTo: process.env.SUPPORT_EMAIL || "support@dayni.app",
    to,
    subject: copy.subject,
    html: wrapper(lang, "linear-gradient(135deg,#f59e0b,#ea580c)", "⏰", copy.title, copy.subtitle, bodyHtml),
    text: copy.text,
  });
}
