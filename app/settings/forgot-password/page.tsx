// app/settings/forgot-password/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
 
function validateEmail(email: string): string {
  if (!email.trim()) return "البريد الإلكتروني مطلوب";
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return "صيغة البريد الإلكتروني غير صحيحة";
  if (email.includes("..")) return "البريد يحتوي على نقاط متتالية";
  return "";
}
 
export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState("");
 
  const emailError = touched ? validateEmail(email) : "";
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
 
    if (validateEmail(email)) return;
 
    setLoading(true);
    setError("");
 
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSent(true);
    } catch {
      setError("خطأ في الاتصال بالخادم، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/60 blur-3xl" />
 
      <div className="relative z-10 w-full max-w-md rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-8 lg:p-10 shadow-2xl">
        <div className="mb-6 sm:mb-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">🔑</div>
          <span className="mb-2 sm:mb-3 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">
            استعادة كلمة المرور
          </span>
          <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-950">نسيت كلمة المرور؟</h1>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
            أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة
          </p>
        </div>
 
        {sent ? (
          <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6 text-center">
            <div className="mb-2 sm:mb-3 text-4xl sm:text-5xl">📨</div>
            <p className="text-base sm:text-lg font-bold text-emerald-800">تم الإرسال بنجاح!</p>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-emerald-700">
              تحقق من صندوق الوارد على <span className="font-bold">{email}</span>
              <br />
              قد يصل في بضع دقائق — تحقق أيضاً من مجلد الـ Spam
            </p>
            <p className="mt-3 text-xs text-emerald-600 font-semibold">
              الرابط صالح لمدة ساعة واحدة فقط
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(true)}
                  required
                  className={`w-full rounded-xl sm:rounded-2xl border bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400
                    focus:bg-white focus:ring-4
                    ${emailError
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : touched && email && !emailError
                        ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-100"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                  placeholder="example@shop.com"
                />
                {touched && email && !emailError && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg text-emerald-500">✓</span>
                )}
                {emailError && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-base sm:text-lg text-red-500">✕</span>
                )}
              </div>
 
              {emailError && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-bold text-red-600">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>
 
            {error && (
              <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-600">
                ⚠️ {error}
              </div>
            )}
 
            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="ml-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  جاري الإرسال...
                </>
              ) : (
                "إرسال رابط الاستعادة ←"
              )}
            </button>
          </form>
        )}
 
        <div className="mt-5 sm:mt-6 text-center">
          <Link href="/login" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700">
            ← العودة لتسجيل الدخول
          </Link>
        </div>
      </div>
    </main>
  );
}