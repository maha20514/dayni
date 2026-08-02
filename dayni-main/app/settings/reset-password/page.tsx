"use client";
import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("كلمات المرور غير متطابقة"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch { setError("خطأ في الاتصال"); } finally { setLoading(false); }
  };

  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-3 py-6 sm:px-6 sm:py-10">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/60 blur-3xl" />

      <div className="relative z-10 w-full max-w-md rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-8 lg:p-10 shadow-2xl">
        <div className="mb-5 sm:mb-8 text-center">
          <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">🔒</div>
          <span className="mb-2 sm:mb-3 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">كلمة مرور جديدة</span>
          <h1 className="mt-2 text-xl sm:text-3xl font-bold text-slate-950">إعادة تعيين كلمة المرور</h1>
        </div>

        {success ? (
          <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-6 text-center">
            <div className="mb-2 sm:mb-3 text-3xl sm:text-4xl">✅</div>
            <p className="text-sm sm:text-base font-bold text-emerald-800">تم تغيير كلمة المرور!</p>
            <p className="mt-1 text-xs sm:text-sm text-emerald-700">جاري تحويلك لصفحة الدخول...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-5">
            {[
              { label: "كلمة المرور الجديدة", value: password, setter: setPassword },
              { label: "تأكيد كلمة المرور", value: confirm, setter: setConfirm },
            ].map((f) => (
              <div key={f.label}>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{f.label}</label>
                <input
                  type="password" value={f.value} onChange={(e) => f.setter(e.target.value)} required minLength={6}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  placeholder="••••••••"
                />
              </div>
            ))}
            {error && (
              <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-600">{error}</div>
            )}
            <button type="submit" disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:opacity-70">
              {loading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة ←"}
            </button>
          </form>
        )}

        <div className="mt-4 sm:mt-6 text-center">
          <Link href="/login" className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700">← العودة لتسجيل الدخول</Link>
        </div>
      </div>
    </main>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}