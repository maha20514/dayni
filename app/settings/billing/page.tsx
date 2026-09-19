/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function BillingPage() {
  const { data: session } = useSession();
  const { t, dir, locale } = useTranslation();
  const [loading, setLoading] = useState(false);

  const user: any = session?.user;
  const plan = user?.plan || "free";

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/lemonsqueezy/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || t("common.error")); return; }
      if (data.url) window.location.href = data.url;
    } catch { toast.error(t("billing.badge")); } finally { setLoading(false); }
  };

  const getPlanLabel = () => plan === "pro" ? t("billing.planPro") : plan === "basic" ? t("billing.planBasic") : t("billing.planFree");

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 start-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-purple-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-3xl px-3 sm:px-6">

        {/* Header */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ee-[2rem] sm:rounded-ee-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 end-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ss-[2rem] sm:rounded-ss-[4rem] bg-purple-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">{t("billing.badge")}</span>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight text-slate-950">{t("billing.title")}</h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-lg text-slate-600">{t("billing.subtitle")}</p>
              </div>
              <Link href="/dashboard" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 hover:bg-blue-700 whitespace-nowrap">
                {t("billing.back")}
              </Link>
            </div>
          </div>
        </section>

        <div className="space-y-4 sm:space-y-5">

          {/* Current plan */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <p className="mb-3 sm:mb-4 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">{t("billing.currentPlanLabel")}</p>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl sm:text-3xl font-black text-slate-900">
                  {getPlanLabel()}
                </h2>
                {user?.subscriptionStart && (
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">
                    {t("billing.sincePrefix")} {new Date(user.subscriptionStart).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                  </p>
                )}
              </div>
              <span className={`rounded-xl sm:rounded-2xl border px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-black ${
                plan === "pro"   ? "border-purple-200 bg-purple-50 text-purple-700" :
                plan === "basic" ? "border-blue-200 bg-blue-50 text-blue-700" :
                                   "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}>
                {plan === "pro" ? "Pro" : plan === "basic" ? "Basic" : "Free"}
              </span>
            </div>
          </div>

          {/* Actions */}
          {plan !== "free" ? (
            <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
              <p className="mb-3 sm:mb-5 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-slate-400">{t("billing.actionsLabel")}</p>
              <div className="space-y-2 sm:space-y-3">

                <button onClick={openPortal} disabled={loading}
                  className="flex w-full items-center justify-between rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-5 text-start transition hover:border-blue-200 hover:bg-blue-50/40 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-lg sm:text-2xl">
                      {loading ? <span className="h-5 w-5 animate-spin rounded-full border-2 border-blue-200 border-t-blue-600" /> : "💳"}
                    </div>
                    <div>
                      <p className="text-sm sm:text-base font-bold text-slate-900">{t("billing.changeCard")}</p>
                      <p className="mt-0.5 text-[10px] sm:text-sm text-slate-500 hidden sm:block">{t("billing.changeCardDesc")}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">←</span>
                </button>

                <button onClick={openPortal} disabled={loading}
                  className="flex w-full items-center justify-between rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-5 text-start transition hover:border-amber-200 hover:bg-amber-50/40 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 text-lg sm:text-2xl">🧾</div>
                    <div>
                      <p className="text-sm sm:text-base font-bold text-slate-900">{t("billing.downloadInvoices")}</p>
                      <p className="mt-0.5 text-[10px] sm:text-sm text-slate-500 hidden sm:block">{t("billing.downloadInvoicesDesc")}</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">←</span>
                </button>

                <button onClick={openPortal} disabled={loading}
                  className="flex w-full items-center justify-between rounded-2xl sm:rounded-3xl border border-red-100 bg-red-50/50 p-3 sm:p-5 text-start transition hover:border-red-200 hover:bg-red-50 disabled:opacity-60"
                >
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-red-50 text-lg sm:text-2xl">❌</div>
                    <div>
                      <p className="text-sm sm:text-base font-bold text-red-700">{t("billing.cancelSub")}</p>
                      <p className="mt-0.5 text-[10px] sm:text-sm text-red-500 hidden sm:block">{t("billing.cancelSubDesc")}</p>
                    </div>
                  </div>
                  <span className="text-red-300 text-sm">←</span>
                </button>

              </div>
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-[2rem] border border-blue-200 bg-blue-50 p-5 sm:p-6 text-center shadow-sm">
              <div className="mb-3 text-4xl sm:text-5xl">🚀</div>
              <h3 className="text-lg sm:text-xl font-bold text-blue-900">{t("billing.freeCardTitle")}</h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-blue-700">{t("billing.freeCardDesc")}</p>
              <Link href="/pricing" className="mt-4 sm:mt-5 inline-flex rounded-xl sm:rounded-2xl bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-1 hover:bg-blue-700">
                {t("billing.upgradeNow")}
              </Link>
            </div>
          )}

        </div>
      </div>
    </main>
  );
}
