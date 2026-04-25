"use client";
export const dynamic = "force-dynamic";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const selectedPlan = searchParams.get("plan") || "basic";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const planInfo = {
    basic: { name: "الخطة الأساسية", price: 19, period: "شهرياً" },
    pro: { name: "الخطة الاحترافية", price: 39, period: "شهرياً" },
  };

  const plan = planInfo[selectedPlan as keyof typeof planInfo] || planInfo.basic;

  const handleCheckout = async () => {
    setLoading(true);
    setError("");

    const userId = localStorage.getItem("userId");
    if (!userId) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("/api/payments/hyperpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          plan: selectedPlan,
          amount: plan.price,
        }),
      });

      const data = await res.json();

      if (data.success && data.paymentUrl) {
        window.location.href = data.paymentUrl; // توجيه إلى HyperPay
      } else {
        setError(data.error || "فشل في بدء عملية الدفع");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900">ترقية الخطة</h1>
          <p className="text-slate-600 mt-3">{plan.name}</p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-8 mb-10 text-center">
          <p className="text-5xl font-bold text-slate-900">{plan.price} <span className="text-2xl">ريال</span></p>
          <p className="text-slate-500 mt-1">{plan.period}</p>
        </div>

        <button
          onClick={handleCheckout}
          disabled={loading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-5 rounded-2xl font-semibold text-lg hover:brightness-105 transition-all disabled:opacity-70"
        >
          {loading ? "جاري التوجيه إلى بوابة الدفع..." : `ادفع ${plan.price} ريال الآن`}
        </button>

        {error && <p className="text-red-600 text-center mt-4">{error}</p>}

        <p className="text-center text-xs text-slate-500 mt-8">
          الدفع آمن 100% عبر HyperPay • يمكنك الإلغاء في أي وقت
        </p>
      </div>
    </div>
  );
}