"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type PlanKey = "basic" | "pro";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { t, dir } = useTranslation();

  const selectedPlanParam = searchParams.get("plan");
  const selectedPlan: PlanKey =
    selectedPlanParam === "pro" || selectedPlanParam === "basic"
      ? selectedPlanParam
      : "basic";

  const planInfo: Record<PlanKey, { name: string; label: string; price: number; description: string; features: string[] }> = {
    basic: {
      name: t("checkoutPage.basic.name"),
      label: t("checkoutPage.basic.label"),
      price: 19,
      description: t("checkoutPage.basic.desc"),
      features: [t("checkoutPage.basic.f1"), t("checkoutPage.basic.f2"), t("checkoutPage.basic.f3"), t("checkoutPage.basic.f4")],
    },
    pro: {
      name: t("checkoutPage.pro.name"),
      label: t("checkoutPage.pro.label"),
      price: 39,
      description: t("checkoutPage.pro.desc"),
      features: [t("checkoutPage.pro.f1"), t("checkoutPage.pro.f2"), t("checkoutPage.pro.f3"), t("checkoutPage.pro.f4")],
    },
  };

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
        setError(data?.error || t("checkoutPage.checkoutFailed"));
        return;
      }

      if (data.url) window.location.href = data.url;
    } catch {
      setError(t("checkoutPage.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      dir={dir}
      className="relative min-h-screen overflow-hidden bg-slate-50 px-4 py-6 sm:py-10 text-slate-900 sm:px-6"
    >
      {/* Background blobs */}
      <div className="pointer-events-none absolute end-0 top-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 start-0 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-0">

        {/* ── HEADER ── */}
        <section className="mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 text-center sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-24 w-24 rounded-ee-[3rem] bg-blue-50 hidden sm:block" />
            <div className="absolute bottom-0 end-0 h-24 w-24 rounded-ss-[3rem] bg-emerald-50 hidden sm:block" />

            <div className="relative mx-auto max-w-3xl">
              <span className="mb-4 inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700">
                {t("checkoutPage.badge")}
              </span>

              <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight text-slate-950">
                {t("checkoutPage.titlePrefix")}{" "}
                <span className="bg-gradient-to-l from-blue-600 to-emerald-500 bg-clip-text font-black tracking-tight text-transparent">
                  {t("common.appName")}
                </span>
              </h1>

              <p className="mt-3 sm:mt-4 text-sm sm:text-lg leading-relaxed text-slate-600">
                {t("checkoutPage.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* ── MAIN CARD ── */}
        <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/70">
          <div className="flex flex-col lg:grid lg:grid-cols-[1fr_0.85fr]">

            {/* ── Plan details ── */}
            <div className="order-2 lg:order-1 relative bg-white p-5 sm:p-8 md:p-10">

              <div className="mb-6 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700">
                    {t("checkoutPage.selectedPlanBadge")}
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
                <h3 className="text-base sm:text-lg font-bold text-blue-800">{t("checkoutPage.afterPaymentTitle")}</h3>
                <div className="mt-3 sm:mt-5 grid gap-2.5 sm:gap-3">
                  {[t("checkoutPage.afterPayment1"), t("checkoutPage.afterPayment2"), t("checkoutPage.afterPayment3")].map((item) => (
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

            {/* ── Payment summary ── */}
            <aside className="order-1 lg:order-2 border-b border-slate-200 bg-slate-50 p-5 sm:p-8 md:p-10 lg:border-b-0 lg:border-s">
              <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/70">

                {/* Price */}
                <div className="mb-6 sm:mb-8 text-center">
                  <p className="text-xs sm:text-sm font-black text-blue-700">{t("checkoutPage.summaryLabel")}</p>
                  <div className="mt-3 sm:mt-4">
                    <span className="text-5xl sm:text-6xl font-black tracking-tight text-slate-950">
                      {plan.price}
                    </span>
                    <span className="ms-2 text-xl sm:text-2xl font-black text-slate-700">{t("common.riyal")}</span>
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-bold text-slate-500">{t("checkoutPage.perMonth")}</p>
                </div>

                {/* Summary rows */}
                <div className="mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3 sm:pb-4">
                    <span className="text-sm font-bold text-slate-600">{t("checkoutPage.planLabel")}</span>
                    <span className="text-sm font-black text-slate-950">{plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between pt-3 sm:pt-4">
                    <span className="text-sm font-bold text-slate-600">{t("checkoutPage.totalLabel")}</span>
                    <span className="text-lg sm:text-xl font-black text-slate-950">{plan.price} {t("common.riyal")}</span>
                  </div>
                </div>

                {/* Pay button */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-4 sm:py-5 text-sm sm:text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
                >
                  {loading ? t("checkoutPage.redirecting") : `${t("checkoutPage.payButtonPrefix")} ${plan.price} ${t("common.riyal")} ${t("checkoutPage.payButtonSuffix")}`}
                </button>

                {/* Error */}
                {error && (
                  <div className="mt-4 sm:mt-5 rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-center text-xs sm:text-sm font-bold text-red-600">
                    {error}
                  </div>
                )}

                <p className="mt-4 sm:mt-6 text-center text-[10px] sm:text-xs font-semibold leading-relaxed text-slate-500">
                  {t("checkoutPage.secureNote")}
                </p>

                {/* Back button */}
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="mt-3 sm:mt-5 w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition-all hover:bg-slate-50"
                >
                  {t("checkoutPage.back")}
                </button>
              </div>
            </aside>

          </div>
        </section>
      </div>
    </main>
  );
}
