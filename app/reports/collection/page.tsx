/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Title, Tooltip, Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    totalInvoices: 0, totalPaid: 0, totalRemaining: 0, rate: 0, dso: 0,
  });
  const [monthly, setMonthly] = useState<{ label: string; inv: number; pay: number; rate: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.push("/login"); return; }
    if ((session.user as any)?.plan !== "pro") { router.push("/pricing"); return; }
    fetchData(session.user.id);
  }, [status, session]);

  const fetchData = async (userId: string) => {
    try {
      const [invRes, payRes] = await Promise.all([
        fetch("/api/invoices",  { credentials: "include" }),
        fetch("/api/payments",  { credentials: "include" }),
      ]);
      const [invs, pays] = await Promise.all([invRes.json(), payRes.json()]);
      if (!Array.isArray(invs) || !Array.isArray(pays)) return;

      const myInvs = invs.filter((i: any) => String(i.userId) === String(userId));
      const myPays = pays.filter((p: any) => String(p.userId) === String(userId));

      const totalInvoices  = myInvs.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      const totalPaid      = myPays.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const totalRemaining = totalInvoices - totalPaid;
      const rate           = totalInvoices > 0 ? Math.min(100, (totalPaid / totalInvoices) * 100) : 0;
      const dso            = totalInvoices > 0 ? Math.round((totalRemaining / totalInvoices) * 90) : 0;

      setStats({ totalInvoices, totalPaid, totalRemaining, rate, dso });

      const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const label = d.toLocaleDateString("ar-SA", { month: "short" });
        const mI = myInvs.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); }).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        const mP = myPays.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); }).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        return { label, inv: mI, pay: mP, rate: mI > 0 ? Math.round((mP / mI) * 100) : 0 };
      });
      setMonthly(monthlyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt  = (v: number) => v.toLocaleString("ar-SA");
  const fmtM = (v: number) => `${fmt(v)} ريال`;

  const chartData = {
    labels: monthly.map((m) => m.label),
    datasets: [
      { label: "الفواتير", data: monthly.map((m) => m.inv), backgroundColor: "#ef4444", borderRadius: 6, borderSkipped: false },
      { label: "المدفوعات", data: monthly.map((m) => m.pay), backgroundColor: "#22c55e", borderRadius: 6, borderSkipped: false },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: { position: "bottom" as const, rtl: true, labels: { usePointStyle: true, boxWidth: 6, boxHeight: 6, padding: 10, font: { family: "Noto Sans Arabic", size: 10, weight: "bold" as const } } },
      tooltip: { rtl: true, callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmtM(Number(ctx.raw))}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Noto Sans Arabic", size: 10 } } },
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { family: "Noto Sans Arabic", size: 10 }, callback: (v: any) => fmt(Number(v)) } },
    },
  };

  const rateColor = stats.rate >= 70 ? "text-emerald-600" : stats.rate >= 40 ? "text-amber-600" : "text-red-600";
  const rateBg    = stats.rate >= 70 ? "bg-emerald-500"   : stats.rate >= 40 ? "bg-amber-500"   : "bg-red-500";

  if (loading || status === "loading") {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-bold text-slate-800">جاري تحميل التقرير...</p>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/40 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-emerald-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 sm:mb-4 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">التقارير المتقدمة</span>
                  <span className="inline-flex rounded-full bg-purple-100 px-3 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-purple-700">PRO</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">أداء التحصيل</h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  نسبة التحصيل الشهرية ومتوسط مدة التحصيل (DSO).
                </p>
              </div>
              <Link href="/reports" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 whitespace-nowrap">
                العودة للتقارير <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 sm:mb-8 grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {[
            { label: "إجمالي الفواتير",  value: fmtM(stats.totalInvoices),  icon: "🧾", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
            { label: "إجمالي المدفوع",   value: fmtM(stats.totalPaid),      icon: "✅", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
            { label: "المتبقي",           value: fmtM(stats.totalRemaining), icon: "⏳", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
            { label: "متوسط DSO",         value: `${stats.dso} يوم`,         icon: "📊", bg: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200" },
          ].map((c) => (
            <div key={c.label} className={`rounded-xl sm:rounded-[1.75rem] border ${c.border} ${c.bg} p-3 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl`}>
              <div className="mb-2 sm:mb-4 text-xl sm:text-3xl">{c.icon}</div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-500">{c.label}</p>
              <h2 className={`mt-1 sm:mt-2 text-sm sm:text-xl lg:text-2xl font-black tracking-tight leading-tight ${c.text}`}>{c.value}</h2>
            </div>
          ))}
        </section>

        {/* COLLECTION RATE BAR */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-950">نسبة التحصيل الإجمالية</h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 hidden sm:block">نسبة المبالغ المحصّلة من إجمالي الديون</p>
            </div>
            <span className={`text-2xl sm:text-4xl font-black ${rateColor}`}>{stats.rate.toFixed(1)}%</span>
          </div>
          <div className="h-3 sm:h-4 w-full overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full transition-all duration-700 ${rateBg}`} style={{ width: `${stats.rate}%` }} />
          </div>
          <div className="mt-2 sm:mt-3 flex justify-between text-xs sm:text-sm font-semibold text-slate-400">
            <span>المدفوع: {fmtM(stats.totalPaid)}</span>
            <span>المتبقي: {fmtM(stats.totalRemaining)}</span>
          </div>
        </section>

        {/* CHART */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-2xl font-bold text-slate-950">مقارنة الفواتير والمدفوعات شهرياً</h2>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 hidden sm:block">آخر 6 أشهر</p>
          </div>
          <div className="h-48 sm:h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* MONTHLY TABLE */}
        <section className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">نسبة التحصيل الشهرية</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {monthly.map((m) => (
              <div key={m.label} className="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 transition hover:bg-slate-50/80">
                <div className="w-10 sm:w-16 text-xs sm:text-sm font-bold text-slate-700 shrink-0">{m.label}</div>
                <div className="flex-1">
                  <div className="mb-1 flex justify-between text-[10px] sm:text-xs text-slate-400">
                    <span className="hidden sm:inline">{fmtM(m.pay)} / {fmtM(m.inv)}</span>
                    <span className={`font-black ${m.rate >= 70 ? "text-emerald-600" : m.rate >= 40 ? "text-amber-600" : "text-red-600"}`}>
                      {m.rate}%
                    </span>
                  </div>
                  <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${m.rate >= 70 ? "bg-emerald-500" : m.rate >= 40 ? "bg-amber-500" : "bg-red-500"}`}
                      style={{ width: `${m.rate}%` }}
                    />
                  </div>
                </div>
                <div className={`text-xs sm:text-sm font-black shrink-0 ${m.rate >= 70 ? "text-emerald-600" : m.rate >= 40 ? "text-amber-600" : "text-red-600"}`}>
                  {m.rate}%
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}