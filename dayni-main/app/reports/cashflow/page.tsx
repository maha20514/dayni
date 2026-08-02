/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function CashflowPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [forecast, setForecast] = useState({ next30: 0, next60: 0, next90: 0 });
  const [monthly, setMonthly] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionRate, setCollectionRate] = useState(0);

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
      const now = new Date();

      const last30Inv = myInvs.filter((i: any) => (now.getTime() - new Date(i.date).getTime()) / 86400000 <= 30);
      const last30Pay = myPays.filter((p: any) => (now.getTime() - new Date(p.date).getTime()) / 86400000 <= 30);

      const invTotal = last30Inv.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      const payTotal = last30Pay.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const net = invTotal - payTotal;
      const rate = invTotal > 0 ? Math.min(100, Math.round((payTotal / invTotal) * 100)) : 0;

      setForecast({ next30: net, next60: net * 1.8, next90: net * 2.5 });
      setCollectionRate(rate);

      const monthlyData = Array.from({ length: 6 }).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const mInv = myInvs.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); });
        const mPay = myPays.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); });
        const mI = mInv.reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        const mP = mPay.reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        return mI - mP;
      });
      setMonthly(monthlyData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt  = (v: number) => Math.abs(v).toLocaleString("ar-SA");
  const fmtM = (v: number) => `${fmt(v)} ريال`;

  const monthLabels = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - (5 - i));
    return d.toLocaleDateString("ar-SA", { month: "short" });
  });

  const chartData = {
    labels: monthLabels,
    datasets: [{
      label: "صافي التدفق النقدي",
      data: monthly,
      borderColor: "#2563eb",
      backgroundColor: "rgba(37,99,235,0.08)",
      fill: true,
      tension: 0.45,
      pointRadius: 4,
      pointBackgroundColor: "#2563eb",
      borderWidth: 2,
    }],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { rtl: true, callbacks: { label: (ctx: any) => ` ${fmtM(Number(ctx.raw))}` } },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Noto Sans Arabic", size: 10 } } },
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { family: "Noto Sans Arabic", size: 10 }, callback: (v: any) => fmt(Number(v)) } },
    },
  };

  const forecastCards = [
    { label: "خلال 30 يوم", value: forecast.next30, icon: "📅", color: "blue" },
    { label: "خلال 60 يوم", value: forecast.next60, icon: "📆", color: "indigo" },
    { label: "خلال 90 يوم", value: forecast.next90, icon: "🗓️", color: "violet" },
  ];

  const colorMap: any = {
    blue:   { bg: "bg-blue-50",   text: "text-blue-700",   border: "border-blue-200" },
    indigo: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" },
    violet: { bg: "bg-violet-50", text: "text-violet-700", border: "border-violet-200" },
  };

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
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-indigo-100/40 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-indigo-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 sm:mb-4 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">التقارير المتقدمة</span>
                  <span className="inline-flex rounded-full bg-purple-100 px-3 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-purple-700">PRO</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">التدفق النقدي المتوقع</h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  توقع المبالغ المتوقع تحصيلها خلال الفترات القادمة.
                </p>
              </div>
              <Link href="/reports" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 whitespace-nowrap">
                العودة للتقارير <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        {/* COLLECTION RATE */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-3 sm:mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-950">معدل التحصيل الشهري</h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 hidden sm:block">بناءً على آخر 30 يوم</p>
            </div>
            <span className={`text-2xl sm:text-3xl font-black ${collectionRate >= 70 ? "text-emerald-600" : collectionRate >= 40 ? "text-amber-600" : "text-red-600"}`}>
              {collectionRate}%
            </span>
          </div>
          <div className="h-2 sm:h-3 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className={`h-full rounded-full transition-all duration-700 ${collectionRate >= 70 ? "bg-emerald-500" : collectionRate >= 40 ? "bg-amber-500" : "bg-red-500"}`}
              style={{ width: `${collectionRate}%` }}
            />
          </div>
        </section>

        {/* FORECAST CARDS */}
        <section className="mb-5 sm:mb-8 grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-3">
          {forecastCards.map((c) => {
            const cl = colorMap[c.color];
            return (
              <div key={c.label} className={`rounded-xl sm:rounded-[1.75rem] border ${cl.border} ${cl.bg} p-4 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl`}>
                <div className="mb-3 sm:mb-4 text-2xl sm:text-3xl">{c.icon}</div>
                <p className="text-xs sm:text-sm font-bold text-slate-500">{c.label}</p>
                <h2 className={`mt-1 sm:mt-2 text-lg sm:text-2xl font-black tracking-tight ${cl.text}`}>
                  {c.value >= 0 ? "" : "−"}{fmtM(c.value)}
                </h2>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-400">
                  {c.value >= 0 ? "📈 صافي إيجابي" : "📉 صافي سلبي"}
                </p>
              </div>
            );
          })}
        </section>

        {/* CHART */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-2xl font-bold text-slate-950">صافي التدفق النقدي الشهري</h2>
            <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 hidden sm:block">الفرق بين الديون والمدفوعات لكل شهر</p>
          </div>
          <div className="h-48 sm:h-80">
            <Line data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* NOTE */}
        <section className="rounded-2xl sm:rounded-[2rem] border border-amber-200 bg-amber-50 p-4 sm:p-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl shrink-0">💡</span>
            <div>
              <p className="text-sm sm:text-base font-bold text-amber-800">ملاحظة حول التوقعات</p>
              <p className="mt-1 text-xs sm:text-sm leading-relaxed text-amber-700">
                التوقعات مبنية على متوسط أداء آخر 30 يوم. قد تختلف النتائج الفعلية بناءً على سلوك العملاء وظروف السوق.
              </p>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}