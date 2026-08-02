/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend, Filler,
} from "chart.js";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

type Stats = {
  totalCustomers: number;
  totalDebt: number;
  thisMonthDebt: number;
  totalPayments: number;
};

type Transaction = {
  name: string;
  amount: number;
  type: "دين" | "دفع";
  date: string;
};

const statCards = [
  { key: "totalDebt", title: "إجمالي الديون", icon: "💰", color: "red" },
  { key: "thisMonthDebt", title: "ديون هذا الشهر", icon: "📅", color: "amber" },
  { key: "totalCustomers", title: "عدد العملاء", icon: "👥", color: "blue" },
  { key: "totalPayments", title: "المدفوعات", icon: "✅", color: "emerald" },
] as const;

const colorMap = {
  red:     { bg: "bg-red-50",     text: "text-red-700",     icon: "bg-red-100",     ring: "group-hover:ring-red-100" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-700",   icon: "bg-amber-100",   ring: "group-hover:ring-amber-100" },
  blue:    { bg: "bg-blue-50",    text: "text-blue-700",    icon: "bg-blue-100",    ring: "group-hover:ring-blue-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-700", icon: "bg-emerald-100", ring: "group-hover:ring-emerald-100" },
};

export default function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [stats, setStats] = useState<Stats>({ totalCustomers: 0, totalDebt: 0, thisMonthDebt: 0, totalPayments: 0 });
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [monthlyInvoices, setMonthlyInvoices] = useState<number[]>(Array(6).fill(0));
  const [monthlyPayments, setMonthlyPayments] = useState<number[]>(Array(6).fill(0));
  const [monthLabels, setMonthLabels] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [collectionRate, setCollectionRate] = useState(0);

  
const [supplierStats, setSupplierStats] = useState({ total: 0, totalDebt: 0 });
 
// 2️⃣ في fetchDashboardData أضف جلب الموردين:


  const fetchDashboardData = async (userId: string) => {
    try {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (meRes.status === 401 || meRes.status === 404) {
        await signOut({ redirect: false });
        router.push("/login");
        return;
      }
      const [customersRes, invoicesRes, paymentsRes] = await Promise.all([
        fetch("/api/customers", { credentials: "include", cache: "no-store" }),
        fetch("/api/invoices", { credentials: "include", cache: "no-store" }),
        fetch("/api/payments", { credentials: "include", cache: "no-store" }),
      ]);
      if (!customersRes.ok) { if (customersRes.status === 401) { router.push("/login"); return; } throw new Error(""); }
      const [customers, invoices, payments] = await Promise.all([
        customersRes.json(), invoicesRes.json(), paymentsRes.json(),
      ]);
      if (!Array.isArray(customers) || !Array.isArray(invoices) || !Array.isArray(payments)) return;

      const mine = customers.filter((c: any) => String(c.userId) === String(userId));
      const myInvs = invoices.filter((i: any) => String(i.userId) === String(userId));
      const myPays = payments.filter((p: any) => String(p.userId) === String(userId));
      const now = new Date();
      const totalDebt = mine.reduce((s: number, c: any) => s + Number(c.totalDebt || 0), 0);
      const totalPaid = myPays.reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
      const thisMonthInvs = myInvs.filter((i: any) => {
        const d = new Date(i.date);
        return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
      });
      const thisMonthDebt = thisMonthInvs.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      const invTotal = myInvs.reduce((s: number, i: any) => s + Number(i.amount || 0), 0);
      setCollectionRate(invTotal > 0 ? Math.min(100, Math.round((totalPaid / invTotal) * 100)) : 0);

      const labels: string[] = [];
      const invMonthly: number[] = [];
      const payMonthly: number[] = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        labels.push(d.toLocaleDateString("ar-SA", { month: "short" }));
        const mI = myInvs.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); }).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        const mP = myPays.filter((x: any) => { const xd = new Date(x.date); return xd.getMonth() === d.getMonth() && xd.getFullYear() === d.getFullYear(); }).reduce((s: number, x: any) => s + Number(x.amount || 0), 0);
        invMonthly.push(mI);
        payMonthly.push(mP);
      }
      setMonthLabels(labels);
      setMonthlyInvoices(invMonthly);
      setMonthlyPayments(payMonthly);

      const recent: Transaction[] = mine
        .sort((a: any, b: any) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
        .slice(0, 5)
        .map((c: any) => ({
          name: c.name || "عميل",
          amount: Number(c.totalDebt || 0),
          type: Number(c.totalDebt || 0) > 0 ? "دين" : "دفع",
          date: c.updatedAt || c.createdAt || new Date().toISOString(),
        }));

      setStats({ totalCustomers: mine.length, totalDebt, thisMonthDebt, totalPayments: totalPaid });
      setRecentTransactions(recent);


      const suppliersRes = await fetch("/api/suppliers", { credentials: "include", cache: "no-store" });
if (suppliersRes.ok) {
  const suppliers = await suppliersRes.json();
  if (Array.isArray(suppliers)) {
    const totalDebt = suppliers.reduce((s: number, sup: any) => s + Number(sup.totalDebt || 0), 0);
    setSupplierStats({ total: suppliers.length, totalDebt });
  }
}
 
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (session?.user?.id) fetchDashboardData(session.user.id);
  }, [status, session]);

  

  const fmt = (v: number) => v.toLocaleString("ar-SA");
  const fmtM = (v: number) => `${fmt(v)} ريال`;

  const getStatValue = (key: keyof Stats) =>
    key === "totalCustomers" ? fmt(stats[key]) : fmtM(stats[key]);

  const chartData = {
    labels: monthLabels,
    datasets: [
      {
        label: "الديون الجديدة",
        data: monthlyInvoices,
        borderColor: "#dc2626",
        backgroundColor: "rgba(220,38,38,0.07)",
        fill: true, tension: 0.45, borderWidth: 2,
        pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: "#dc2626",
      },
      {
        label: "المدفوعات",
        data: monthlyPayments,
        borderColor: "#16a34a",
        backgroundColor: "rgba(22,163,74,0.07)",
        fill: true, tension: 0.45, borderWidth: 2,
        pointRadius: 3, pointHoverRadius: 5, pointBackgroundColor: "#16a34a",
      },
    ],
  };

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        position: "bottom" as const, rtl: true,
        labels: { usePointStyle: true, boxWidth: 6, boxHeight: 6, padding: 12, font: { family: "Noto Sans Arabic", size: 11, weight: "bold" as const } },
      },
      tooltip: {
        rtl: true, backgroundColor: "#0f172a", padding: 10, cornerRadius: 10,
        callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: ${fmtM(Number(ctx.raw))}` },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { family: "Noto Sans Arabic", size: 10 } } },
      y: {
        beginAtZero: true, grid: { color: "#f1f5f9" },
        ticks: { font: { family: "Noto Sans Arabic", size: 10 }, callback: (v: any) => fmt(Number(v)) },
      },
    },
  };

  if (status === "loading" || loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-base font-bold text-slate-800">جاري تحميل لوحة التحكم...</p>
          <p className="mt-1 text-xs text-slate-500">يتم تجهيز بيانات متجرك</p>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-emerald-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">
                  لوحة التحكم
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                  مرحباً بعودتك 👋
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  إليك نظرة واضحة على العملاء، الديون، والمدفوعات.
                </p>
              </div>
              <Link
                href="/customers/new"
                className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700"
              >
                إضافة عميل <span className="mr-1 sm:mr-2 text-base sm:text-xl">+</span>
              </Link>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 sm:mb-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {statCards.map((card) => {
            const c = colorMap[card.color];
            return (
              <div key={card.key} className={`group rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:ring-4 ${c.ring}`}>
                <div className="mb-3 sm:mb-6 flex items-center justify-between">
                  <div className={`flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl text-xl sm:text-3xl ${c.icon}`}>
                    {card.icon}
                  </div>
                  <div className={`h-7 w-7 sm:h-10 sm:w-10 rounded-full ${c.bg} opacity-70`} />
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-500">{card.title}</p>
                <h2 className={`mt-1 sm:mt-3 text-base sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight ${c.text}`}>
                  {getStatValue(card.key)}
                </h2>
              </div>
            );
          })}
        </section>

        {/* COLLECTION RATE */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base sm:text-xl font-bold text-slate-950">نسبة التحصيل</h2>
              <p className="mt-0.5 text-xs sm:text-sm text-slate-500 hidden sm:block">نسبة المبالغ المحصّلة</p>
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
          <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
            <span>المدفوع: {fmtM(stats.totalPayments)}</span>
            <span>المتبقي: {fmtM(stats.totalDebt - stats.totalPayments)}</span>
          </div>
        </section>

        {/* CONTENT */}
        <section className="grid gap-5 sm:gap-8 lg:grid-cols-7">

          {/* RECENT TRANSACTIONS */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70 lg:col-span-3">
            <div className="mb-4 sm:mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-950">آخر العمليات</h2>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 hidden sm:block">أحدث تحديثات العملاء</p>
              </div>
              <Link href="/customers" className="rounded-lg sm:rounded-xl bg-blue-50 px-3 py-1.5 text-xs sm:text-sm font-bold text-blue-700 transition hover:bg-blue-100 whitespace-nowrap">
                عرض الكل
              </Link>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t) => (
                  <div key={`${t.name}-${t.date}`} className="flex items-center justify-between gap-3 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 p-3 sm:p-4 transition hover:border-blue-100 hover:bg-blue-50/40">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      <div className={`flex h-9 w-9 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-2xl ${t.type === "دين" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {t.type === "دين" ? "📄" : "💵"}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-base font-bold text-slate-900 truncate">{t.name}</p>
                        <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-slate-500">
                          {new Date(t.date).toLocaleDateString("ar-SA")}
                        </p>
                      </div>
                    </div>
                    <div className="text-left shrink-0">
                      <p className={`text-sm sm:text-lg font-black ${t.type === "دين" ? "text-red-600" : "text-emerald-600"}`}>
                        {t.amount.toLocaleString("ar-SA")}
                        <span className="text-[10px] sm:text-xs font-bold"> ريال</span>
                      </p>
                      <span className={`mt-0.5 inline-flex rounded-full px-1.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-xs font-bold ${t.type === "دين" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {t.type}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl sm:rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 sm:py-12 text-center">
                  <div className="mb-3 text-3xl sm:text-5xl">📭</div>
                  <p className="text-sm font-bold text-slate-700">لا توجد عمليات حديثة</p>
                </div>
              )}
            </div>
          </div>

          {/* CHART */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg sm:shadow-xl shadow-slate-200/70 lg:col-span-4">
            <div className="mb-4 sm:mb-6 flex flex-col gap-2 sm:gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg sm:text-2xl font-bold text-slate-950">تطور الديون والمدفوعات</h2>
                <p className="mt-0.5 text-xs sm:text-sm font-medium text-slate-500 hidden sm:block">آخر 6 أشهر</p>
              </div>
              <span className="inline-flex w-fit rounded-full bg-slate-100 px-3 py-1.5 text-xs sm:text-sm font-bold text-slate-600">
                6 أشهر
              </span>
            </div>
            <div className="h-52 sm:h-80 md:h-96">
              <Line data={chartData} options={chartOptions} />
            </div>
          </div>

        </section>

        {/* QUICK ACTIONS */}
        <section className="mt-5 sm:mt-8 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {[
            { href: "/customers", icon: "👥", label: "إدارة العملاء", desc: "عرض وإدارة العملاء", color: "blue" },
            { href: "/reports", icon: "📊", label: "التقارير", desc: "تقارير وإحصائيات", color: "violet" },
            { href: "/pricing", icon: "✨", label: "ترقية الباقة", desc: "احصل على ميزات أكثر", color: "emerald" },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className="group flex items-center gap-3 sm:gap-4 rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-100 hover:shadow-xl"
            >
              <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-xl sm:text-2xl ${
                a.color === "blue" ? "bg-blue-50" : a.color === "violet" ? "bg-violet-50" : "bg-emerald-50"
              }`}>
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm sm:text-base">{a.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{a.desc}</p>
              </div>
              <span className="text-slate-300 transition group-hover:translate-x-[-4px] group-hover:text-blue-500 text-sm">←</span>
            </Link>
          ))}
        </section>

        {supplierStats.totalDebt > 0 && (
  <section className="mt-5 sm:mt-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-amber-200 bg-amber-50 shadow-sm">
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="flex h-10 w-10 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-100 text-xl sm:text-3xl">
            🏭
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-amber-700">ديون على المتجر للموردين</p>
            <h3 className="text-lg sm:text-2xl font-black text-amber-900">
              {supplierStats.totalDebt.toLocaleString("ar-SA")} ريال
            </h3>
            <p className="text-xs text-amber-600">{supplierStats.total} مورد</p>
          </div>
        </div>
        <Link
          href="/suppliers"
          className="shrink-0 rounded-xl sm:rounded-2xl bg-amber-500 px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-amber-600"
        >
          إدارة الموردين ←
        </Link>
      </div>
    </div>
  </section>
)}

      </div>
    </main>
  );
}