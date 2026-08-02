"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000];

export default function CreatePaymentPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { data: session } = useSession();

  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) { setError("يرجى إدخال مبلغ صحيح"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: session?.user?.id, customerId, amount: Number(amount) }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("تم تسجيل الدفعة بنجاح"); router.push(`/customers/${customerId}`); }
      else setError(data.error || "فشل في تسجيل الدفعة");
    } catch {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/60 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/40 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-emerald-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-blue-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-emerald-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-emerald-700">تسجيل دفعة</span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                  تسجيل دفعة جديدة
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  أدخل المبلغ المستلم من العميل وسيتم تحديث رصيده تلقائياً.
                </p>
              </div>
              <Link
                href={`/customers/${customerId}`}
                className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:bg-slate-50 whitespace-nowrap"
              >
                الرجوع للعميل <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          {/* INFO PANEL */}
          <div className="hidden overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white shadow-xl lg:block">
            <div className="relative min-h-[400px]">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-300/20 blur-3xl" />
              <div className="relative">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20 backdrop-blur">💰</div>
                <h2 className="text-2xl lg:text-3xl font-semibold leading-tight">استلام دفعة</h2>
                <p className="mt-4 max-w-md leading-relaxed text-emerald-100">
                  بعد تسجيل الدفعة سيتم تحديث الرصيد تلقائياً وتوليد سند استلام جاهز للطباعة.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 left-0 space-y-3">
                <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur">
                  <p className="text-sm font-semibold text-emerald-100">يتم تلقائياً</p>
                  <p className="mt-1.5 text-xl font-semibold">تحديث رصيد العميل</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
                  <p className="text-sm font-semibold text-slate-500">بعد الحفظ</p>
                  <p className="mt-1.5 text-xl font-semibold">طباعة سند الاستلام</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="mb-5 sm:mb-8 text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-50 text-3xl sm:text-4xl">💰</div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">المبلغ المستلم</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">أدخل المبلغ الذي دفعه العميل</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">المبلغ (ريال)</label>
                <div className="relative">
                  <input
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0" required min="1"
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-2xl sm:text-3xl font-black text-emerald-600 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                  />
                  <span className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-400">ريال</span>
                </div>
              </div>

              {/* Quick amounts */}
              <div>
                <p className="mb-2 text-xs font-bold text-slate-400">مبالغ سريعة</p>
                <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
                  {QUICK_AMOUNTS.map((q) => (
                    <button
                      key={q} type="button" onClick={() => setAmount(String(q))}
                      className={`rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition ${
                        amount === String(q)
                          ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/25"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {amount && Number(amount) > 0 && (
                <div className="rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 p-3 sm:p-5 text-center">
                  <p className="text-xs sm:text-sm font-bold text-emerald-600">سيتم تسجيل</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black text-emerald-700">
                    {Number(amount).toLocaleString("ar-SA")} ريال
                  </p>
                  <p className="mt-1 text-[10px] sm:text-xs text-emerald-500">كدفعة مستلمة من العميل</p>
                </div>
              )}

              {error && (
                <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-600">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-600 px-8 py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg sm:shadow-xl shadow-emerald-500/25 transition-all hover:-translate-y-1 hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> جاري حفظ الدفعة...</>
                  : <><span>✅</span> تسجيل الدفعة</>
                }
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}