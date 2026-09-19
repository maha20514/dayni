"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type Section = { title: string; body?: string; intro?: string; items?: string[]; outro?: string };

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
      <h2 className="mb-3 text-lg sm:text-xl font-black text-slate-950">{title}</h2>
      <div className="text-sm sm:text-base leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}

export default function TermsPage() {
  const { t, dir, tRaw } = useTranslation();
  const sections = tRaw("termsPage.sections") as unknown as Section[];
  const sectionsArr = Array.isArray(sections) ? sections : [];

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-10 sm:py-16 text-slate-900">
      <div className="absolute end-0 top-20 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 start-0 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 sm:p-10">
            <div className="absolute start-0 top-0 h-28 w-28 rounded-ee-[3rem] bg-blue-50 hidden sm:block" />
            <div className="absolute bottom-0 end-0 h-28 w-28 rounded-ss-[3rem] bg-indigo-50 hidden sm:block" />
            <div className="relative">
              <span className="mb-4 inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
                {t("legalCommon.badge")}
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight text-slate-950">
                {t("termsPage.title")}
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                {t("legalCommon.lastUpdated")}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="space-y-6">
          {sectionsArr.map((section) => (
            <PolicySection key={section.title} title={section.title}>
              {section.body && <p>{section.body}</p>}
              {(section.intro || section.items) && (
                <>
                  {section.intro && <p className="mb-2">{section.intro}</p>}
                  {section.items && (
                    <ul className="mt-2 space-y-2 text-slate-600">
                      {section.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="mt-1 text-blue-500">•</span>{item}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </PolicySection>
          ))}
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
