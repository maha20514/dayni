/* eslint-disable react-hooks/immutability */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type Transaction = {
  _id:         string;
  type:        "دين شراء" | "دفعة";
  amount:      number;
  description: string;
  notes:       string;
  dueDate:     string | null;
  date:        string;
};

type Supplier = {
  _id:          string;
  name:         string;
  phone:        string;
  company:      string;
  notes:        string;
  totalDebt:    number;
  totalPaid:    number;
  remaining:    number;
  transactions: Transaction[];
};

export default function SupplierDetailPage() {
  const params    = useParams();
  const router    = useRouter();
  const { data: session, status } = useSession();
  const supplierId = params.id as string;

  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [loading,  setLoading]  = useState(true);

  const [activeTab, setActiveTab] = useState<"transactions" | "debt" | "payment">("transactions");

  const [debtAmount,  setDebtAmount]  = useState("");
  const [debtDesc,    setDebtDesc]    = useState("");
  const [debtDueDate, setDebtDueDate] = useState("");
  const [savingDebt,  setSavingDebt]  = useState(false);

  const [payAmount, setPayAmount] = useState("");
  const [payNotes,  setPayNotes]  = useState("");
  const [savingPay, setSavingPay] = useState(false);

  // PDF share state per transaction
  const [sharingId, setSharingId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.replace("/login"); return; }
    fetchSupplier();
  }, [status, session]);

  const fetchSupplier = async () => {
    try {
      const res  = await fetch(`/api/suppliers/${supplierId}`, { credentials: "include" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSupplier(data);
    } catch (err: any) {
      toast.error(err.message || "فشل تحميل المورد");
      router.replace("/suppliers");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDebt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!debtAmount || Number(debtAmount) <= 0) { toast.error("أدخل مبلغاً صحيحاً"); return; }
    setSavingDebt(true);
    try {
      const res = await fetch("/api/purchase-debts", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ supplierId, amount: Number(debtAmount), description: debtDesc, dueDate: debtDueDate || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("تم تسجيل الدين بنجاح");
      setDebtAmount(""); setDebtDesc(""); setDebtDueDate("");
      setActiveTab("transactions");
      fetchSupplier();
    } catch (err: any) {
      toast.error(err.message || "فشل التسجيل");
    } finally {
      setSavingDebt(false);
    }
  };

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) { toast.error("أدخل مبلغاً صحيحاً"); return; }
    setSavingPay(true);
    try {
      const res = await fetch("/api/purchase-payments", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ supplierId, amount: Number(payAmount), notes: payNotes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("تم تسجيل الدفعة بنجاح");
      setPayAmount(""); setPayNotes("");
      setActiveTab("transactions");
      fetchSupplier();
    } catch (err: any) {
      toast.error(err.message || "فشل التسجيل");
    } finally {
      setSavingPay(false);
    }
  };

  

const handleShareInvoice = (t: Transaction) => {
  const isPay = t.type === "دفعة";
  const url = isPay
    ? `/payments/purchase-payments/${t._id}`
    : `/invoices/purchase-debts/${t._id}`;

  const win = window.open(url, "_blank");
  if (!win) toast.error("يرجى السماح بالنوافذ المنبثقة");
};

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-amber-600" />
          <p className="font-bold text-slate-800">جاري التحميل...</p>
        </div>
      </main>
    );
  }

  if (!supplier) return null;

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-orange-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-5xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-4 sm:mb-6 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-28 sm:w-28 rounded-br-[2rem] sm:rounded-br-[4rem] bg-amber-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-28 sm:w-28 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-orange-50" />

            <div className="relative flex flex-col gap-4 sm:gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-3 sm:gap-4">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-amber-500 text-2xl sm:text-3xl font-black text-white shadow-xl shadow-amber-500/25 shrink-0">
                  {supplier.name[0]}
                </div>
                <div className="min-w-0">
                  <span className="mb-1 inline-flex rounded-full bg-amber-50 px-2.5 sm:px-3 py-0.5 sm:py-1 text-[10px] sm:text-xs font-bold text-amber-700">مورد</span>
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-950 leading-tight truncate">{supplier.name}</h1>
                  {supplier.company && <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">{supplier.company}</p>}
                  {supplier.phone   && <p className="text-slate-500 text-xs sm:text-sm mt-0.5">📱 {supplier.phone}</p>}
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className={`rounded-xl sm:rounded-2xl border px-4 sm:px-5 py-2.5 sm:py-3 text-center ${
                  supplier.remaining > 0 ? "border-red-200 bg-red-50" : "border-emerald-200 bg-emerald-50"
                }`}>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-500">المتبقي</p>
                  <p className={`text-xl sm:text-2xl font-black leading-tight ${supplier.remaining > 0 ? "text-red-700" : "text-emerald-700"}`}>
                    {supplier.remaining.toLocaleString("ar-SA")}
                    <span className="text-sm sm:text-base font-bold"> ريال</span>
                  </p>
                </div>
                <Link href="/suppliers"
                  className="flex h-10 sm:h-12 items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-4 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50 whitespace-nowrap">
                  ← الموردون
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK STATS */}
        <section className="mb-4 sm:mb-6 grid grid-cols-3 gap-2 sm:gap-4">
          {[
            { label: "إجمالي المشتريات", value: supplier.totalDebt, color: "red",     icon: "📦" },
            { label: "إجمالي المدفوع",   value: supplier.totalPaid, color: "emerald", icon: "✅" },
            { label: "المتبقي",           value: supplier.remaining, color: "amber",   icon: "💸" },
          ].map(s => (
            <div key={s.label} className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
              <div className="mb-1.5 sm:mb-2 text-lg sm:text-2xl">{s.icon}</div>
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 leading-tight">{s.label}</p>
              <p className={`mt-1 text-sm sm:text-xl font-black text-${s.color}-700 leading-tight`}>
                {s.value.toLocaleString("ar-SA")} <span className="text-[10px] sm:text-sm font-bold">ريال</span>
              </p>
            </div>
          ))}
        </section>

        {/* TABS */}
        <div className="mb-4 sm:mb-5 flex gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-1 sm:p-1.5">
          {[
            { id: "transactions", label: "السجل",      icon: "📋" },
            { id: "debt",         label: "تسجيل دين",  icon: "📦" },
            { id: "payment",      label: "تسجيل دفعة", icon: "💰" },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-1 sm:gap-1.5 rounded-lg sm:rounded-xl py-2.5 sm:py-3 text-xs sm:text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="text-sm sm:text-base">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TRANSACTIONS */}
        {activeTab === "transactions" && (
          <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">سجل المعاملات</h2>
              <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{supplier.transactions.length} معاملة</p>
            </div>

            {supplier.transactions.length === 0 ? (
              <div className="py-12 sm:py-16 text-center px-4">
                <div className="mb-3 text-3xl sm:text-4xl">📭</div>
                <p className="text-sm sm:text-base font-bold text-slate-700">لا توجد معاملات بعد</p>
                <p className="mt-1 text-xs sm:text-sm text-slate-500">سجّل دين أو دفعة للبداية</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {supplier.transactions.map(t => {
                  const isPay = t.type === "دفعة";
                  const isSharing = sharingId === t._id;
                  return (
                    <div key={t._id} className="flex items-center gap-2 sm:gap-4 p-3 sm:p-5 transition hover:bg-slate-50">

                      {/* Type icon */}
                      <div className={`flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-xl ${
                        isPay ? "bg-emerald-100" : "bg-red-100"
                      }`}>
                        {isPay ? "💰" : "📦"}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                          <span className={`rounded-full px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-black ${
                            isPay ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                          }`}>
                            {t.type}
                          </span>
                          {t.dueDate && (
                            <span className="rounded-full bg-amber-100 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-amber-700">
                              📅 {new Date(t.dueDate).toLocaleDateString("ar-SA")}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs sm:text-sm text-slate-600 truncate">
                          {t.description || t.notes || "—"}
                        </p>
                        <p className="mt-0.5 text-[10px] sm:text-xs text-slate-400">
                          {new Date(t.date).toLocaleDateString("ar-SA")}
                        </p>
                      </div>

                      {/* Amount */}
                      <p className={`shrink-0 text-sm sm:text-lg font-black ${isPay ? "text-emerald-600" : "text-red-600"}`}>
                        {isPay ? "−" : "+"}{Number(t.amount).toLocaleString("ar-SA")}
                        <span className="text-[10px] sm:text-sm font-bold"> ريال</span>
                      </p>

                      {/* ── Invoice / Share button ── */}
                          <button
                              onClick={() => handleShareInvoice(t)}
                              title={isPay ? "مشاركة سند الاستلام" : "مشاركة الفاتورة"}
                              className={`shrink-0 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border text-sm transition hover:-translate-y-0.5 hover:shadow-sm ${
                                isPay
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              }`}
                        >
                          🧾
                        </button>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Legend */}
            <div className="border-t border-slate-50 px-4 sm:px-6 py-2.5 sm:py-3">
              <p className="text-[10px] sm:text-xs text-slate-400 flex items-center gap-1.5">
                <span>🧾</span>
                <span>اضغط لمشاركة الفاتورة أو حفظها كـ PDF</span>
              </p>
            </div>
          </section>
        )}

        {/* ADD DEBT */}
        {activeTab === "debt" && (
          <section className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="mb-5 sm:mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl sm:rounded-3xl bg-red-50 text-2xl sm:text-3xl">📦</div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">تسجيل دين شراء</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">سجّل مشترياتك بالدين من هذا المورد</p>
            </div>

            <form onSubmit={handleAddDebt} className="space-y-3 sm:space-y-4 max-w-md mx-auto">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">المبلغ (ريال) *</label>
                <input
                  type="number" value={debtAmount} onChange={e => setDebtAmount(e.target.value)}
                  required min="1" placeholder="0"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-xl sm:text-2xl font-black text-red-600 outline-none transition-all placeholder:text-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">وصف البضاعة</label>
                <input
                  type="text" value={debtDesc} onChange={e => setDebtDesc(e.target.value)}
                  placeholder="مثال: أرز وزيت وسكر"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                />
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">موعد السداد</label>
                <input
                  type="date" value={debtDueDate} onChange={e => setDebtDueDate(e.target.value)}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-amber-400 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
                <p className="mt-1 text-[10px] sm:text-xs text-slate-400">سيصلك تذكير قبل الموعد</p>
              </div>
              <button
                type="submit" disabled={savingDebt}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-red-600 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-red-500/25 transition hover:-translate-y-1 hover:bg-red-700 disabled:opacity-60"
              >
                {savingDebt
                  ? <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : "📦"}
                تسجيل الدين
              </button>
            </form>
          </section>
        )}

        {/* ADD PAYMENT */}
        {activeTab === "payment" && (
          <section className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="mb-5 sm:mb-6 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl sm:rounded-3xl bg-emerald-50 text-2xl sm:text-3xl">💰</div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-950">تسجيل دفعة للمورد</h2>
              <p className="mt-1 text-xs sm:text-sm text-slate-500">
                المتبقي: <span className="font-black text-red-600">{supplier.remaining.toLocaleString("ar-SA")} ريال</span>
              </p>
            </div>

            <form onSubmit={handleAddPayment} className="space-y-3 sm:space-y-4 max-w-md mx-auto">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">المبلغ المدفوع (ريال) *</label>
                <input
                  type="number" value={payAmount} onChange={e => setPayAmount(e.target.value)}
                  required min="1" placeholder="0"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-xl sm:text-2xl font-black text-emerald-600 outline-none transition-all placeholder:text-slate-300 focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <div>
                <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold text-slate-400">مبالغ سريعة</p>
                <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                  {[500, 1000, 2000, 5000].map(q => (
                    <button
                      key={q} type="button" onClick={() => setPayAmount(String(q))}
                      className={`rounded-lg sm:rounded-xl py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition ${
                        payAmount === String(q)
                          ? "bg-emerald-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-emerald-200 hover:bg-emerald-50"
                      }`}
                    >
                      {q.toLocaleString("ar-SA")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">ملاحظات</label>
                <input
                  type="text" value={payNotes} onChange={e => setPayNotes(e.target.value)}
                  placeholder="اختياري..."
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                />
              </div>
              <button
                type="submit" disabled={savingPay}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-emerald-600 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-1 hover:bg-emerald-700 disabled:opacity-60"
              >
                {savingPay
                  ? <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : "💰"}
                تسجيل الدفعة
              </button>
            </form>
          </section>
        )}

      </div>
    </main>
  );
}