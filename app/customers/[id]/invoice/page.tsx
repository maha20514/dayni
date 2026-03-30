"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

export default function CreateInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId || !amount) return;

    setLoading(true);

    await fetch("/api/invoices", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId,
        amount: Number(amount),
        description: description.trim(),
      }),
    });

    setLoading(false);
    router.push(`/customers/${customerId}`);
  };

  return (
    <div className="container py-12 max-w-lg mx-auto">
      <div className="card p-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-3xl font-bold text-slate-900">إصدار فاتورة جديدة</h2>
          <p className="text-slate-500 mt-2">أدخل تفاصيل الفاتورة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">المبلغ (ريال)</label>
            <input
              type="number"
              className="input text-2xl font-medium"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">وصف الفاتورة</label>
            <textarea
              className="input min-h-[120px] resize-y"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="مثال: بضائع - فاتورة رقم 123"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xl py-4 mt-6 disabled:opacity-70 flex items-center justify-center gap-3"
          >
            {loading ? "جاري الحفظ..." : "💾 حفظ وإصدار الفاتورة"}
          </button>
        </form>
      </div>
    </div>
  );
}