// app/support/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function SupportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir } = useTranslation();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent,    setSent]    = useState(false);

  const plan     = (session?.user as any)?.plan     || "free";
  const shopName = (session?.user as any)?.shopName || t("common.appName");
  const email    = session?.user?.email             || "";
  const isPro    = plan === "pro";

  const commonTopics = [
    t("support.topic1"), t("support.topic2"), t("support.topic3"),
    t("support.topic4"), t("support.topic5"), t("support.topic6"),
  ];

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) router.replace("/login");
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error(t("support.fillAllFields"));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/support", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ subject, message, shopName, email, plan }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
      setSubject("");
      setMessage("");
    } catch {
      toast.error(t("support.sendFailed"));
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
      </main>
    );
  }

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      {/* Background blobs */}
      <div className="absolute end-0 top-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 start-0 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-purple-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-5xl px-4 sm:px-6">

        {/* ── HEADER ── */}
        <section className="mb-6 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-5 sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-24 w-24 rounded-ee-[3rem] bg-blue-50 hidden sm:block" />
            <div className="absolute bottom-0 end-0 h-24 w-24 rounded-ss-[3rem] bg-purple-50 hidden sm:block" />

            <div className="relative flex flex-col gap-4 sm:gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="mb-3 sm:mb-4 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700">
                    {t("support.badge")}
                  </span>
                  {isPro && (
                    <span className="inline-flex rounded-full bg-purple-100 px-3 py-1.5 text-xs font-black text-purple-700">
                      {t("support.priorityBadge")}
                    </span>
                  )}
                </div>

                <h1 className="text-2xl sm:text-4xl md:text-5xl font-semibold leading-tight text-slate-950">
                  {t("support.title")}
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-lg leading-relaxed text-slate-600">
                  {isPro ? t("support.subtitlePro") : t("support.subtitleFree")}
                </p>
              </div>

              <Link
                href="/dashboard"
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition hover:bg-slate-50"
              >
                ← {t("support.back")}
              </Link>
            </div>
          </div>
        </section>

        {/* ── BODY GRID ── */}
        <div className="flex flex-col-reverse gap-6 sm:gap-8 lg:grid lg:grid-cols-[1fr_1.2fr] lg:flex-none">

          {/* LEFT — قنوات الدعم */}
          <div className="space-y-4 sm:space-y-5">

            {/* Pro Priority card */}
            {isPro && (
              <div className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-purple-200 bg-gradient-to-br from-purple-600 to-indigo-700 p-5 sm:p-6 text-white shadow-xl">
                <div className="mb-3 sm:mb-4 text-3xl sm:text-4xl">⚡</div>
                <h2 className="text-lg sm:text-xl font-black">{t("support.proCardTitle")}</h2>
                <p className="mt-2 text-xs sm:text-sm leading-relaxed text-purple-100">
                  {t("support.proCardDescPrefix")}{" "}
                  <strong>{t("support.proCardDescHours")}</strong>
                </p>
                <div className="mt-4 space-y-2">
                  {[t("support.proFeature1"), t("support.proFeature2"), t("support.proFeature3")].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-xs sm:text-sm">
                      <span className="text-purple-300">✓</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* WhatsApp */}
            <a
              href={`https://wa.me/966XXXXXXXXX?text=${encodeURIComponent(t("support.whatsappGreeting", { shop: shopName, app: t("common.appName") }))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-[2rem] border border-emerald-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-2xl sm:text-3xl">
                💬
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm sm:text-base">{t("support.whatsappTitle")}</p>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500">
                  {isPro ? t("support.whatsappPro") : t("support.whatsappFree")}
                </p>
              </div>
              {isPro && (
                <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-black text-emerald-700">
                  {t("support.priorityTag")}
                </span>
              )}
            </a>

            {/* Email */}
            <a
              href={`mailto:support@dayni.app?subject=${encodeURIComponent(`[${plan.toUpperCase()}] ${shopName}`)}`}
              className="flex items-center gap-3 sm:gap-4 rounded-2xl sm:rounded-[2rem] border border-blue-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-300 hover:shadow-xl"
            >
              <div className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-2xl sm:text-3xl">
                📧
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-slate-900 text-sm sm:text-base">{t("support.emailTitle")}</p>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 truncate" dir="ltr">support@dayni.app</p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${
                isPro ? "bg-purple-100 text-purple-700" : "bg-slate-100 text-slate-600"
              }`}>
                {isPro ? t("support.priorityTag") : t("support.responseBasic")}
              </span>
            </a>

            {/* Response times */}
            <div className="rounded-2xl sm:rounded-[2rem] border border-slate-100 bg-slate-50 p-4 sm:p-5">
              <h3 className="mb-3 text-sm sm:text-base font-bold text-slate-800">{t("support.responseTimesTitle")}</h3>
              <div className="space-y-2">
                {[
                  { plan: "Pro ✦", time: t("support.responsePro"), color: "text-purple-700 bg-purple-50" },
                  { plan: "Basic", time: t("support.responseBasic"),  color: "text-blue-700 bg-blue-50"    },
                  { plan: t("nav.planFree"), time: t("support.responseFree"),  color: "text-slate-700 bg-slate-100" },
                ].map((r) => (
                  <div key={r.plan} className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2.5 sm:px-3 py-1 text-xs font-black ${r.color}`}>{r.plan}</span>
                    <span className="text-xs sm:text-sm font-semibold text-slate-600">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT — فورم */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/70 md:p-8">

            {sent ? (
              <div className="flex h-full min-h-[280px] flex-col items-center justify-center py-8 sm:py-10 text-center">
                <div className="mb-3 sm:mb-4 text-5xl sm:text-6xl">✅</div>
                <h2 className="text-xl sm:text-2xl font-black text-emerald-700">{t("support.successTitle")}</h2>
                <p className="mt-2 text-sm sm:text-base text-slate-500">
                  {isPro ? t("support.successDescPro") : t("support.successDescFree")}
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="mt-5 sm:mt-6 rounded-2xl bg-blue-600 px-6 sm:px-8 py-2.5 sm:py-3 text-sm sm:text-base font-bold text-white transition hover:bg-blue-700"
                >
                  {t("support.sendAnother")}
                </button>
              </div>
            ) : (
              <>
                <div className="mb-5 sm:mb-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-950">{t("support.formTitle")}</h2>
                  <p className="mt-1 text-xs sm:text-sm text-slate-500">
                    {t("support.formSubtitlePrefix")}{" "}
                    <span className="font-bold text-slate-700 break-all" dir="ltr">{email}</span>
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">

                  {/* Plan badge */}
                  <div className={`flex items-center gap-3 rounded-xl sm:rounded-2xl border p-3 ${
                    isPro ? "border-purple-200 bg-purple-50" : "border-slate-200 bg-slate-50"
                  }`}>
                    <span className="text-lg sm:text-xl">{isPro ? "⚡" : "📋"}</span>
                    <div>
                      <p className="text-[10px] sm:text-xs font-bold text-slate-500">{t("support.currentPlanLabel")}</p>
                      <p className={`text-xs sm:text-sm font-black ${isPro ? "text-purple-700" : "text-slate-700"}`}>
                        {isPro ? t("nav.planPro") : plan === "basic" ? t("nav.planBasic") : t("nav.planFree")}
                      </p>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">
                      {t("support.subjectLabel")}
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      required
                      placeholder={t("support.subjectPlaceholder")}
                      className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">
                      {t("support.messageLabel")}
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      required
                      rows={4}
                      placeholder={t("support.messagePlaceholder")}
                      className="w-full resize-none rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                    />
                  </div>

                  {/* Quick topics */}
                  <div>
                    <p className="mb-2 text-[10px] sm:text-xs font-bold text-slate-400">{t("support.commonTopics")}</p>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {commonTopics.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSubject(topic)}
                          className={`rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-[11px] sm:text-xs font-bold transition ${
                            subject === topic
                              ? "bg-blue-600 text-white"
                              : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className={`inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl px-5 py-3.5 sm:py-5 text-sm sm:text-lg font-bold text-white shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-70 ${
                      isPro
                        ? "bg-purple-600 shadow-purple-500/25 hover:bg-purple-700"
                        : "bg-blue-600 shadow-blue-500/25 hover:bg-blue-700"
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        {t("support.submitting")}
                      </>
                    ) : (
                      <>{isPro ? "⚡" : "📧"} {t("support.submit")}</>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

        </div>
      </div>
    </main>
  );
}
