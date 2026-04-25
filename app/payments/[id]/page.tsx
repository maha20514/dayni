/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function PaymentPrintPage() {
  const params = useParams();
  const paymentId = params.id as string;

  const [payment, setPayment] = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [shopName, setShopName] = useState("متجري");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedShopName = localStorage.getItem("shopName") || "متجري";
    setShopName(storedShopName);

    const fetchPayment = async () => {
      try {
        const res = await fetch(`/api/payments/${paymentId}`);
        if (res.ok) {
          const data = await res.json();
          setPayment(data);
          setCustomer(data.customer);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handlePrint = () => window.print();

  if (loading) return <div className="container py-20 text-center">جاري التحميل...</div>;
  if (!payment) return <div className="container py-20 text-center text-red-600">السند غير موجود</div>;

  return (
    <div className="min-h-screen bg-white py-8 print:py-0">
      {/* زر الطباعة */}
      <div className="max-w-lg mx-auto px-6 print:hidden flex justify-end mb-6">
        <button
          onClick={handlePrint}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 font-medium"
        >
          🖨️ طباعة السند
        </button>
      </div>

      {/* السند المقصر */}
      <div className="max-w-lg mx-auto px-6 print:px-6">
        <div className="border-2 border-slate-800 rounded-3xl p-8 print:border-2 print:p-6 bg-white">

          {/* الرأس */}
          <div className="flex justify-center mb-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl text-5xl mb-3">
                💰
              </div>
              <div className="text-3xl font-bold text-emerald-700">سند استلام</div>
              <p className="text-lg text-slate-700 mt-1">{shopName}</p>
            </div>
          </div>

          {/* المبلغ الكبير */}
          <div className="text-center mb-8">
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl py-6 px-12 inline-block">
              <p className="text-emerald-600 text-xs tracking-widest mb-1">المبلغ المستلم</p>
              <p className="text-6xl font-bold text-emerald-700 tracking-tighter">
                {Number(payment.amount).toLocaleString()}
              </p>
              <p className="text-xl text-emerald-600">ريال سعودي</p>
            </div>
          </div>

          {/* بيانات العميل - أقصر */}
          <div className="grid grid-cols-2 gap-6 text-base mb-8">
            <div>
              <p className="text-xs text-slate-500">اسم العميل</p>
              <p className="font-medium">{customer?.name || "غير محدد"}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">رقم الجوال</p>
              <p className="font-medium">{customer?.phone || "غير محدد"}</p>
            </div>
          </div>

          {/* التاريخ */}
          <div className="text-center text-slate-600 text-sm border-t pt-6">
            تم استلام المبلغ بتاريخ:{" "}
            <span className="font-medium">
              {new Date(payment.date).toLocaleDateString("ar-SA")}
            </span>
          </div>

          <div className="mt-10 text-center text-slate-400 text-xs">
            هذا السند يُعتبر إيصالاً رسمياً • شكراً لثقتكم
          </div>
        </div>
      </div>
    </div>
  );
}