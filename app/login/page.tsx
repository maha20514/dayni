"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const GoogleIcon = () => (
  <svg viewBox="0 0 48 48" className="h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12S17.4 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2C29.3 35.1 26.8 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.5 5C9.6 39.5 16.2 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.1-3.3 5.5-6 7.1l6.3 5.2C39.5 36.7 44 31 44 24c0-1.3-.1-2.4-.4-3.5z"/>
  </svg>
);

const OrDivider = () => (
  <div className="flex items-center gap-3 sm:gap-4">
    <div className="h-px flex-1 bg-slate-200" />
    <span className="text-xs font-bold text-slate-400 tracking-widest">أو</span>
    <div className="h-px flex-1 bg-slate-200" />
  </div>
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError("");

  // جرّب owner أولاً
  const ownerRes = await signIn("credentials", {
    redirect: false,
    email,
    password,
  });

  if (ownerRes?.ok) {
    router.push("/dashboard");
    return;
  }

  // لو فشل جرّب team-member
  const memberRes = await signIn("team-member", {
    redirect: false,
    email,
    password,
  });

  setLoading(false);

  if (memberRes?.ok) {
    router.push("/dashboard");
    return;
  }

  // كلاهما فشل
  setError("البريد الإلكتروني أو كلمة المرور غير صحيحة");
};

  const handleGoogle = async () => {
    setGLoading(true);
    await signIn("google", { callbackUrl: "/dashboard" });
  };

  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-3 py-6 sm:px-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/60 blur-3xl" />

      <section className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/80 lg:grid-cols-[0.9fr_1.1fr]">

        {/* LEFT PANEL */}
        <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-10 text-white lg:block">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
          <div className="relative flex h-full min-h-[520px] flex-col justify-between">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20 backdrop-blur">📒</div>
              <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
                مرحباً بعودتك إلى{" "}
                <span className="font-black tracking-tight">دَيني</span>
              </h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-blue-100">
                تابع العملاء، الديون، والمدفوعات من لوحة واحدة واضحة وسهلة الاستخدام.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur">
                <p className="text-sm font-semibold text-blue-100">إدارة أسهل</p>
                <p className="mt-2 text-lg font-semibold">كل ديون متجرك في مكان واحد</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
                <p className="text-sm font-semibold text-slate-500">ملخص سريع</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-red-50 p-3">
                    <p className="text-xs font-bold text-red-600">الديون</p>
                    <p className="mt-1 text-lg font-black text-red-700">4,250 ر.س</p>
                  </div>
                  <div className="rounded-xl bg-emerald-50 p-3">
                    <p className="text-xs font-bold text-emerald-600">المدفوع</p>
                    <p className="mt-1 text-lg font-black text-emerald-700">1,800 ر.س</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-5 sm:mb-8 text-center">
            <div className="mx-auto mb-3 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">🛒</div>
            <span className="mb-3 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">تسجيل الدخول</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-950">مرحباً بعودتك</h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">سجّل الدخول لإدارة متجرك ومتابعة العملاء</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={gLoading}
            className="group mb-4 sm:mb-6 flex w-full items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:opacity-60"
          >
            {gLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            ) : <GoogleIcon />}
            <span>تسجيل الدخول بواسطة Google</span>
          </button>

          <OrDivider />

          <form onSubmit={handleLogin} className="mt-4 sm:mt-6 space-y-3 sm:space-y-5">
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">البريد الإلكتروني</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="example@shop.com"
              />
            </div>

            <div>
              <div className="mb-1.5 sm:mb-2 flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-600">كلمة المرور</label>
                <Link href="/settings/forgot-password" className="text-xs font-bold text-blue-600 hover:text-blue-700 transition">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)} required
                className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit" disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                <>تسجيل الدخول <span className="mr-2">←</span></>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-8 rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              ليس لديك حساب؟{" "}
              <Link href="/register" className="font-bold text-blue-600 transition hover:text-blue-700">إنشاء حساب جديد</Link>
            </p>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-xs font-semibold text-slate-400">© 2026 دَيني - نظام إدارة الديون الذكي</p>
        </div>
      </section>
    </main>
  );
}