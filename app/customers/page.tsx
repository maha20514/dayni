/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { hasFeature } from "@/lib/features";   
import * as XLSX from "xlsx";   
interface CustomerType {
  _id: string;
  name: string;
  phone: string;
  totalDebt: number;
  userId: string;
}


export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<"free" | "basic" | "pro">("free");

  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"all" | "debt" | "no-debt">("all");
  const [sortBy, setSortBy] = useState<"debt-desc" | "name">("debt-desc");

  const router = useRouter();

  // جلب الخطة + العملاء
  useEffect(() => {
    const storedPlan = localStorage.getItem("plan") || "free";
    setUserPlan(storedPlan as "free" | "basic" | "pro");

    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return setLoading(false);

    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      const myCustomers = data.filter((c: any) => c.userId === userId);
      setCustomers(myCustomers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // حماية المميزات
  const canExport = hasFeature(userPlan, "export_data");
  const canAddCustomer = userPlan === "basic" || userPlan === "pro" || customers.length < 10;

  const filteredAndSorted = useMemo(() => {
    let result = [...customers];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(c => 
        c.name.toLowerCase().includes(term) || c.phone.includes(term)
      );
    }

    if (filterType === "debt") result = result.filter(c => c.totalDebt > 0);
    if (filterType === "no-debt") result = result.filter(c => c.totalDebt <= 0);

    if (sortBy === "debt-desc") {
      result.sort((a, b) => b.totalDebt - a.totalDebt);
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [customers, searchTerm, filterType, sortBy]);

  // تصدير قائمة العملاء
  const exportCustomers = () => {
    if (!canExport) {
      alert("ميزة التصدير متوفرة فقط في الخطة الأساسية والاحترافية");
      return;
    }

    const wsData = [
      ["قائمة العملاء - " + (localStorage.getItem("shopName") || "دَيني")],
      ["", "", ""],
      ["الاسم", "رقم الجوال", "الرصيد المستحق (ريال)"],
      ...customers.map(c => [
        c.name,
        c.phone,
        c.totalDebt.toLocaleString()
      ]),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);  // تحتاج إلى استيراد XLSX
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "العملاء");
    XLSX.writeFile(wb, `عملاء_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  // فتح واتساب
  const openWhatsApp = (phone: string, name: string) => {
    const message = `السلام عليكم،%0Aأنا من ${localStorage.getItem("shopName") || "المتجر"}.%0A%0Aعندك رصيد مستحق بقيمة ${phone} ريال.%0Aيرجى التواصل للتسوية.`;
    window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`, "_blank");
  };

  // حذف عميل
  const deleteCustomer = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من حذف العميل "${name}"؟`)) return;

    try {
      const res = await fetch(`/api/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert(`تم حذف ${name} بنجاح`);
        fetchCustomers();
      } else {
        alert("فشل في الحذف");
      }
    } catch (err) {
      alert("حدث خطأ أثناء الحذف");
    }
  };

  if (loading) return <div className="container py-20 text-center">⏳ جاري التحميل...</div>;

  return (
    <div className="container py-10">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">قائمة العملاء</h1>
          <p className="text-slate-500 mt-1">إدارة العملاء والرصيد المستحق</p>
        </div>

        <div className="flex gap-3">
          {canExport && (
            <button
              onClick={exportCustomers}
              className="bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
            >
              📥 تصدير العملاء
            </button>
          )}

          <Link 
            href="/customers/new" 
            className={`px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 transition-all ${
              canAddCustomer 
                ? "bg-blue-600 hover:bg-blue-700 text-white" 
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
            onClick={(e) => {
              if (!canAddCustomer) {
                e.preventDefault();
                alert("وصلت إلى الحد الأقصى (10 عملاء) في الخطة المجانية.\nيرجى ترقية الخطة لإضافة المزيد.");
              }
            }}
          >
            + إضافة عميل جديد
          </Link>
        </div>
      </div>

      {/* رسالة الحد الأقصى */}
      {!canAddCustomer && (
        <div className="bg-red-50 border border-red-200 rounded-3xl p-6 mb-10 flex items-center justify-between">
          <div>
            <p className="font-semibold text-red-700">وصلت للحد الأقصى من العملاء</p>
            <p className="text-red-600">الخطة المجانية تسمح بـ 10 عملاء فقط</p>
          </div>
          <button 
            onClick={() => router.push("/pricing/checkout?plan=basic")} 
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-2xl font-semibold"
          >
            ترقية الخطة الآن
          </button>
        </div>
      )}

      {/* شريط البحث والتصفية */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="ابحث بالاسم أو رقم الجوال..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-5 py-3.5 border border-slate-300 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          />
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value as any)} className="px-6 py-3.5 border border-slate-300 rounded-2xl">
          <option value="all">جميع العملاء</option>
          <option value="debt">المدينين فقط</option>
          <option value="no-debt">غير المدينين</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-6 py-3.5 border border-slate-300 rounded-2xl">
          <option value="debt-desc">الرصيد (الأعلى أولاً)</option>
          <option value="name">الاسم أبجدياً</option>
        </select>
      </div>

      <p className="text-slate-500 mb-6 text-sm">عرض {filteredAndSorted.length} عميل من أصل {customers.length}</p>

      {/* الجدول */}
      <div className="bg-white rounded-3xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="py-5 px-6 text-right">الاسم</th>
              <th className="py-5 px-6 text-right">رقم الجوال</th>
              <th className="py-5 px-6 text-center">الرصيد المستحق</th>
              <th className="py-5 px-6 text-center w-40">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.map((c) => (
              <tr key={c._id} className="border-t hover:bg-slate-50 transition">
                <td className="py-5 px-6 font-semibold">
                  <Link href={`/customers/${c._id}`} className="hover:text-blue-600">
                    {c.name}
                  </Link>
                </td>
                <td className="py-5 px-6 text-slate-600 font-medium">{c.phone}</td>
                <td className="py-5 px-6 text-center">
                  <span className={`font-bold text-lg ${c.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
                    {c.totalDebt.toLocaleString()} ريال
                  </span>
                </td>
                <td className="py-5 px-6">
                  <div className="flex justify-center gap-6 text-xl">
                    <Link href={`/customers/${c._id}`} className="hover:text-blue-600" title="تفاصيل العميل">
                      👁️
                    </Link>

                    <button 
                      onClick={() => openWhatsApp(c.phone, c.name)} 
                      className="hover:text-green-600 transition" 
                      title="مراسلة عبر واتساب"
                    >
                      💬
                    </button>

                    <button 
                      onClick={() => deleteCustomer(c._id, c.name)} 
                      className="hover:text-red-600 transition" 
                      title="حذف العميل"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}