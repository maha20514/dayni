/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDebt: 0,
    thisMonthDebt: 0,
    totalPayments: 0,
  });

  const [recentTransactions, setRecentTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      window.location.href = "/login";
      return;
    }
    fetchDashboardData(userId);
  }, []);

  const fetchDashboardData = async (userId: string) => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      const myCustomers = data.filter((c: any) => c.userId === userId);

      let totalDebt = 0;
      myCustomers.forEach((c: any) => totalDebt += Number(c.totalDebt || 0));

      const recent = myCustomers
        .sort((a: any, b: any) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
        .slice(0, 5)
        .map((c: any) => ({
          name: c.name,
          amount: c.totalDebt,
          type: c.totalDebt > 0 ? "دين" : "دفع",
          date: new Date().toISOString(),
        }));

      setStats({
        totalCustomers: myCustomers.length,
        totalDebt,
        thisMonthDebt: Math.floor(totalDebt * 0.3),
        totalPayments: Math.floor(totalDebt * 0.45),
      });

      setRecentTransactions(recent);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const chartData = {
    labels: ["1 الأسبوع", "2 الأسبوع", "3 الأسبوع", "4 الأسبوع"],
    datasets: [
      {
        label: "الديون الجديدة",
        data: [5200, 7100, 4300, 7800],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        borderWidth: 3,
      },
      {
        label: "المدفوعات",
        data: [3100, 4200, 2800, 5100],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        borderWidth: 3,
      },
    ],
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-2xl">جاري تحميل لوحة التحكم...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 py-10">
      <div className="container mx-auto px-6 max-w-7xl">
        {/* الترحيب */}
        <div className="flex justify-between items-end mb-12">
          <div>
            <div className="flex items-center gap-4">
              <span className="text-5xl">👋</span>
              <div>
                <h1 className="text-5xl font-bold text-slate-900">مرحباً بعودتك</h1>
                <p className="text-xl text-slate-600 mt-2">إليك نظرة عامة على متجرك اليوم</p>
              </div>
            </div>
          </div>

          <Link 
            href="/customers/new" 
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-10 py-4 rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center gap-3"
          >
            + إضافة عميل جديد
          </Link>
        </div>

        {/* الكروت الأربعة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-3xl p-8 shadow hover:shadow-2xl transition-all border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">إجمالي الديون</p>
                <p className="text-4xl font-bold text-red-600 mt-3">{stats.totalDebt.toLocaleString()} ريال</p>
              </div>
              <div className="text-6xl opacity-80">💰</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow hover:shadow-2xl transition-all border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">ديون هذا الشهر</p>
                <p className="text-4xl font-bold text-amber-600 mt-3">{stats.thisMonthDebt.toLocaleString()} ريال</p>
              </div>
              <div className="text-6xl opacity-80">📅</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow hover:shadow-2xl transition-all border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">عدد العملاء</p>
                <p className="text-4xl font-bold text-slate-900 mt-3">{stats.totalCustomers}</p>
              </div>
              <div className="text-6xl opacity-80">👥</div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow hover:shadow-2xl transition-all border border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm">المدفوعات</p>
                <p className="text-4xl font-bold text-emerald-600 mt-3">{stats.totalPayments.toLocaleString()} ريال</p>
              </div>
              <div className="text-6xl opacity-80">✅</div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-7 gap-8">
          {/* آخر العمليات */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold">آخر العمليات</h2>
              <Link href="/customers" className="text-blue-600 hover:underline">عرض الكل →</Link>
            </div>

            <div className="space-y-6">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((t, i) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b last:border-b-0">
                    <div className="flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl ${t.type === "دين" ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>
                        {t.type === "دين" ? "📄" : "💵"}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{t.name}</p>
                        <p className="text-sm text-slate-500">{new Date(t.date).toLocaleDateString("ar-SA")}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold text-2xl ${t.type === "دين" ? "text-red-600" : "text-emerald-600"}`}>
                        {t.amount.toLocaleString()} ريال
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 py-12 text-center">لا توجد عمليات حديثة بعد</p>
              )}
            </div>
          </div>

          {/* الشارت */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-8">تطور الديون والمدفوعات</h2>
            <div className="h-96">
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}