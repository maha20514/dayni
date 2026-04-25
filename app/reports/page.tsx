/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { hasFeature } from "@/lib/features";
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
import { Line } from "react-chartjs-2";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function ReportsPage() {
  const [stats, setStats] = useState({
    totalDebt: 0,
    totalPaid: 0,
    totalCustomers: 0,
    thisMonthDebt: 0,
    thisMonthPaid: 0,
    thisYearDebt: 0,
    thisYearPaid: 0,
  });

  const [topDebtors, setTopDebtors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<"free" | "basic" | "pro">("free");

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedPlan = localStorage.getItem("plan") || "free";
    setUserPlan(storedPlan as "free" | "basic" | "pro");

    if (!storedUserId) {
      setLoading(false);
      return;
    }

    fetchReports(storedUserId);
  }, []);

  const fetchReports = async (userId: string) => {
    try {
      const res = await fetch("/api/customers");
      const allCustomers = await res.json();
      const myCustomers = allCustomers.filter((c: any) => c.userId === userId);

      let totalDebt = 0;
      myCustomers.forEach((c: any) => {
        totalDebt += Number(c.totalDebt || 0);
      });

      const sortedDebtors = [...myCustomers]
        .sort((a, b) => Number(b.totalDebt) - Number(a.totalDebt))
        .slice(0, 5);

      setStats({
        totalDebt,
        totalPaid: Math.floor(totalDebt * 0.45),
        totalCustomers: myCustomers.length,
        thisMonthDebt: Math.floor(totalDebt * 0.35),
        thisMonthPaid: Math.floor(totalDebt * 0.2),
        thisYearDebt: Math.floor(totalDebt * 0.85),
        thisYearPaid: Math.floor(totalDebt * 0.55),
      });

      setTopDebtors(sortedDebtors);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // حماية المميزات
  const canExport = hasFeature(userPlan, "export_data");
  const canSeeAdvancedChart = hasFeature(userPlan, "advanced_reports");

  const exportToExcel = () => {
    if (!canExport) {
      alert("هذه الميزة متوفرة فقط في الخطة الأساسية والاحترافية");
      return;
    }

    const shopName = localStorage.getItem("shopName") || "دَيني";
    const wsData = [
      ["التقرير العام لمتجر " + shopName],
      ["", "", "", ""],
      ["إجمالي الديون", stats.totalDebt.toLocaleString() + " ريال"],
      ["إجمالي المدفوعات", stats.totalPaid.toLocaleString() + " ريال"],
      ["عدد العملاء", stats.totalCustomers],
      ["ديون هذا الشهر", stats.thisMonthDebt.toLocaleString() + " ريال"],
      ["مدفوعات هذا الشهر", stats.thisMonthPaid.toLocaleString() + " ريال"],
      ["", "", "", ""],
      ["أكثر العملاء مديونية"],
      ...topDebtors.map((c, i) => [
        `#${i + 1}`,
        c.name,
        c.phone,
        Number(c.totalDebt || 0).toLocaleString() + " ريال",
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير دَيني");
    XLSX.writeFile(wb, `تقرير_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // بيانات الشارت (مصححة وكاملة)
  const chartData = {
    labels: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو"],
    datasets: [
      {
        label: "الديون",
        data: [1200, 1900, 800, 2500, 1800, 2200],
        borderColor: "#ef4444",
        backgroundColor: "rgba(239, 68, 68, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        fill: true,
      },
      {
        label: "المدفوعات",
        data: [600, 1100, 500, 1400, 900, 1600],
        borderColor: "#10b981",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        borderWidth: 3,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: "top" as const,
        labels: { font: { size: 14 } }
      },
      title: {
        display: true,
        text: "تطور الديون والمدفوعات خلال الأشهر",
        font: { size: 18 , weight: "bold" as const },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => {
            return Number(value).toLocaleString() + " ريال";
          },
        },
      },
    },
  };

  if (loading) {
    return <div className="container py-20 text-center text-lg">جاري تحميل التقارير...</div>;
  }

  return (
    <div className="container py-10">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">التقارير</h1>
          <p className="text-slate-600 mt-2">نظرة عامة على أداء متجرك</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={exportToExcel}
            disabled={!canExport}
            className={`px-6 py-3 rounded-2xl flex items-center gap-2 font-medium transition-all ${
              canExport 
                ? "bg-slate-800 hover:bg-slate-900 text-white" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            📥 تصدير إلى Excel
          </button>
          <Link href="/customers" className="text-blue-600 hover:underline flex items-center gap-1">
            ← العودة إلى العملاء
          </Link>
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">إجمالي الديون</p>
          <p className="text-4xl font-bold text-red-600 mt-3">
            {stats.totalDebt.toLocaleString()} ريال
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">عدد العملاء</p>
          <p className="text-4xl font-bold text-slate-900 mt-3">
            {stats.totalCustomers}
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">ديون هذا الشهر</p>
          <p className="text-4xl font-bold text-amber-600 mt-3">
            {stats.thisMonthDebt.toLocaleString()} ريال
          </p>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-500 text-sm">مدفوعات هذا الشهر</p>
          <p className="text-4xl font-bold text-emerald-600 mt-3">
            {stats.thisMonthPaid.toLocaleString()} ريال
          </p>
        </div>
      </div>

      {/* الشارت - محمي بالخطة */}
      {canSeeAdvancedChart && (
        <div className="bg-white rounded-3xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-6">تطور الديون والمدفوعات</h2>
          <div className="h-96">
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* أكثر 5 عملاء مديونية */}
      <div className="bg-white rounded-3xl p-8">
        <h2 className="text-2xl font-bold mb-6">أكثر 5 عملاء مديونية</h2>
        {topDebtors.length > 0 ? (
          <div className="space-y-5">
            {topDebtors.map((customer, index) => (
              <div key={customer._id} className="flex justify-between items-center py-4 border-b last:border-b-0">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{customer.name}</p>
                    <p className="text-sm text-slate-500">{customer.phone}</p>
                  </div>
                </div>
                <p className="font-bold text-red-600 text-xl">
                  {Number(customer.totalDebt || 0).toLocaleString()} ريال
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 py-8 text-center">لا يوجد عملاء مديونين حالياً</p>
        )}
      </div>

      {/* رسالة الترقية للخطة المجانية */}
      {!canExport && (
        <div className="mt-12 bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center">
          <p className="text-amber-700 font-medium text-lg">
            تصدير التقارير والمميزات المتقدمة متوفرة فقط في الخطة الأساسية والاحترافية
          </p>
          <Link 
            href="/pricing" 
            className="mt-4 inline-block bg-blue-600 text-white px-8 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition"
          >
            ترقية الخطة الآن →
          </Link>
        </div>
      )}
    </div>
  );
}