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

type Bucket = { label: string; days: string; amount: number; color: string; bg: string; text: string; border: string };

export default function AgingReportPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [buckets, setBuckets] = useState<Bucket[]>([
    { label: "حديث",       days: "0 – 30 يوم",     amount: 0, color: "#22c55e", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
    { label: "متأخر",      days: "31 – 60 يوم",    amount: 0, color: "#f59e0b", bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200" },
    { label: "متأخر جداً", days: "61 – 90 يوم",    amount: 0, color: "#f97316", bg: "bg-orange-50",  text: "text-orange-700",  border: "border-orange-200" },
    { label: "حرج",        days: "أكثر من 90 يوم", amount: 0, color: "#ef4444", bg: "bg-red-50",     text: "text-red-700",     border: "border-red-200" },
  ]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.push("/login"); return; }
    if ((session.user as any)?.plan !== "pro") { router.push("/pricing"); return; }
    fetchData(session.user.id);
  }, [status, session]);

  const fetchData = async (userId: string) => {
    try {
      const res = await fetch("/api/invoices", { credentials: "include" });
      const invs = await res.json();
      if (!Array.isArray(invs)) return;

      const mine = invs.filter((i: any) => String(i.userId) === String(userId));
      const now = new Date();
      const sums = [0, 0, 0, 0];

      mine.forEach((inv: any) => {
        const days = (now.getTime() - new Date(inv.date).getTime()) / 86400000;
        const amt = Number(inv.amount || 0);
        if      (days <= 30) sums[0] += amt;
        else if (days <= 60) sums[1] += amt;
        else if (days <= 90) sums[2] += amt;
        else                 sums[3] += amt;
      });

      setBuckets((prev) => prev.map((b, i) => ({ ...b, amount: sums[i] })));
      setTotal(sums.reduce((a, b) => a + b, 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fmt  = (v: number) => v.toLocaleString("ar-SA");
  const fmtM = (v: number) => `${fmt(v)} ريال`;

  const chartData = {
    labels: buckets.map((b) => b.days),
    datasets: [{
      label: "الرصيد المستحق",
      data: buckets.map((b) => b.amount),
      backgroundColor: buckets.map((b) => b.color),
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        rtl: true,
        callbacks: { label: (ctx: any) => ` ${fmtM(Number(ctx.raw))}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Noto Sans Arabic", size: 10 } } },
      y: { beginAtZero: true, grid: { color: "#f1f5f9" }, ticks: { font: { family: "Noto Sans Arabic", size: 10 }, callback: (v: any) => fmt(Number(v)) } },
    },
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
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-orange-100/40 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-orange-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-2 sm:mb-4 flex items-center gap-2 sm:gap-3 flex-wrap">
                  <span className="inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">التقارير المتقدمة</span>
                  <span className="inline-flex rounded-full bg-purple-100 px-3 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-purple-700">PRO</span>
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">تقرير عمر الديون</h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  تصنيف الديون حسب فترة التأخير لمعرفة الأكثر إلحاحاً.
                </p>
              </div>
              <Link href="/reports" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 whitespace-nowrap">
                العودة للتقارير <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        {/* SUMMARY CARDS */}
        <section className="mb-5 sm:mb-8 grid gap-3 sm:gap-5 grid-cols-2 lg:grid-cols-4">
          {buckets.map((b) => (
            <div key={b.days} className={`rounded-xl sm:rounded-[1.75rem] border ${b.border} ${b.bg} p-3 sm:p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl`}>
              <div className="mb-2 sm:mb-4 flex items-center justify-between">
                <span className={`rounded-full px-2 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs font-black ${b.bg} ${b.text} border ${b.border}`}>{b.label}</span>
                {total > 0 && (
                  <span className="text-[10px] sm:text-xs font-bold text-slate-400">
                    {Math.round((b.amount / total) * 100)}%
                  </span>
                )}
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">{b.days}</p>
              <h2 className={`mt-1 sm:mt-2 text-sm sm:text-xl lg:text-2xl font-black tracking-tight ${b.text}`}>{fmtM(b.amount)}</h2>
              <div className="mt-2 sm:mt-3 h-1 sm:h-1.5 w-full overflow-hidden rounded-full bg-white/60">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${total > 0 ? (b.amount / total) * 100 : 0}%`, backgroundColor: b.color }} />
              </div>
            </div>
          ))}
        </section>

        {/* CHART */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-4 sm:mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-2xl font-bold text-slate-950">توزيع الديون حسب العمر</h2>
              <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-slate-500 hidden sm:block">مقارنة بصرية بين فترات التأخير</p>
            </div>
            <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-1.5 sm:py-2">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500">الإجمالي</p>
              <p className="text-sm sm:text-lg font-black text-slate-900">{fmtM(total)}</p>
            </div>
          </div>
          <div className="h-48 sm:h-80">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </section>

        {/* DETAIL TABLE */}
        <section className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">تفاصيل التوزيع</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {buckets.map((b, i) => (
              <div key={b.days} className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 transition hover:bg-slate-50/80">
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl text-xs sm:text-sm font-black" style={{ background: b.color + "20", color: b.color }}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-xs sm:text-base font-bold text-slate-900">{b.label}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400">{b.days}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 sm:gap-6">
                  <div className="w-20 sm:w-32 hidden sm:block">
                    <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div className="h-full rounded-full" style={{ width: `${total > 0 ? (b.amount / total) * 100 : 0}%`, backgroundColor: b.color }} />
                    </div>
                  </div>
                  <p className="text-xs sm:text-base font-black" style={{ color: b.color }}>{fmtM(b.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}