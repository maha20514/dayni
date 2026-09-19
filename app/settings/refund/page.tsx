"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Section = { title: string; body?: string; intro?: string; items?: string[] };

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
      <h2 className="mb-3 text-lg sm:text-xl font-black text-slate-950">{title}</h2>
      <div className="text-sm sm:text-base leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

export default function RefundPage() {
  const { t, dir, tRaw } = useTranslation();
  const sections = tRaw("refundPage.sections") as unknown as Section[];
  const sectionsArr = Array.isArray(sections) ? sections : [];
  const byTitle = (needle: string) => sectionsArr.find((s) => s.title.startsWith(needle));

  const s1 = byTitle("1") || byTitle("١");
  const s3 = byTitle("3") || byTitle("٣");
  const s6 = byTitle("6") || byTitle("٦");
  const s7 = byTitle("7") || byTitle("٧");

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-10 sm:py-16 text-slate-900">
      <div className="absolute end-0 top-20 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 start-0 h-72 w-72 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 sm:p-10">
            <div className="absolute start-0 top-0 h-28 w-28 rounded-ee-[3rem] bg-amber-50 hidden sm:block" />
            <div className="absolute bottom-0 end-0 h-28 w-28 rounded-ss-[3rem] bg-orange-50 hidden sm:block" />
            <div className="relative">
              <span className="mb-4 inline-flex rounded-full bg-amber-50 px-5 py-2 text-sm font-bold text-amber-700">
                {t("legalCommon.badge")}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight text-slate-950">
                {t("refundPage.title")}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                {t("legalCommon.lastUpdated")}
              </p>
            </div>
          </div>
        </section>

        {/* Commitment banner */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">🤝</span>
            <p className="text-sm sm:text-base leading-relaxed text-amber-800">
              {t("refundPage.commitment")}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">

          {s1 && (
            <PolicySection title={s1.title}>
              <p>{s1.body}</p>
            </PolicySection>
          )}

          <PolicySection title={t("refundPage.acceptedTitle")}>
            <p>{t("refundPage.acceptedIntro")}</p>
            <ul className="mt-3 space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800">{t("refundPage.case1Title")}</p>
                <p className="mt-1 text-sm text-emerald-700">{t("refundPage.case1Body")}</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-bold text-blue-800">{t("refundPage.case2Title")}</p>
                <p className="mt-1 text-sm text-blue-700">{t("refundPage.case2Body")}</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="font-bold text-purple-800">{t("refundPage.case3Title")}</p>
                <p className="mt-1 text-sm text-purple-700">{t("refundPage.case3Body")}</p>
              </div>
            </ul>
          </PolicySection>

          {s3 && (
            <PolicySection title={s3.title}>
              <ul className="mt-2 space-y-2 text-slate-600">
                {s3.items?.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 text-red-400">✗</span>{item}
                  </li>
                ))}
              </ul>
            </PolicySection>
          )}

          <PolicySection title={t("refundPage.howToTitle")}>
            <ol className="mt-2 space-y-3">
              {[
                { n: "١", title: t("refundPage.step1Title"), body: t("refundPage.step1Body") },
                { n: "٢", title: t("refundPage.step2Title"), body: t("refundPage.step2Body") },
                { n: "٣", title: t("refundPage.step3Title"), body: t("refundPage.step3Body") },
                { n: "٤", title: t("refundPage.step4Title"), body: t("refundPage.step4Body") },
              ].map((step, i) => (
                <li key={step.title} className="flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">{i + 1}</span>
                  <div>
                    <p className="font-bold text-slate-800">{step.title}</p>
                    <p className="text-sm text-slate-600">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </PolicySection>

          <PolicySection title={t("refundPage.cancelVsRefundTitle")}>
            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-800 mb-2">{t("refundPage.cancelTitle")}</p>
                <p className="text-sm text-slate-600">{t("refundPage.cancelBody")}</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800 mb-2">{t("refundPage.refundTitle")}</p>
                <p className="text-sm text-emerald-700">{t("refundPage.refundBody")}</p>
              </div>
            </div>
          </PolicySection>

          {s6 && (
            <PolicySection title={s6.title}>
              <p className="mb-2">{s6.intro}</p>
              <ul className="mt-2 space-y-2 text-slate-600">
                {s6.items?.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <span className="mt-1 text-blue-500">•</span>{item}
                  </li>
                ))}
              </ul>
            </PolicySection>
          )}

          {s7 && (
            <PolicySection title={s7.title}>
              <p>{s7.body}</p>
            </PolicySection>
          )}

        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/home" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
            {t("legalCommon.backHome")}
          </Link>
        </div>

      </div>
    </main>
  );
}
