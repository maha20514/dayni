/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation, formatNumber } from "@/lib/i18n/LanguageContext";

export default function CustomerDetails() {
  const params = useParams();
  const id = params.id as string;
  const { t, dir, locale } = useTranslation();

  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const res = await fetch(`/api/customers/${id}`, { cache: "no-store" });
        if (!res.ok) { setCustomer(null); return; }
        const data = await res.json();
        setCustomer(data);
      } catch (error) {
        console.error("Error fetching customer:", error);
        setCustomer(null);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchCustomer();
  }, [id]);

  const fmt = (v: number) => formatNumber(v, locale);

  if (loading) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-base font-bold text-slate-800">{t("common.loading")}</p>
        </div>
      </main>
    );
  }

  if (!customer) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl sm:text-6xl">😔</div>
          <h2 className="text-xl sm:text-3xl font-bold text-slate-900">{t("customerDetail.notFoundTitle")}</h2>
          <p className="mt-2 sm:mt-3 text-sm sm:text-base text-slate-500">{t("customerDetail.notFoundDesc")}</p>
          <Link href="/customers" className="mt-5 inline-flex items-center rounded-xl sm:rounded-2xl bg-blue-600 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold text-white hover:bg-blue-700">
            {t("customerDetail.backToCustomersFull")}
          </Link>
        </div>
      </main>
    );
  }

  const totalDebt    = Number(customer.totalDebt || 0);
  const transactions = customer.transactions || [];
  const paymentsCount = transactions.filter((t2: any) => t2.type === "سند" || t2.type === "دفعة").length;
  const invoicesCount = transactions.length - paymentsCount;

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-4 sm:py-6 lg:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 start-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* ── HEADER ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          <div className="relative p-4 sm:p-6 lg:p-10">
            <div className="absolute start-0 top-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-ee-[2rem] lg:rounded-ee-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 end-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-ss-[2rem] lg:rounded-ss-[4rem] bg-emerald-50" />

            <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

              {/* Avatar + name */}
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-5">
                <div className="flex h-14 w-14 sm:h-16 sm:w-16 lg:h-20 lg:w-20 shrink-0 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-600 text-2xl sm:text-3xl lg:text-4xl font-black text-white shadow-xl shadow-blue-500/25">
                  {customer.name?.[0] || "؟"}
                </div>
                <div>
                  <span className="mb-1 inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] sm:text-xs font-bold text-blue-700">
                    {t("customerDetail.badge")}
                  </span>
                  <h1 className="text-lg sm:text-2xl lg:text-4xl font-black text-slate-950 leading-tight">
                    {customer.name}
                  </h1>
                  <p className="mt-0.5 sm:mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-slate-500" dir="ltr">
                    <span>📱</span>
                    <span className="font-semibold">{customer.phone}</span>
                  </p>
                </div>
              </div>

              {/* Balance + back */}
              <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                <div className="rounded-xl sm:rounded-[1.5rem] border border-red-200 bg-red-50 px-4 sm:px-5 lg:px-6 py-2.5 sm:py-3 lg:py-4 text-center">
                  <p className="text-[10px] sm:text-xs font-bold text-red-500">{t("customerDetail.outstandingBalance")}</p>
                  <p className="mt-0.5 sm:mt-1 text-lg sm:text-2xl lg:text-4xl font-black text-red-700">
                    {fmt(totalDebt)}{" "}
                    <span className="text-sm sm:text-base lg:text-2xl">{t("customers.riyal")}</span>
                  </p>
                </div>
                <Link
                  href="/customers"
                  className="inline-flex items-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  ← {t("customerDetail.backToCustomers")}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── ACTION BUTTONS ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 grid grid-cols-2 gap-3 sm:gap-4">
          <Link
            href={`/customers/${customer._id}/invoice`}
            className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-4 lg:p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-red-200 hover:shadow-xl group"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-red-50 text-xl sm:text-2xl lg:text-3xl group-hover:bg-red-100 transition">
              📄
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-base lg:text-lg font-bold text-slate-900 leading-tight">{t("customerDetail.issueInvoice")}</p>
              <p className="mt-0.5 text-[10px] sm:text-sm text-slate-500 hidden sm:block">{t("customerDetail.issueInvoiceDesc")}</p>
            </div>
            <span className="ms-auto text-slate-300 group-hover:text-red-400 transition text-sm hidden sm:block">←</span>
          </Link>

          <Link
            href={`/customers/${customer._id}/payment`}
            className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-4 lg:p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl group"
          >
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-xl sm:text-2xl lg:text-3xl group-hover:bg-emerald-100 transition">
              💰
            </div>
            <div className="min-w-0">
              <p className="text-xs sm:text-base lg:text-lg font-bold text-slate-900 leading-tight">{t("customerDetail.recordPayment")}</p>
              <p className="mt-0.5 text-[10px] sm:text-sm text-slate-500 hidden sm:block">{t("customerDetail.recordPaymentDesc")}</p>
            </div>
            <span className="ms-auto text-slate-300 group-hover:text-emerald-400 transition text-sm hidden sm:block">←</span>
          </Link>
        </section>

        {/* ── TRANSACTIONS ── */}
        <section className="overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">

          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-5">
            <div>
              <h2 className="text-sm sm:text-lg lg:text-xl font-bold text-slate-950">{t("customerDetail.transactionsLog")}</h2>
              <p className="mt-0.5 text-[10px] sm:text-sm text-slate-500">{t("customerDetail.transactionsCount", { count: fmt(transactions.length) })}</p>
            </div>
            {transactions.length > 0 && (
              <span className="rounded-full bg-slate-100 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-bold text-slate-600">
                {t("customerDetail.paymentsInvoicesCount", { payments: fmt(paymentsCount), invoices: fmt(invoicesCount) })}
              </span>
            )}
          </div>

          {transactions.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-widest text-slate-400">{t("customerDetail.colDate")}</th>
                      <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-widest text-slate-400">{t("customerDetail.colType")}</th>
                      <th className="px-6 py-4 text-start text-xs font-black uppercase tracking-widest text-slate-400">{t("customerDetail.colDescription")}</th>
                      <th className="px-6 py-4 text-end  text-xs font-black uppercase tracking-widest text-slate-400">{t("customerDetail.colAmount")}</th>
                      <th className="px-6 py-4 text-center text-xs font-black uppercase tracking-widest text-slate-400">{t("customerDetail.colAction")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {transactions.map((t2: any) => {
                      const isPay = t2.type === "سند" || t2.type === "دفعة";
                      return (
                        <tr key={t2._id} className="group transition hover:bg-slate-50/80">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-500">
                            {new Date(t2.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-black ${isPay ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                              {isPay ? t("customerDetail.typeReceipt") : t("customerDetail.typeInvoice")}
                            </span>
                          </td>
                          <td className="max-w-xs px-6 py-4 text-sm text-slate-600">
                            <span className="line-clamp-1">{t2.description || "—"}</span>
                          </td>
                          <td className={`px-6 py-4 text-end text-lg font-black ${isPay ? "text-emerald-600" : "text-red-600"}`}>
                            {isPay ? "−" : "+"}{fmt(t2.amount || 0)} {t("customers.riyal")}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <Link
                              href={isPay ? `/payments/${t2._id}` : `/invoices/${t2._id}`}
                              className={`mx-auto shrink-0 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border text-sm transition hover:-translate-y-0.5 hover:shadow-sm ${
                                isPay
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                                  : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                              }`}
                            >
                              🧾
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {transactions.map((t2: any) => {
                  const isPay = t2.type === "سند" || t2.type === "دفعة";
                  return (
                    <div key={t2._id} className="flex items-center gap-3 px-4 py-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg ${isPay ? "bg-emerald-100" : "bg-red-100"}`}>
                        {isPay ? "💰" : "📄"}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-black ${isPay ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {isPay ? t("customerDetail.typeReceipt") : t("customerDetail.typeInvoice")}
                          </span>
                          {t2.description && (
                            <span className="text-[10px] text-slate-500 truncate max-w-[120px]">{t2.description}</span>
                          )}
                        </div>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {new Date(t2.date).toLocaleDateString(locale === "ar" ? "ar-SA" : "en-US")}
                        </p>
                      </div>

                      <div className="text-end shrink-0 flex flex-col items-end gap-1">
                        <p className={`text-sm font-black ${isPay ? "text-emerald-600" : "text-red-600"}`}>
                          {isPay ? "−" : "+"}{fmt(t2.amount || 0)} {t("customers.riyal")}
                        </p>
                        <Link
                          href={isPay ? `/payments/${t2._id}` : `/invoices/${t2._id}`}
                          className={`shrink-0 flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl border text-sm transition hover:-translate-y-0.5 hover:shadow-sm ${
                            isPay
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                              : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                          }`}
                        >
                          🧾
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="px-4 sm:px-6 py-12 sm:py-16 lg:py-20 text-center">
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl">📭</div>
              <p className="text-sm sm:text-lg font-bold text-slate-700">{t("customerDetail.noTransactionsTitle")}</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">{t("customerDetail.noTransactionsDesc")}</p>
            </div>
          )}
        </section>

      </div>
    </main>
  );
}
