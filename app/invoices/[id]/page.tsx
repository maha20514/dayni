/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
// app/invoices/[id]/page.tsx
// app/invoices/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function InvoicePrintPage() {
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [shopName, setShopName] = useState("متجري");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const storedShopName = localStorage.getItem("shopName") || "متجري";
    setShopName(storedShopName);

    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        
        if (!res.ok) {
          throw  Error("Failed to fetch invoice");
        }

        const data = await res.json();
        setInvoice(data);
        setCustomer(data.customer);
      } catch (err) {
        console.error(err);
        setError("لم يتم العثور على الفاتورة أو حدث خطأ");
      } finally {
        setLoading(false);
      }
    };

    fetchInvoice();
  }, [invoiceId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="container py-20 text-center">جاري تحميل الفاتورة...</div>;
  }

  if (error || !invoice) {
    return (
      <div className="container py-20 text-center">
        <h2 className="text-2xl font-bold text-red-600">الفاتورة غير موجودة</h2>
        <p className="text-slate-500 mt-4">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-10 print:py-0">
      {/* زر الطباعة */}
      <div className="max-w-3xl mx-auto px-6 print:hidden flex justify-end mb-8">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl flex items-center gap-3 font-medium shadow-lg"
        >
          🖨️ طباعة الفاتورة
        </button>
      </div>

      {/* محتوى الفاتورة */}
      <div className="max-w-3xl mx-auto px-6 print:px-8">
        <div className="border-2 border-slate-800 rounded-3xl p-12 print:border-2 print:shadow-none">

          {/* الرأس */}
          <div className="flex justify-between items-start border-b border-slate-300 pb-10 mb-10">
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-700 to-indigo-700 text-white rounded-3xl flex items-center justify-center text-6xl font-bold">
                د
              </div>
              <div>
                <div className="text-5xl font-bold">دَيني</div>
                <p className="text-slate-600">نظام إدارة الديون</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm text-slate-500">فاتورة رقم</p>
              <p className="text-4xl font-bold text-slate-900">#{invoice._id?.slice(-8)}</p>
              <p className="text-slate-600 mt-4">
                {new Date(invoice.date).toLocaleDateString("ar-SA", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* اسم المتجر */}
          <div className="text-center mb-12">
            <p className="text-3xl font-semibold text-slate-800">{shopName}</p>
            <p className="text-slate-500 mt-1">فاتورة بيع رسمية</p>
          </div>

          {/* بيانات العميل */}
          <div className="grid grid-cols-2 gap-12 mb-12">
            <div>
              <p className="text-xs text-slate-500 mb-2">اسم العميل</p>
              <p className="text-2xl font-semibold">{customer?.name || "غير محدد"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 mb-2">رقم الجوال</p>
              <p className="text-2xl font-semibold">{customer?.phone || "غير محدد"}</p>
            </div>
          </div>

          {/* جدول الفاتورة */}
          <div className="border border-slate-300 rounded-2xl overflow-hidden mb-12">
            <table className="w-full">
              <thead className="bg-slate-100">
                <tr>
                  <th className="py-6 px-8 text-right font-semibold">الوصف</th>
                  <th className="py-6 px-8 text-center font-semibold">الكمية</th>
                  <th className="py-6 px-8 text-left font-semibold">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-10 px-8 border-t">{invoice.description}</td>
                  <td className="py-10 px-8 border-t text-center">1</td>
                  <td className="py-10 px-8 border-t text-left font-bold text-3xl">
                    {Number(invoice.amount).toLocaleString()} ريال
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* الإجمالي */}
          <div className="flex justify-end">
            <div className="text-right">
              <p className="text-slate-600 text-lg">الإجمالي المستحق</p>
              <p className="text-5xl font-bold text-red-600 mt-3">
                {Number(invoice.amount).toLocaleString()} ريال
              </p>
            </div>
          </div>

          <div className="mt-20 text-center text-slate-400 text-sm border-t pt-10">
            شكراً لثقتكم بنا • يمكنكم الدفع نقداً أو عبر التحويل البنكي
          </div>
        </div>
      </div>
    </div>
  );
}