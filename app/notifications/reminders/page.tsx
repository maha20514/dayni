/* eslint-disable react-hooks/immutability */
// app/notifications/reminders/page.tsx
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type ReminderLog = {
  _id:           string;
  customerId:    { name: string; phone: string } | string;
  title:         string;
  message:       string;
  reminderLevel: 0 | 1 | 2 | 3;
  isRead:        boolean;
  isResolved:    boolean;
  lastSentAt:    string;
  createdAt:     string;
};

export default function RemindersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t, dir, locale } = useTranslation();

  const levelConfig = {
    0: { label: t("reminders.level0Label"), color: "bg-blue-100 text-blue-700",      icon: "📌", days: t("reminders.level0Days") },
    1: { label: t("reminders.level1Label"), color: "bg-emerald-100 text-emerald-700", icon: "🔔", days: t("reminders.level1Days") },
    2: { label: t("reminders.level2Label"), color: "bg-amber-100 text-amber-700",    icon: "⚠️", days: t("reminders.level2Days") },
    3: { label: t("reminders.level3Label"), color: "bg-red-100 text-red-700",        icon: "🚨", days: t("reminders.level3Days") },
  };

  const [logs,      setLogs]      = useState<ReminderLog[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [running,   setRunning]   = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "logs">("overview");

  const plan     = (session?.user as any)?.plan || "free";
  const isMember = (session?.user as any)?.isMember;

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.replace("/login");   return; }
    if (plan !== "pro")     { router.replace("/pricing"); return; }
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchLogs = async () => {
    try {
      const res  = await fetch("/api/notifications?type=reminder", { credentials: "include" });
      const data = await res.json();
      setLogs(data.notifications || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const runReminders = async () => {
    if (isMember) { toast.error(t("reminders.ownerOnlyRun")); return; }
    setRunning(true);
    try {
      const res  = await fetch("/api/notifications/reminders", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(t("reminders.runSuccess", { count: data.result?.sent || 0 }));
      fetchLogs();
    } catch (err: any) {
      toast.error(err.message || t("reminders.runFailed"));
    } finally {
      setRunning(false);
    }
  };

  const stats = {
    total:    logs.length,
    resolved: logs.filter(l => l.isResolved).length,
    pending:  logs.filter(l => !l.isResolved).length,
    byLevel:  [0, 1, 2, 3].map(l => logs.filter(r => r.reminderLevel === l).length),
  };

  if (loading || status === "loading") {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm sm:text-lg font-bold text-slate-800">{t("reminders.loadingTitle")}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-4 sm:py-6 lg:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 start-0 h-72 w-72 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-5xl px-3 sm:px-6">

        {/* ── HEADER ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          <div className="relative p-4 sm:p-6 lg:p-10">
            <div className="absolute start-0 top-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-ee-[2rem] lg:rounded-ee-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 end-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-ss-[2rem] lg:rounded-ss-[4rem] bg-amber-50" />
            <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 sm:mb-3 lg:mb-4 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">
                    {t("reminders.badge")}
                  </span>
                  <span className="inline-flex rounded-full bg-purple-100 px-3 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-purple-700">
                    {t("reminders.proBadge")}
                  </span>
                </div>
                <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight text-slate-950">
                  {t("reminders.title")}
                </h1>
                <p className="mt-1 sm:mt-2 lg:mt-3 text-xs sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  {t("reminders.subtitle")}
                </p>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-5 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ← {t("reminders.back")}
                </Link>
                {!isMember && (
                  <button
                    onClick={runReminders}
                    disabled={running}
                    className="inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-blue-600 px-3 sm:px-6 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {running
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : <span className="hidden sm:inline">📱</span>}
                    <span className="hidden sm:inline">{running ? t("reminders.running") : t("reminders.runButton")}</span>
                    <span className="sm:hidden">{running ? t("reminders.sendingShort") : t("reminders.runShort")}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── STATS ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 grid grid-cols-2 gap-2 sm:gap-4 lg:grid-cols-4">
          {[
            { label: t("reminders.statTotal"),    value: stats.total,       icon: "📊", colorClass: "text-blue-700"    },
            { label: t("reminders.statResolved"), value: stats.resolved,    icon: "✅", colorClass: "text-emerald-700" },
            { label: t("reminders.statPending"),  value: stats.pending,     icon: "⏳", colorClass: "text-amber-700"   },
            { label: t("reminders.statCritical"), value: stats.byLevel[3],  icon: "🚨", colorClass: "text-red-700"     },
          ].map(s => (
            <div key={s.label} className="rounded-xl sm:rounded-2xl lg:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-4 lg:p-6 shadow-sm">
              <div className="mb-2 sm:mb-3 lg:mb-4 text-xl sm:text-2xl lg:text-3xl">{s.icon}</div>
              <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-500 leading-tight">{s.label}</p>
              <h2 className={`mt-1 sm:mt-1.5 lg:mt-2 text-xl sm:text-2xl lg:text-3xl font-black ${s.colorClass}`}>
                {s.value}
              </h2>
            </div>
          ))}
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-5 lg:p-6 shadow-lg shadow-slate-200/70">
          <h2 className="mb-3 sm:mb-4 lg:mb-6 text-sm sm:text-base lg:text-xl font-bold text-slate-950">
            {t("reminders.howItWorksTitle")}
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
            {([0, 1, 2, 3] as const).map(level => {
              const c = levelConfig[level];
              const borderBg =
                level === 0 ? "border-blue-200 bg-blue-50" :
                level === 1 ? "border-emerald-200 bg-emerald-50" :
                level === 2 ? "border-amber-200 bg-amber-50" :
                              "border-red-200 bg-red-50";
              return (
                <div key={level} className={`rounded-xl sm:rounded-2xl border p-3 sm:p-4 ${borderBg}`}>
                  <div className="mb-1.5 sm:mb-2 text-xl sm:text-2xl">{c.icon}</div>
                  <p className="text-xs sm:text-sm font-bold text-slate-900">{c.label}</p>
                  <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-slate-500">{c.days}</p>
                  <div className={`mt-2 sm:mt-3 inline-flex rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs font-black ${c.color}`}>
                    {t("reminders.levelPrefix")} {level + 1}
                  </div>
                  <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-500">
                    {t("reminders.reminderCount", { count: stats.byLevel[level] })}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── TABS ── */}
        <div className="mb-3 sm:mb-4 lg:mb-5 flex gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-1 sm:p-1.5">
          {[
            { id: "overview", label: t("reminders.tabOverview") },
            { id: "logs",     label: t("reminders.tabLogs")     },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── LOGS LIST ── */}
        <section className="overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          {logs.length === 0 ? (
            <div className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl">📱</div>
              <p className="text-sm sm:text-lg font-bold text-slate-700">{t("reminders.emptyTitle")}</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500 max-w-xs mx-auto">
                {t("reminders.emptyDesc")}
              </p>
              {!isMember && (
                <button
                  onClick={runReminders}
                  disabled={running}
                  className="mt-4 sm:mt-6 inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-blue-600 px-5 sm:px-8 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {running
                    ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : "📱"}
                  {running ? t("reminders.running") : t("reminders.runNow")}
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="divide-y divide-slate-100">
                {(activeTab === "overview" ? logs.slice(0, 10) : logs).map(log => {
                  const level  = (log.reminderLevel ?? 0) as 0 | 1 | 2 | 3;
                  const config = levelConfig[level];
                  const name   = typeof log.customerId === "object"
                    ? (log.customerId as any)?.name
                    : "—";

                  return (
                    <div
                      key={log._id}
                      className={`flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 lg:p-5 transition hover:bg-slate-50/80 ${log.isResolved ? "opacity-60" : ""}`}
                    >
                      <div className={`flex h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-base sm:text-lg lg:text-xl ${config.color}`}>
                        {config.icon}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-900">{name}</p>
                          <span className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-black ${config.color}`}>
                            {config.label}
                          </span>
                          {log.isResolved && (
                            <span className="rounded-full bg-emerald-100 px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-black text-emerald-700">
                              {t("reminders.paidBadge")}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs lg:text-sm text-slate-600 line-clamp-2">
                          {log.message}
                        </p>
                        <p className="mt-0.5 sm:mt-1 text-[9px] sm:text-[10px] lg:text-xs text-slate-400">
                          {new Date(log.lastSentAt || log.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
                        </p>
                      </div>

                      <div className="hidden sm:block shrink-0 text-center">
                        <p className="text-[10px] sm:text-xs font-semibold text-slate-400">{config.days}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeTab === "overview" && logs.length > 10 && (
                <div className="border-t border-slate-100 p-3 sm:p-4 text-center">
                  <button
                    onClick={() => setActiveTab("logs")}
                    className="text-xs sm:text-sm font-bold text-blue-600 hover:text-blue-700"
                  >
                    {t("reminders.viewAllCount", { count: logs.length })}
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        {/* ── CRON INFO ── */}
        <section className="mt-4 sm:mt-5 lg:mt-6 rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-100 bg-white p-4 sm:p-5 lg:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl shrink-0">💡</span>
            <div className="min-w-0">
              <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-800">{t("reminders.cronInfoTitle")}</p>
              <p className="mt-1 text-[10px] sm:text-xs lg:text-sm leading-relaxed text-slate-500">
                {t("reminders.cronInfoDesc")}
              </p>
              <code dir="ltr" className="mt-1.5 sm:mt-2 block overflow-x-auto rounded-lg sm:rounded-xl bg-slate-50 px-3 sm:px-4 py-2 text-[10px] sm:text-xs text-slate-700 font-mono whitespace-nowrap text-start">
                GET /api/notifications/reminders
              </code>
              <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-400">
                {t("reminders.cronInfoHint")}{" "}
                <strong dir="ltr">0 9 * * *</strong> ({t("reminders.cronSchedule")})
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
