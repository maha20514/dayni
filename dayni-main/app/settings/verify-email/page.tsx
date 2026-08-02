/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Suspense } from "react";

// ─── OTP Input ────────────────────────────────────────────────────────────────

function OTPInput({
  value,
  onChange,
  hasError,
  disabled,
}: {
  value: string[];
  onChange: (val: string[]) => void;
  hasError: boolean;
  disabled?: boolean;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // focus first empty on mount
  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, char: string) => {
    const digit = char.replace(/\D/g, "").slice(-1);
    const next  = [...value];
    next[index] = digit;
    onChange(next);
    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace") {
      if (value[index]) {
        const next = [...value];
        next[index] = "";
        onChange(next);
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
      }
    }
    if (e.key === "ArrowLeft"  && index < 5) inputsRef.current[index + 1]?.focus();
    if (e.key === "ArrowRight" && index > 0) inputsRef.current[index - 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((d, i) => { if (i < 6) next[i] = d; });
    onChange(next);
    const lastFilled = Math.min(pasted.length, 5);
    setTimeout(() => inputsRef.current[lastFilled]?.focus(), 0);
  };

  return (
    <div className="flex justify-center gap-3" dir="ltr" onPaste={handlePaste}>
      {value.map((digit, i) => (
        <input
          key={i}
          ref={el => { inputsRef.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className={`
            h-14 w-11 rounded-2xl border-2 text-center text-2xl font-black
            outline-none transition-all duration-200 disabled:opacity-50
            ${hasError
              ? "border-red-400 bg-red-50 text-red-700"
              : digit
                ? "border-blue-500 bg-blue-50 text-blue-700 scale-105"
                : "border-slate-300 bg-slate-50 text-slate-900 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            }
          `}
        />
      ))}
    </div>
  );
}

// ─── Countdown ────────────────────────────────────────────────────────────────

function Countdown({ seconds, onEnd }: { seconds: number; onEnd: () => void }) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => { setRemaining(seconds); }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) { onEnd(); return; }
    const t = setTimeout(() => setRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onEnd]);

  const mins = String(Math.floor(remaining / 60)).padStart(2, "0");
  const secs = String(remaining % 60).padStart(2, "0");
  const pct  = (remaining / seconds) * 100;

  return (
    <div className="text-center">
      <div className="relative mx-auto mb-2 h-1.5 w-40 overflow-hidden rounded-full bg-slate-200">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${
            remaining > 300 ? "bg-emerald-500" :
            remaining > 120 ? "bg-amber-500"   : "bg-red-500"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={`text-sm font-bold tabular-nums ${
        remaining > 300 ? "text-slate-500" :
        remaining > 120 ? "text-amber-600"  : "text-red-600"
      }`}>
        ينتهي الكود بعد {mins}:{secs}
      </p>
    </div>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function VerifyEmailContent() {
  const router       = useRouter();
  const searchParams = useSearchParams();

  const userId   = searchParams.get("userId")   || "";
  const email    = searchParams.get("email")    || "";
  const rawPass  = searchParams.get("_p")       || "";
  const shopName = searchParams.get("shopName") || "";

  const [otp,       setOtp]       = useState(["", "", "", "", "", ""]);
  const [loading,   setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [error,     setError]     = useState("");
  const [success,   setSuccess]   = useState(false);
  const [timerKey,  setTimerKey]  = useState(0);
  const [expired,   setExpired]   = useState(false);

  const code     = otp.join("");
  const isFilled = code.length === 6;

  // ── Verify ──────────────────────────────────────────────────────────────
  const handleVerify = async (codeToVerify: string) => {
    if (codeToVerify.length !== 6 || loading) return;

    setLoading(true);
    setError("");

    try {
      // 1️⃣ تحقق من الكود
      const res  = await fetch("/api/auth/verify-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId, code: codeToVerify }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "كود غير صحيح");
        setOtp(["", "", "", "", "", ""]);
        setLoading(false);
        return;
      }

      // 2️⃣ نجح التحقق — أظهر رسالة النجاح
      setSuccess(true);

      // 3️⃣ سجّل دخول مباشرةً — isVerified الآن true في DB
      if (email && rawPass) {
        const signInResult = await signIn("credentials", {
          redirect:  false,
          email:     email,
          password:  rawPass,
        });

        if (signInResult?.ok) {
          // ✅ نجح — روح للداشبورد
          router.replace("/dashboard");
        } else {
          // signIn فشل لسبب ما — وجّه للـ login يدوياً
          router.replace("/login?verified=1");
        }
      } else {
        // ما عندنا بيانات الدخول — وجّه للـ login
        router.replace("/login?verified=1");
      }

    } catch {
      setError("حدث خطأ في الاتصال، حاول مرة أخرى");
      setLoading(false);
    }
  };

  // auto-submit عند اكتمال الأرقام
  useEffect(() => {
    if (isFilled && !loading && !success) {
      handleVerify(code);
    }
  }, [code]);

  // ── Resend ───────────────────────────────────────────────────────────────
  const handleResend = async () => {
    if (!userId || resending) return;
    setResending(true);
    setError("");
    setExpired(false);
    setOtp(["", "", "", "", "", ""]);

    try {
      await fetch("/api/auth/send-otp", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId }),
      });
      setTimerKey(k => k + 1);
    } catch {
      setError("فشل إعادة الإرسال، حاول مرة أخرى");
    } finally {
      setResending(false);
    }
  };

  // ─── Success ──────────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="py-6 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100 text-5xl">
          ✅
        </div>
        <h2 className="text-2xl font-black text-emerald-700">تم التحقق بنجاح!</h2>
        <p className="mt-2 text-slate-500">جاري تسجيل الدخول وتحويلك للوحة التحكم...</p>
        <div className="mx-auto mt-5 h-1.5 w-48 overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-0 animate-[grow_2s_linear_forwards] rounded-full bg-emerald-500" />
        </div>
      </div>
    );
  }

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <>
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-50 text-5xl">
          📩
          <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-black text-white ring-2 ring-white">
            6
          </span>
        </div>
        <span className="mb-3 inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
          تأكيد البريد الإلكتروني
        </span>
        <h1 className="mt-2 text-3xl font-black text-slate-950">أدخل رمز التحقق</h1>
        <p className="mt-3 leading-relaxed text-slate-500">
          أرسلنا رمزاً مكوناً من 6 أرقام إلى
          <br />
          <span className="font-bold text-slate-700">{email || "بريدك الإلكتروني"}</span>
        </p>
      </div>

      {/* OTP */}
      <div className="mb-6">
        <OTPInput
          value={otp}
          onChange={v => { setOtp(v); setError(""); }}
          hasError={!!error}
          disabled={loading}
        />
      </div>

      {/* Loading indicator under boxes */}
      {loading && (
        <div className="mb-4 flex items-center justify-center gap-2 text-sm font-bold text-blue-600">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" />
          جاري التحقق...
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-center text-sm font-bold text-red-600">
          ⚠️ {error}
        </div>
      )}

      {/* Verify button — fallback لو ما اشتغل auto */}
      <button
        onClick={() => handleVerify(code)}
        disabled={!isFilled || loading}
        className="mb-5 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 px-6 py-4 text-base font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <>
            <span className="ml-2 h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            جاري التحقق...
          </>
        ) : "تأكيد الرمز ✓"}
      </button>

      {/* Timer */}
      {!expired && (
        <div className="mb-5">
          <Countdown key={timerKey} seconds={600} onEnd={() => setExpired(true)} />
        </div>
      )}

      {/* Resend */}
      <div className="text-center">
        {expired ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="mb-3 text-sm font-bold text-amber-700">انتهت صلاحية الكود</p>
            <button
              onClick={handleResend}
              disabled={resending}
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-amber-600 disabled:opacity-60"
            >
              {resending
                ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                : "🔄"}
              إرسال كود جديد
            </button>
          </div>
        ) : (
          <button
            onClick={handleResend}
            disabled={resending}
            className="text-sm font-bold text-blue-600 transition hover:text-blue-700 disabled:opacity-50"
          >
            {resending ? "جاري الإرسال..." : "لم يصلك الرمز؟ أعد الإرسال"}
          </button>
        )}
      </div>

      {/* Tips */}
      <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50 p-4">
        <p className="mb-2 text-xs font-bold text-slate-500">لم يصلك الإيميل؟</p>
        <ul className="space-y-1 text-xs text-slate-400">
          <li>• تحقق من مجلد <strong>Spam / Junk</strong></li>
          <li>• الكود صالح لمدة <strong>10 دقائق</strong> فقط</li>
          <li>• تأكد أن الإيميل مكتوب صحيحاً</li>
        </ul>
      </div>

      <div className="mt-6 text-center">
        <Link href="/register" className="text-sm font-bold text-slate-400 transition hover:text-slate-600">
          ← العودة للتسجيل
        </Link>
      </div>
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function VerifyEmailPage() {
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
          <VerifyEmailContent />
        </Suspense>
      </div>
    </main>
  );
}