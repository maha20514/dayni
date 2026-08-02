"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const token        = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 6) {
      setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }
    if (password !== confirm) {
      setError("كلمات المرور غير متطابقة");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1️⃣ فعّل الحساب واحصل على الإيميل
      const res  = await fetch("/api/team/accept", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ");
        return;
      }

      setSuccess(true);

      // 2️⃣ سجّل دخول بـ "team-member" provider — مو credentials العادي
      const result = await signIn("team-member", {
        redirect:  false,
        email:     data.email,    // الإيميل يجي من الـ API
        password:  password,
      });

      if (result?.ok) {
        router.replace("/dashboard");
      } else {
        // fallback — وجّه للوجين مع رسالة
        console.error("SignIn error:", result?.error);
        setError("تم تفعيل الحساب، سجّل دخولك من صفحة تسجيل الدخول");
        setSuccess(false);
      }
    } catch {
      setError("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-6xl">🎉</div>
        <h2 className="text-2xl font-black text-emerald-700">تم تفعيل حسابك!</h2>
        <p className="mt-2 text-slate-500">جاري تسجيل الدخول وتحويلك للوحة التحكم...</p>
        <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full animate-[grow_2s_linear_forwards] rounded-full bg-emerald-500" />
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 text-5xl">❌</div>
        <h2 className="text-xl font-bold text-red-600">رابط الدعوة غير صالح</h2>
        <Link href="/login" className="mt-4 inline-block text-sm font-bold text-blue-600 hover:underline">
          العودة لتسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-blue-50 text-4xl">
          👥
        </div>
        <span className="mb-3 inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
          قبول الدعوة
        </span>
        <h1 className="mt-2 text-3xl font-black text-slate-950">أنت على وشك الانضمام!</h1>
        <p className="mt-2 text-slate-500">أنشئ كلمة مرور للوصول إلى لوحة التحكم</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label className="mb-2 block text-sm font-bold text-slate-600">
            كلمة المرور الجديدة
          </label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-base font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-bold text-slate-600">
            تأكيد كلمة المرور
          </label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-5 py-4 text-base font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-600">
            ⚠️ {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-5 text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <span className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              جاري التفعيل...
            </>
          ) : "تفعيل الحساب والدخول ←"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link href="/login" className="text-sm font-bold text-slate-400 transition hover:text-slate-600">
          ← العودة لتسجيل الدخول
        </Link>
      </div>
    </>
  );
}

export default function AcceptInvitePage() {
  return (
    <main dir="rtl" className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-emerald-100/60 blur-3xl" />

      <style>{`
        @keyframes grow {
          from { width: 0% }
          to   { width: 100% }
        }
      `}</style>

      <div className="relative z-10 w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-2xl sm:p-10">
        <Suspense fallback={
          <div className="flex justify-center py-16">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          </div>
        }>
          <AcceptInviteContent />
        </Suspense>
      </div>
    </main>
  );
}