"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CreatePaymentPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const userId = localStorage.getItem("userId");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerId || !amount || Number(amount) <= 0) {
      setError("يرجى إدخال مبلغ صحيح");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          customerId,
          amount: Number(amount),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        alert("✅ تم تسجيل الدفعة بنجاح");
        router.push(`/customers/${customerId}`);
      } else {
        setError(data.error || "فشل في تسجيل الدفعة");
      }
    } catch (err) {
      console.error(err);
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-12 max-w-lg mx-auto">
      <div className="card p-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">💰</div>
          <h2 className="text-3xl font-bold text-slate-900">تسجيل دفعة جديدة</h2>
          <p className="text-slate-500 mt-2">أدخل المبلغ المدفوع من العميل</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">
              المبلغ المدفوع (ريال)
            </label>
            <input
              type="number"
              className="input text-2xl font-medium"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              min="1"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-success w-full text-xl py-4 mt-6 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? "جاري حفظ الدفعة..." : "✅ حفظ الدفعة"}
          </button>
        </form>
      </div>
    </div>
  );
}