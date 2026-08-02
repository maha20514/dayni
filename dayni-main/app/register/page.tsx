"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

// ─── Validation ───────────────────────────────────────────────────────────────

function validateEmail(email: string): string {
  if (!email.trim()) return "البريد الإلكتروني مطلوب";
  const emailRegex = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email.trim())) return "صيغة البريد الإلكتروني غير صحيحة";
  if (email.includes("..")) return "البريد يحتوي على نقاط متتالية";
  return "";
}

function validatePassword(password: string): {
  error: string;
  strength: "weak" | "medium" | "strong" | "";
  hints: string[];
} {
  if (!password) return { error: "كلمة المرور مطلوبة", strength: "", hints: [] };

  const hints: string[] = [];
  if (password.length < 8)             hints.push("8 أحرف على الأقل");
  if (!/[A-Z]/.test(password))         hints.push("حرف كبير واحد على الأقل");
  if (!/[a-z]/.test(password))         hints.push("حرف صغير واحد على الأقل");
  if (!/[0-9]/.test(password))         hints.push("رقم واحد على الأقل");
  if (!/[^A-Za-z0-9]/.test(password)) hints.push("رمز خاص مثل @، #، $");

  if (password.length < 6)
    return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل", strength: "weak", hints };

  let score = 0;
  if (password.length >= 8)            score++;
  if (password.length >= 12)           score++;
  if (/[A-Z]/.test(password))          score++;
  if (/[a-z]/.test(password))          score++;
  if (/[0-9]/.test(password))          score++;
  if (/[^A-Za-z0-9]/.test(password))  score++;

  const strength = score <= 2 ? "weak" : score <= 4 ? "medium" : "strong";
  return { error: "", strength, hints };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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

function PasswordStrengthBar({ strength }: { strength: "weak" | "medium" | "strong" | "" }) {
  if (!strength) return null;
  const c = {
    weak:   { w: "w-1/3",  bg: "bg-red-500",    label: "ضعيفة",  lc: "text-red-600"     },
    medium: { w: "w-2/3",  bg: "bg-amber-500",  label: "متوسطة", lc: "text-amber-600"   },
    strong: { w: "w-full", bg: "bg-emerald-500", label: "قوية",   lc: "text-emerald-600" },
  }[strength];
  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className={`h-full rounded-full transition-all duration-500 ${c.w} ${c.bg}`} />
      </div>
      <p className={`text-xs font-bold ${c.lc}`}>قوة كلمة المرور: {c.label}</p>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [gLoading, setGLoading] = useState(false);
  const [error,    setError]    = useState("");

  // تظهر الأخطاء فقط بعد ما يلمس الحقل
  const [touched, setTouched] = useState({
    shopName: false,
    email:    false,
    password: false,
  });

  const shopError     = touched.shopName && !shopName.trim() ? "اسم المتجر مطلوب" : "";
  const emailError    = touched.email    ? validateEmail(email)  : "";
  const pwResult      = validatePassword(password);
  const passwordError = touched.password ? pwResult.error        : "";

  const isFormValid =
    shopName.trim().length > 0    &&
    validateEmail(email) === ""   &&
    validatePassword(password).error === "";

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();

    // force-touch كل الحقول عشان تظهر الأخطاء
    setTouched({ shopName: true, email: true, password: true });
    if (!isFormValid) return;

    setError("");
    setLoading(true);

    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ shopName, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "حدث خطأ أثناء التسجيل");
        return;
      }

       // روح لصفحة التحقق من الإيميل قبل الداشبورد
      const params = new URLSearchParams({
        userId:   data.userId,
        
      });
      router.push(`/settings/verify-email?${params.toString()}`);

    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
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
          <div className="relative flex h-full min-h-[580px] flex-col justify-between">
            <div>
              <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20 backdrop-blur">📒</div>
              <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
                ابدأ متجرك مع{" "}
                <span className="font-black tracking-tight">دَيني</span>
              </h1>
              <p className="mt-4 max-w-md text-base lg:text-lg leading-relaxed text-blue-100">
                أنشئ حسابك خلال دقائق وابدأ بتنظيم العملاء، الديون، والمدفوعات من لوحة واحدة بسيطة.
              </p>
            </div>
            <div className="space-y-4">
              <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur">
                <p className="text-sm font-semibold text-blue-100">مناسب للمحلات</p>
                <p className="mt-2 text-lg font-semibold">واجهة عربية سهلة وسريعة</p>
              </div>
              <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
                <p className="text-sm font-semibold text-slate-500">تبدأ مجاناً</p>
                <div className="mt-3 space-y-2.5">
                  {["إدارة حتى 10 عملاء", "تسجيل الديون والمدفوعات", "متابعة الرصيد بسهولة"].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-xs font-black text-emerald-700">✓</span>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-5 sm:p-8 lg:p-10">
          <div className="mb-5 sm:mb-8 text-center">
            <div className="mx-auto mb-3 sm:mb-5 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">🛍️</div>
            <span className="mb-3 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">إنشاء حساب</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-950">إنشاء متجر جديد</h2>
            <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-slate-600">ابدأ إدارة ديون متجرك بطريقة واضحة واحترافية</p>
          </div>

          {/* Google */}
          <button
            type="button"
            onClick={handleGoogle}
            disabled={gLoading}
            className="group mb-4 sm:mb-6 flex w-full items-center justify-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:opacity-60"
          >
            {gLoading
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
              : <GoogleIcon />}
            <span>التسجيل بواسطة Google</span>
          </button>

          <OrDivider />

          <form onSubmit={handleRegister} className="mt-4 sm:mt-6 space-y-3 sm:space-y-4" noValidate>

            {/* اسم المتجر */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">
                اسم المتجر
              </label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, shopName: true }))}
                required
                placeholder="مثال: بقالة الحي"
                className={`w-full rounded-xl sm:rounded-2xl border bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4
                  ${shopError
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : touched.shopName && shopName.trim()
                      ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
              />
              {shopError && (
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-600">
                  <span>⚠</span> {shopError}
                </p>
              )}
            </div>

            {/* البريد الإلكتروني */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => setTouched(t => ({ ...t, email: true }))}
                  required
                  placeholder="example@shop.com"
                  className={`w-full rounded-xl sm:rounded-2xl border bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4
                    ${emailError
                      ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : touched.email && email && !emailError
                        ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-100"
                        : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                    }`}
                />
                {touched.email && email && !emailError && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm">✓</span>
                )}
                {emailError && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-500 text-sm">✕</span>
                )}
              </div>
              {emailError && (
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-600">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>

            {/* كلمة المرور */}
            <div>
              <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">
                كلمة المرور
              </label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                onBlur={() => setTouched(t => ({ ...t, password: true }))}
                required
                placeholder="••••••••"
                className={`w-full rounded-xl sm:rounded-2xl border bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:bg-white focus:ring-4
                  ${passwordError
                    ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                    : touched.password && password && !passwordError
                      ? "border-emerald-400 focus:border-emerald-400 focus:ring-emerald-100"
                      : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
                  }`}
              />

              {/* strength bar */}
              {password && <PasswordStrengthBar strength={pwResult.strength} />}

              {passwordError && (
                <p className="mt-1 flex items-center gap-1 text-xs font-bold text-red-600">
                  <span>⚠</span> {passwordError}
                </p>
              )}

              {/* hints — تظهر فقط بعد blur وبدون error */}
              {touched.password && password && pwResult.hints.length > 0 && !passwordError && (
                <div className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="mb-1 text-xs font-bold text-amber-700">لتقوية كلمة المرور:</p>
                  <ul className="space-y-0.5">
                    {pwResult.hints.map(h => (
                      <li key={h} className="text-xs text-amber-600">• {h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Server error */}
            {error && (
              <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-600">
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {loading ? (
                <>
                  <span className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  جاري إنشاء الحساب...
                </>
              ) : (
                <>إنشاء حساب جديد <span className="mr-2">←</span></>
              )}
            </button>
          </form>

          <div className="mt-5 sm:mt-8 rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5 text-center">
            <p className="text-xs sm:text-sm text-slate-600">
              لديك حساب بالفعل؟{" "}
              <Link href="/login" className="font-bold text-blue-600 transition hover:text-blue-700">
                تسجيل الدخول
              </Link>
            </p>
          </div>

          <p className="mt-4 sm:mt-6 text-center text-xs font-semibold text-slate-400">
            © 2026 دَيني - نظام إدارة الديون الذكي
          </p>
        </div>
      </section>
    </main>
  );
}