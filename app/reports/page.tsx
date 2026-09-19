/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement,
} from "chart.js";
import { Line, Pie, Bar } from "react-chartjs-2";
import * as XLSX from "xlsx";
import { getPermissions } from "@/lib/permissions";
import { toast } from "sonner";
import { useTranslation, formatNumber } from "@/lib/i18n/LanguageContext";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler, ArcElement, BarElement);

type PlanType = "free" | "basic" | "pro";
type StatsType = {
  totalDebt: number; totalPaid: number; totalCustomers: number;
  thisMonthDebt: number; thisMonthPaid: number; thisYearDebt: number; thisYearPaid: number;
};
type CustomerType = { _id: string; name: string; phone: string; totalDebt: number; userId: string };

function PlanLock({ plan, planLabel, children, className = "", t }: { plan: "basic" | "pro"; planLabel: string; children: React.ReactNode; className?: string; t: any }) {
  const isPro = plan === "pro";
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="pointer-events-none select-none opacity-30 blur-[2px]">{children}</div>
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 sm:gap-3 bg-white/70 backdrop-blur-[6px]">
        <div className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl text-xl sm:text-2xl ${isPro ? "bg-purple-100" : "bg-blue-100"}`}>🔒</div>
        <div className="text-center px-4">
          <p className="text-xs sm:text-base font-bold text-slate-800">{t("reports.planLockedTitle", { plan: planLabel })}</p>
          <p className="mt-0.5 text-[10px] sm:text-sm font-medium text-slate-500">{t("reports.planLockedDesc")}</p>
        </div>
        <Link href="/pricing" className={`rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-base font-bold text-white transition-all hover:-translate-y-1 ${isPro ? "bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-500/25" : "bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25"}`}>
          {t("reports.upgradeToPlan", { plan: planLabel })}
        </Link>
      </div>
    </div>
  );
}

function AdvancedReportCard({ icon, title, description, locked, planRequired, planLabel, onClick, t }: {
  icon: string; title: string; description: string; locked: boolean; planRequired: "basic" | "pro"; planLabel: string; onClick?: () => void; t: any;
}) {
  const isPro = planRequired === "pro";
  return (
    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition-all hover:shadow-xl hover:shadow-slate-200/60">
      {locked ? (
        <>
          <div className="pointer-events-none select-none opacity-25 blur-[2px]">
            <div className="mb-3 text-3xl sm:text-4xl">{icon}</div>
            <h3 className="text-base sm:text-xl font-bold text-slate-900">{title}</h3>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">{description}</p>
            <div className="mt-4 h-10 w-full rounded-xl bg-slate-200" />
          </div>
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/75 backdrop-blur-[5px]">
            <span className={`rounded-full px-3 py-1 text-[10px] sm:text-xs font-black tracking-wider ${isPro ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
              {isPro ? "PRO" : "BASIC"}
            </span>
            <p className="text-xs sm:text-sm font-bold text-slate-800">{title}</p>
            <Link href="/pricing" className={`rounded-xl px-4 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:opacity-90 ${isPro ? "bg-purple-600" : "bg-blue-600"}`}>
              {t("reports.openWith", { plan: planLabel })}
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="mb-3 text-3xl sm:text-4xl">{icon}</div>
          <h3 className="text-base sm:text-xl font-bold text-slate-900">{title}</h3>
          <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-600">{description}</p>
          <button onClick={onClick} className="mt-4 sm:mt-6 w-full rounded-xl sm:rounded-2xl bg-slate-900 py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-black">
            {t("reports.viewFullReport")}
          </button>
        </>
      )}
    </div>
  );
}

const getColorClasses = (color: string) => {
  const map: any = {
    red:     { iconBg: "bg-red-50",     valueText: "text-red-700",     softBg: "bg-red-50" },
    blue:    { iconBg: "bg-blue-50",    valueText: "text-blue-700",    softBg: "bg-blue-50" },
    amber:   { iconBg: "bg-amber-50",   valueText: "text-amber-700",   softBg: "bg-amber-50" },
    emerald: { iconBg: "bg-emerald-50", valueText: "text-emerald-700", softBg: "bg-emerald-50" },
  };
  return map[color] || map.blue;
};

export default function ReportsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, dir, locale } = useTranslation();

  const statCards = [
    { label: t("reports.statTotalDebt"), valueKey: "totalDebt", icon: "💰", color: "red", suffix: t("reports.riyal") },
    { label: t("reports.statCustomersCount"), valueKey: "totalCustomers", icon: "👥", color: "blue", suffix: "" },
    { label: t("reports.statMonthDebt"), valueKey: "thisMonthDebt", icon: "📅", color: "amber", suffix: t("reports.riyal") },
    { label: t("reports.statMonthPaid"), valueKey: "thisMonthPaid", icon: "✅", color: "emerald", suffix: t("reports.riyal") },
  ] as const;

  const [stats, setStats] = useState<StatsType>({ totalDebt: 0, totalPaid: 0, totalCustomers: 0, thisMonthDebt: 0, thisMonthPaid: 0, thisYearDebt: 0, thisYearPaid: 0 });
  const [topDebtors, setTopDebtors] = useState<CustomerType[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [exportLoading, setExportLoading] = useState(false);

  const permissions = getPermissions(userPlan);
  const canExport = permissions.export;

  const fmt = (v: number) => formatNumber(v, locale);
  const fmtMoney = (v: number) => `${fmt(v)} ${t("reports.riyal")}`;

  const planLabelOf = (p: "basic" | "pro") => p === "pro" ? t("nav.planPro") : t("nav.planBasic");

  const fetchReports = async (userId: string) => {
    try {
      const [customersRes, invoicesRes, paymentsRes] = await Promise.all([
        fetch("/api/customers", { credentials: "include" }),
        fetch("/api/invoices", { credentials: "include" }),
        fetch("/api/payments", { credentials: "include" }),
      ]);
      const customers = await customersRes.json();
      const invs = await invoicesRes.json();
      const pays = await paymentsRes.json();
      if (!Array.isArray(customers) || !Array.isArray(invs) || !Array.isArray(pays)) throw new Error("Invalid");

      const myCustomers = customers.filter((c: any) => String(c.userId) === String(userId));
      const myInvoices = invs.filter((i: any) => String(i.userId) === String(userId));
      const myPayments = pays.filter((p: any) => String(p.userId) === String(userId));

      const now = new Date();
      const inMonth = (x: any) => { const d = new Date(x.date); return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth(); };
      const inYear = (x: any) => new Date(x.date).getFullYear() === now.getFullYear();
      const sum = (arr: any[]) => arr.reduce((s: number, x: any) => s + Number(x.amount || 0), 0);

      const debtMap: Record<string, number> = {};
      myInvoices.forEach((inv: any) => { debtMap[inv.customerId] = (debtMap[inv.customerId] || 0) + Number(inv.amount || 0); });
      const sortedDebtors = myCustomers.map((c: any) => ({ ...c, totalDebt: debtMap[c._id] || 0 })).filter((c: any) => c.totalDebt > 0).sort((a: any, b: any) => b.totalDebt - a.totalDebt).slice(0, 5);

      setInvoices(myInvoices); setPayments(myPayments); setTopDebtors(sortedDebtors);
      setStats({ totalDebt: sum(myInvoices), totalPaid: sum(myPayments), totalCustomers: myCustomers.length, thisMonthDebt: sum(myInvoices.filter(inMonth)), thisMonthPaid: sum(myPayments.filter(inMonth)), thisYearDebt: sum(myInvoices.filter(inYear)), thisYearPaid: sum(myPayments.filter(inYear)) });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.push("/login"); return; }
    setUserPlan(((session.user as any)?.plan || "free") as PlanType);
    fetchReports(session.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status, router]);

  const collectionRate = stats.totalDebt > 0 ? Math.min(100, Math.round((stats.totalPaid / stats.totalDebt) * 100)) : 0;

  const getMonthlyData = (items: any[]) =>
    Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - i);
      return items.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); }).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
    }).reverse();

  const monthLabels = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US", { month: "short" });
  });

  const fontFamily = locale === "ar" ? "Noto Sans Arabic" : "Plus Jakarta Sans";

  const chartData = {
    labels: monthLabels,
    datasets: [
      { label: t("dashboard.debtType") === "دين" ? "الديون" : "Debts", data: getMonthlyData(invoices), borderColor: "#dc2626", backgroundColor: "rgba(220,38,38,0.1)", fill: true, tension: 0.4, borderWidth: 2 },
      { label: t("reports.payments"), data: getMonthlyData(payments), borderColor: "#16a34a", backgroundColor: "rgba(22,163,74,0.1)", fill: true, tension: 0.4, borderWidth: 2 },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "bottom" as const, rtl: dir === "rtl", labels: { usePointStyle: true, boxWidth: 6, boxHeight: 6, padding: 10, font: { family: fontFamily, size: 10, weight: "bold" as const } } },
      tooltip: { rtl: dir === "rtl", callbacks: { label: (ctx: any) => `${ctx.dataset.label}: ${fmtMoney(Number(ctx.raw))}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: fontFamily, size: 9 } } },
      y: { beginAtZero: true, grid: { color: "#e2e8f0" }, ticks: { font: { family: fontFamily, size: 9 }, callback: (v: any) => fmt(Number(v)) } },
    },
  };

  const agingData = {
    labels: [t("reportsAging.days0_30"), t("reportsAging.days31_60"), t("reportsAging.days61_90"), t("reportsAging.days90plus")],
    datasets: [{ data: [45000, 32000, 18000, 12500], backgroundColor: ["#22c55e", "#eab308", "#f97316", "#ef4444"], borderWidth: 2 }],
  };

  const topDebtorsBarData = {
    labels: topDebtors.slice(0, 5).map((c) => c.name.length > 6 ? c.name.substring(0, 6) + ".." : c.name),
    datasets: [{ label: t("customers.colBalance"), data: topDebtors.slice(0, 5).map((c) => Number(c.totalDebt || 0)), backgroundColor: "#dc2626", borderRadius: 6 }],
  };

  const exportToExcel = async () => {
    if (!canExport) return;
    setExportLoading(true);
    await new Promise((r) => setTimeout(r, 500));
    const shopName = (session?.user as any)?.shopName || t("common.appName");
    const wsData = [
      [t("reports.exportSheetTitle", { shop: shopName })], ["", "", "", ""],
      [t("reports.exportRowTotalDebt"), fmtMoney(stats.totalDebt)], [t("reports.exportRowTotalPaid"), fmtMoney(stats.totalPaid)],
      [t("reports.exportRowCollectionRate"), `${collectionRate}%`], [t("reports.exportRowCustomersCount"), stats.totalCustomers],
      ["", "", "", ""], [t("reports.exportTopDebtorsHeader")],
      [t("reports.exportColRank"), t("reports.exportColName"), t("reports.exportColPhone"), t("reports.exportColBalance")],
      ...topDebtors.map((c, i) => [`#${i + 1}`, c.name, c.phone, fmtMoney(Number(c.totalDebt || 0))]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("reports.title"));
    XLSX.writeFile(wb, `report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    setExportLoading(false);
    toast.info(t("reports.exportToastSuccess"));
  };

  if (loading) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-base font-bold text-slate-800">{t("reports.loadingTitle")}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 start-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ee-[2rem] sm:rounded-ee-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 end-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ss-[2rem] sm:rounded-ss-[4rem] bg-emerald-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 sm:mb-4 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">{t("reports.badge")}</span>
                  <span className={`inline-flex rounded-full px-2.5 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-black ${userPlan === "pro" ? "bg-purple-100 text-purple-700" : userPlan === "basic" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"}`}>
                    {userPlan === "pro" ? t("reports.planPro") : userPlan === "basic" ? t("reports.planBasic") : t("reports.planFree")}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">{t("reports.title")}</h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">{t("reports.subtitle")}</p>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
                {canExport ? (
                  <button onClick={exportToExcel} disabled={exportLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-slate-800 transition-all hover:-translate-y-1 hover:bg-slate-50 disabled:opacity-60">
                    {exportLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" /> : "📥"}
                    {t("reports.exportExcel")}
                  </button>
                ) : (
                  <div className="group relative">
                    <button disabled className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-slate-200 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-slate-400">
                      🔒 {t("reports.exportExcel")}
                    </button>
                  </div>
                )}
                <Link href="/customers" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700">
                  {t("reports.customersLink")} <span className="ms-1 sm:ms-2">←</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {statCards.map((card) => {
            const colors = getColorClasses(card.color);
            const value = stats[card.valueKey as keyof StatsType];
            return (
              <div key={card.valueKey} className="rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                <div className="mb-3 sm:mb-6 flex items-center justify-between">
                  <div className={`flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-3xl ${colors.iconBg}`}>{card.icon}</div>
                  <div className={`h-6 w-6 sm:h-10 sm:w-10 rounded-full ${colors.softBg}`} />
                </div>
                <p className="text-[10px] sm:text-sm font-bold text-slate-500">{card.label}</p>
                <h2 className={`mt-1 sm:mt-3 text-sm sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight ${colors.valueText}`}>
                  {card.suffix ? `${fmt(value)} ${card.suffix}` : fmt(value)}
                </h2>
              </div>
            );
          })}
        </section>

        {/* COLLECTION RATE */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-8 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-3 sm:mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-2xl font-bold text-slate-950">{t("reports.collectionRateTitle")}</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 hidden sm:block">{t("reports.collectionRateDesc")}</p>
            </div>
            <span className={`text-2xl sm:text-4xl font-black ${collectionRate >= 70 ? "text-emerald-600" : collectionRate >= 40 ? "text-amber-600" : "text-red-600"}`}>
              {collectionRate}%
            </span>
          </div>
          <div className="h-3 sm:h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all duration-700 ${collectionRate >= 70 ? "bg-emerald-500" : collectionRate >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${collectionRate}%` }} />
          </div>
          <div className="mt-2 sm:mt-3 flex justify-between text-xs sm:text-sm font-semibold text-slate-400">
            <span>{t("reports.paidLabel")}: {fmtMoney(stats.totalPaid)}</span>
            <span>{t("reports.remainingLabel")}: {fmtMoney(stats.totalDebt - stats.totalPaid)}</span>
          </div>
        </section>

        {/* BASIC CHART */}
        {permissions.charts.basic ? (
          <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="mb-3 sm:mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-base sm:text-2xl font-bold text-slate-950">{t("reports.chartTitle")}</h2>
                <p className="mt-0.5 text-xs sm:text-sm text-slate-500 hidden sm:block">{t("reports.chartDesc")}</p>
              </div>
              {userPlan !== "free" && (
                <span className={`rounded-full px-2.5 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black ${userPlan === "pro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                  {userPlan === "pro" ? "PRO" : "BASIC"}
                </span>
              )}
            </div>
            <div className="h-52 sm:h-80 md:h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          </section>
        ) : (
          <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-amber-200 bg-amber-50 p-5 sm:p-8 text-center">
            <div className="mb-3 text-3xl sm:text-5xl">📊</div>
            <h2 className="text-lg sm:text-2xl font-bold text-amber-800">{t("reports.chartLockedTitle")}</h2>
            <Link href="/pricing" className="mt-4 inline-flex rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">{t("reports.upgradePlan")}</Link>
          </section>
        )}

        {/* ADVANCED CHARTS */}
        <section className="mb-5 sm:mb-8">
          <div className="mb-3 sm:mb-4 flex items-center gap-2 sm:gap-3 flex-wrap">
            <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{t("reports.advancedChartsTitle")}</h2>
            <span className="inline-flex rounded-full bg-purple-100 px-2.5 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-purple-700">🔒 PRO</span>
          </div>
          {permissions.charts.advanced ? (
            <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
              <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-2xl font-bold">{t("reports.agingChartTitle")}</h2>
                <div className="flex h-48 sm:h-80 items-center justify-center">
                  <Pie data={agingData} />
                </div>
              </div>
              <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl">
                <h2 className="mb-3 sm:mb-4 text-base sm:text-2xl font-bold">{t("reports.topDebtorsChartTitle")}</h2>
                <div className="h-48 sm:h-80">
                  <Bar data={topDebtorsBarData} options={{ ...chartOptions, indexAxis: "y" as const }} />
                </div>
              </div>
            </div>
          ) : (
            <PlanLock plan="pro" planLabel={planLabelOf("pro")} t={t} className="rounded-2xl sm:rounded-[2rem]">
              <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
                <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-xl">
                  <h2 className="mb-3 text-xl font-bold">{t("reports.agingChartTitle")}</h2>
                  <div className="h-48 sm:h-80 animate-pulse rounded-xl bg-slate-100" />
                </div>
                <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-xl">
                  <h2 className="mb-3 text-xl font-bold">{t("reports.topDebtorsChartTitle")}</h2>
                  <div className="h-48 sm:h-80 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            </PlanLock>
          )}
        </section>

        {/* ADVANCED REPORTS */}
        <section className="mb-5 sm:mb-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{t("reports.advancedReportsTitle")}</h2>
              <p className="mt-1 text-xs sm:text-sm font-medium text-slate-500 hidden sm:block">{t("reports.advancedReportsDesc")}</p>
            </div>
            {!permissions.reports.advanced && (
              <span className="inline-flex items-center rounded-full bg-amber-100 px-3 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-bold text-amber-800">🔒 PRO</span>
            )}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:gap-6 sm:grid-cols-3">
            <AdvancedReportCard icon="📆" title={t("reports.agingReportTitle")} description={t("reports.agingReportDesc")} locked={!permissions.reports.aging} planRequired="pro" planLabel={planLabelOf("pro")} onClick={() => router.push("/reports/aging")} t={t} />
            <AdvancedReportCard icon="📈" title={t("reports.cashflowReportTitle")} description={t("reports.cashflowReportDesc")} locked={!permissions.reports.cashflow} planRequired="pro" planLabel={planLabelOf("pro")} onClick={() => router.push("/reports/cashflow")} t={t} />
            <AdvancedReportCard icon="🎯" title={t("reports.collectionReportTitle")} description={t("reports.collectionReportDesc")} locked={!permissions.reports.collection} planRequired="pro" planLabel={planLabelOf("pro")} onClick={() => router.push("/reports/collection")} t={t} />
          </div>
        </section>

        {/* MONTHLY / YEARLY SUMMARY */}
        <section className="mb-5 sm:mb-8 grid gap-3 sm:gap-5 sm:grid-cols-2">
          {[
            { title: t("reports.monthSummaryTitle"), debt: stats.thisMonthDebt, paid: stats.thisMonthPaid },
            { title: t("reports.yearSummaryTitle"), debt: stats.thisYearDebt, paid: stats.thisYearPaid },
          ].map((item) => (
            <div key={item.title} className="rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-sm">
              <h3 className="mb-3 sm:mb-5 text-base sm:text-xl font-bold text-slate-950">{item.title}</h3>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-red-50 px-3 sm:px-4 py-2.5 sm:py-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">{t("reports.debtsAdded")}</span>
                  <span className="text-xs sm:text-base font-black text-red-600">{fmtMoney(item.debt)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-emerald-50 px-3 sm:px-4 py-2.5 sm:py-3">
                  <span className="text-xs sm:text-sm font-semibold text-slate-600">{t("reports.payments")}</span>
                  <span className="text-xs sm:text-base font-black text-emerald-600">{fmtMoney(item.paid)}</span>
                </div>
                <div className="flex items-center justify-between rounded-xl sm:rounded-2xl bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3">
                  <span className="text-xs sm:text-sm font-bold text-slate-700">{t("reports.net")}</span>
                  <span className={`text-xs sm:text-base font-black ${item.debt > item.paid ? "text-red-600" : "text-emerald-600"}`}>
                    {fmtMoney(Math.abs(item.debt - item.paid))}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* TOP DEBTORS */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base sm:text-2xl font-bold text-slate-950">{t("reports.topDebtorsTitle")}</h2>
              <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 hidden sm:block">{t("reports.topDebtorsDesc")}</p>
            </div>
            <Link href="/customers" className="rounded-lg sm:rounded-xl bg-blue-50 px-3 py-1.5 text-xs sm:text-sm font-bold text-blue-700 transition hover:bg-blue-100 whitespace-nowrap">
              {t("reports.viewAll")}
            </Link>
          </div>
          {topDebtors.length > 0 ? (
            <div className="space-y-2 sm:space-y-3">
              {topDebtors.map((customer, index) => {
                const maxDebt = topDebtors[0]?.totalDebt || 1;
                const pct = Math.round((Number(customer.totalDebt) / maxDebt) * 100);
                return (
                  <div key={customer._id} className="rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <div className="flex h-8 w-8 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white text-xs sm:text-sm font-black text-slate-700 shadow-sm">#{index + 1}</div>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-base font-bold text-slate-900 truncate">{customer.name}</p>
                          <p className="mt-0.5 text-[10px] sm:text-sm font-semibold text-slate-500" dir="ltr">{customer.phone}</p>
                        </div>
                      </div>
                      <div className="text-end shrink-0">
                        <p className="text-xs sm:text-lg font-black text-red-600">{fmtMoney(Number(customer.totalDebt || 0))}</p>
                        <span className="mt-0.5 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-[9px] sm:text-xs font-bold text-red-700">{t("reports.due")}</span>
                      </div>
                    </div>
                    <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-200">
                      <div className="h-full rounded-full bg-red-400 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 sm:py-14 text-center">
              <div className="mb-3 text-3xl sm:text-5xl">🎉</div>
              <p className="text-sm sm:text-lg font-bold text-slate-700">{t("reports.noDebtorsTitle")}</p>
            </div>
          )}
        </section>

        {/* UPGRADE BANNER */}
        {!canExport && (
          <section className="mt-5 sm:mt-8 rounded-2xl sm:rounded-[2rem] border border-blue-200 bg-blue-50 p-4 sm:p-6 text-center shadow-sm">
            <p className="text-sm sm:text-lg font-bold text-blue-800">{t("reports.exportBannerTitle")}</p>
            <p className="mx-auto mt-1.5 sm:mt-2 max-w-2xl text-xs sm:text-sm font-semibold text-blue-700">
              {t("reports.exportBannerDesc")}
            </p>
            <Link href="/pricing" className="mt-4 sm:mt-5 inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-1 hover:bg-blue-700">
              {t("reports.upgradeNow")} <span className="ms-2">←</span>
            </Link>
          </section>
        )}

      </div>
    </main>
  );
}
