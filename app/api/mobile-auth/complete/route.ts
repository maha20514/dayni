import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { MobileAuthCode } from "@/models/MobileAuthCode";
import { getApiOwner } from "@/lib/apiAuth";

const APP_SCHEME = "app.dayni.mobile";

// Reached in the system browser after Google sign-in. Mints a 60-second
// one-time code and hands it to the app through its custom URL scheme.
export async function GET(req: NextRequest) {
  const auth = await getApiOwner(req);
  if (!auth || auth.isMember) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  await connectDB();
  const code = crypto.randomBytes(32).toString("hex");
  await MobileAuthCode.create({
    codeHash: crypto.createHash("sha256").update(code).digest("hex"),
    userId: auth.ownerId,
    expiresAt: new Date(Date.now() + 60_000),
  });

  const link = `${APP_SCHEME}://auth?code=${code}`;
  const html = `<!doctype html><html lang="ar" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>دَيني</title>
<meta http-equiv="refresh" content="0;url=${link}"></head>
<body style="font-family:sans-serif;text-align:center;padding:48px 16px">
<p>تم تسجيل الدخول. إذا لم يرجع التطبيق تلقائياً:</p>
<p><a href="${link}" style="display:inline-block;padding:12px 24px;background:#0f172a;color:#fff;border-radius:12px;text-decoration:none">العودة إلى دَيني</a></p>
<script>location.href=${JSON.stringify(link)}</script></body></html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
