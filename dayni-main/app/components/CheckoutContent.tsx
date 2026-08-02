"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";

type PlanKey = "basic" | "pro";

type PlanInfo = {
  name: string;
  label: string;
  price: number;
  period: string;
  description: string;
  features: string[];
};

const planInfo: Record<PlanKey, PlanInfo> = {
  basic: {
    name: "الخطة الأساسية",
    label: "الأكثر اختياراً",
    price: 19,
    period: "شهرياً",
    description: "مناسبة لأصحاب المحلات الصغيرة الذين يريدون إدارة ديونهم بسهولة.",
    features: [
      "عملاء غير محدودين",
      "تسجيل الديون والمدفوعات",
      "تقارير واضحة",
      "تصدير البيانات",
    ],
  },
  pro: {
    name: "الخطة الاحترافية",
    label: "مميزات متقدمة",
    price: 39,
    period: "شهرياً",
    description: "للمتاجر التي تحتاج أدوات أكثر تقدماً وتحليلات أفضل.",
    features: [
      "كل مميزات الخطة الأساسية",
      "إشعارات ذكية",
      "تعدد المستخدمين",
      "تحليلات متقدمة",
    ],
  },
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const selectedPlanParam = searchParams.get("plan");
  const selectedPlan: PlanKey =
    selectedPlanParam === "pro" || selectedPlanParam === "basic"
      ? selectedPlanParam
      : "basic";

  const plan = planInfo[selectedPlan];

  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const { data: session } = useSession();

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    if (!session?.user) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/lemonsqueezy/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ plan: selectedPlan, userId: session.user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data?.error || "فشل في بدء عملية الدفع");
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      dir="rtl"
      className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 sm:py-10 text-slate-900 sm:px-6"
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute right-0 top-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-0">

        {/* ── HEADER ── */}
        <section className="mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 text-center sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-24 w-24 rounded-br-[3rem] bg-blue-50 hidden sm:block" />
            <div className="absolute bottom-0 right-0 h-24 w-24 rounded-tl-[3rem] bg-emerald-50 hidden sm:block" />

            <div className="relative mx-auto max-w-3xl">
              <span className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700">
                ترقية الخطة
              </span>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight text-slate-950">
                أكمل اشتراكك في{" "}
                <span className="bg-gradient-to-l from-blue-600 to-emerald-500 bg-clip-text font-black tracking-tight text-transparent">
                  دَيني
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-lg leading-relaxed text-slate-600">
                أنت على بعد خطوة واحدة من تفعيل مميزات تساعدك على إدارة ديون متجرك بشكل أوضح وأسرع.
              </p>
            </div>
          </div>
        </section>

        {/* ── MAIN CARD ── */}
        {/* Mobile: stacked (summary card first for quick action, details below)
            lg:    side-by-side grid */}
        <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_0.85fr]">

            {/* ── Plan details (shown below summary on mobile) ── */}
            <div className="order-2 lg:order-1 relative bg-white p-5 sm:p-8 md:p-10">

              <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700">
                    الخطة المختارة
                  </span>
                  <h2 className="mt-3 sm:mt-5 text-2xl sm:text-3xl font-semibold text-slate-950">
                    {plan.name}
                  </h2>
                  <p className="mt-2 sm:mt-3 max-w-xl text-sm sm:text-base leading-relaxed text-slate-600">
                    {plan.description}
                  </p>
                </div>

                <span className={`w-fit shrink-0 rounded-full px-3 py-1.5 text-xs font-black ${
                  selectedPlan === "pro" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"
                }`}>
                  {plan.label}
                </span>
              </div>

              {/* Features grid */}
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-4">
                {plan.features.map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 sm:px-5 sm:py-4"
                  >
                    <span className="flex h-6 w-6 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs sm:text-sm font-black text-emerald-700">
                      ✓
                    </span>
                    <span className="text-sm font-bold text-slate-700">{feature}</span>
                  </div>
                ))}
              </div>

              {/* After payment info */}
              <div className="mt-6 sm:mt-8 rounded-2xl sm:rounded-[2rem] border border-blue-100 bg-blue-50 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-bold text-blue-800">ماذا يحدث بعد الدفع؟</h3>
                <div className="mt-3 sm:mt-5 grid gap-2.5 sm:gap-3">
                  {[
                    "تفعيل الخطة مباشرة على حسابك",
                    "فتح المميزات الخاصة بالخطة",
                    "إمكانية تغيير أو إلغاء الخطة في أي وقت",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3">
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black text-blue-700">
                        ✓
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-blue-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Payment summary (shown first on mobile) ── */}
            <aside className="order-1 lg:order-2 border-b border-slate-200 bg-slate-50 p-5 sm:p-8 md:p-10 lg:border-b-0 lg:border-r">
              <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/70">

                {/* Price */}
                <div className="mb-6 sm:mb-8 text-center">
                  <p className="text-xs sm:text-sm font-black text-blue-700">ملخص الدفع</p>
                  <div className="mt-3 sm:mt-4">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-950">
                      {plan.price}
                    </span>
                    <span className="mr-2 text-xl sm:text-2xl font-black text-slate-700">ريال</span>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-bold text-slate-500">{plan.period}</p>
                </div>

                {/* Summary rows */}
                <div className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 sm:pb-4">
                    <span className="text-sm font-bold text-slate-600">الخطة</span>
                    <span className="text-sm font-black text-slate-950">{plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 sm:pt-4">
                    <span className="text-sm font-bold text-slate-600">الإجمالي</span>
                    <span className="text-lg sm:text-xl font-black text-slate-950">{plan.price} ريال</span>
                  </div>
                </div>

                {/* Pay button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-4 sm:py-5 text-sm sm:text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? "جاري التوجيه إلى بوابة الدفع..." : `ادفع ${plan.price} ريال الآن`}
                </button>

                {/* Error */}
                {error && (
                  <div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-red-600">
                    {error}
                  </div>
                )}

                <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs font-semibold leading-relaxed text-slate-500">
                  الدفع آمن عبر LemonSqueezy • يمكنك الإلغاء أو تغيير الخطة في أي وقت
                </p>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mt-3 sm:mt-5 w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                  الرجوع
                </button>
              </div>
            </aside>

          </div>
        </section>
      </div>
    </main>
  );
}