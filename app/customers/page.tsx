/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-async-client-component */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

interface CustomerType {
  id: string;
  name: string;
  phone: string;
  totalDebt: number;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCustomers = async () => {
    const userId = localStorage.getItem("userId");
    if (!userId) return setLoading(false);

    try {
      const res = await fetch("/api/customers");
      const data = await res.json();

      // فلترة العملاء حسب userId
      const filtered = data.filter((c: any) => c.userId === userId);
      setCustomers(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // عرض رسالة التحميل
  if (loading) {
    return (
      <div className="container py-12 text-center">
        <p className="text-lg text-slate-600">⏳ جاري التحميل...</p>
      </div>
    );
  }

  // عرض لا يوجد عملاء
  if (!customers || customers.length === 0) {
    return (
      <div className="container py-12">
        <div className="card p-12 text-center">
          <div className="text-7xl mb-6">👥</div>
          <h2 className="text-3xl font-bold text-slate-800 mb-3">
            لا يوجد عملاء حتى الآن
          </h2>
          <p className="text-slate-500 text-lg mb-8">
            ابدأ بإضافة أول عميل الآن
          </p>
          <Link 
            href="/customers/new" 
            className="btn-primary text-lg px-10 py-4"
          >
            ➕ إضافة عميل جديد
          </Link>
        </div>
      </div>
    );
  }

  // عرض قائمة العملاء
  return (
    <div className="container py-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-10">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">قائمة العملاء</h1>
          <p className="text-slate-500 mt-2 text-lg">إدارة جميع العملاء والرصيد</p>
        </div>
        <Link 
          href="/customers/new" 
          className="btn-primary text-lg px-8 py-4"
        >
          + إضافة عميل جديد
        </Link>
      </div>

      <div className="card">
        <div className="overflow-x-auto">
          <table className="table min-w-full">
            <thead>
              <tr>
                <th>الاسم</th>
                <th>رقم الجوال</th>
                <th>الرصيد المستحق</th>
                <th className="w-32"></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c: any) => (
                <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                  <td className="font-semibold text-slate-900">
                    <Link 
                      href={`/customers/${c.id}`} 
                      className="hover:text-blue-600"
                    >
                      {c.name}
                    </Link>
                  </td>
                  <td className="text-slate-600 font-medium">{c.phone}</td>
                  <td>
                    <span className="font-bold text-xl text-red-600">
                      {c.totalDebt.toLocaleString()} ريال
                    </span>
                  </td>
                  <td>
                    <Link 
                      href={`/customers/${c.id}`} 
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                    >
                      عرض التفاصيل →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}