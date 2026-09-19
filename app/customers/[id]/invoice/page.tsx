"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function CreateInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;
  const { data: session } = useSession();
  const { t, dir } = useTranslation();

  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const quickDescs = [
    t("invoicePage.quickDesc1"),
    t("invoicePage.quickDesc2"),
    t("invoicePage.quickDesc3"),
    t("invoicePage.quickDesc4"),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !description.trim()) { setError(t("invoicePage.missingFields")); return; }
    if (Number(amount) <= 0) { setError(t("invoicePage.invalidAmount")); return; }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: session?.user?.id,
          customerId,
          amount: Number(amount),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (res.ok) { toast.success(t("invoicePage.success")); router.push(`/customers/${customerId}`); }
      else setError(data.error || t("invoicePage.failed"));
    } catch {
      setError(t("invoicePage.connectionError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 start-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-red-100/40 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ee-[2rem] sm:rounded-ee-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 end-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ss-[2rem] sm:rounded-ss-[4rem] bg-red-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-red-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-red-600">{t("invoicePage.badge")}</span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                  {t("invoicePage.title")}
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  {t("invoicePage.subtitle")}
                </p>
              </div>
              <Link
                href={`/customers/${customerId}`}
                className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:bg-slate-50 whitespace-nowrap"
              >
                {t("invoicePage.backToCustomer")} <span className="ms-1 sm:ms-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          {/* INFO PANEL */}
          <div className="hidden overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-gradient-to-br from-red-500 to-rose-600 p-8 text-white shadow-xl lg:block">
            <div className="relative min-h-[400px]">
              <div className="absolute -end-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -start-20 h-72 w-72 rounded-full bg-orange-300/20 blur-3xl" />
              <div className="relative">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20 backdrop-blur">📄</div>
                <h2 className="text-2xl lg:text-3xl font-semibold leading-tight">{t("invoicePage.sideTitle")}</h2>
                <p className="mt-4 max-w-md leading-relaxed text-red-100">
                  {t("invoicePage.sideDesc")}
                </p>
              </div>
              <div className="absolute bottom-0 end-0 start-0 space-y-3">
                <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur">
                  <p className="text-sm font-semibold text-red-100">{t("invoicePage.autoStep")}</p>
                  <p className="mt-1.5 text-xl font-semibold">{t("invoicePage.autoStepDesc")}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
                  <p className="text-sm font-semibold text-slate-500">{t("invoicePage.afterSaveStep")}</p>
                  <p className="mt-1.5 text-xl font-semibold">{t("invoicePage.afterSaveStepDesc")}</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="mb-5 sm:mb-8 text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-red-50 text-3xl sm:text-4xl">📄</div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">{t("invoicePage.formTitle")}</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">{t("invoicePage.formSubtitle")}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{t("invoicePage.amountLabel")}</label>
                <div className="relative">
                  <input
                    type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                    placeholder="0" required min="1"
                    dir="ltr"
                    className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-xl sm:text-2xl font-black text-red-600 outline-none transition-all placeholder:text-slate-300 focus:border-red-400 focus:bg-white focus:ring-4 focus:ring-red-100"
                  />
                  <span className="absolute end-4 sm:end-5 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-slate-400">{t("customers.riyal")}</span>
                </div>
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{t("invoicePage.descLabel")}</label>
                <textarea
                  value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("invoicePage.descPlaceholder")}
                  required rows={3}
                  className="w-full resize-none rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Quick presets */}
              <div>
                <p className="mb-2 text-xs font-bold text-slate-400">{t("invoicePage.quickDesc")}</p>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {quickDescs.map((p) => (
                    <button
                      key={p} type="button" onClick={() => setDescription(p)}
                      className={`rounded-lg sm:rounded-xl px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition ${
                        description === p
                          ? "bg-blue-600 text-white"
                          : "border border-slate-200 bg-slate-50 text-slate-600 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="rounded-xl sm:rounded-2xl border border-red-200 bg-red-50 px-4 sm:px-5 py-3 sm:py-4 text-xs sm:text-sm font-bold text-red-600">
                  ⚠️ {error}
                </div>
              )}

              <button
                type="submit" disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-red-600 px-8 py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg sm:shadow-xl shadow-red-500/25 transition-all hover:-translate-y-1 hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading
                  ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> {t("invoicePage.submitting")}</>
                  : <><span>📄</span> {t("invoicePage.submit")}</>
                }
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
