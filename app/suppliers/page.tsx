/* eslint-disable react-hooks/immutability */
"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { useTranslation, formatNumber } from "@/lib/i18n/LanguageContext";

interface SupplierType {
  _id:       string;
  name:      string;
  phone:     string;
  company:   string;
  totalDebt: number;
}

type FilterType = "all" | "debt" | "paid";
type SortType   = "debt-desc" | "name";

export default function SuppliersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, dir, locale } = useTranslation();

  const [suppliers,   setSuppliers]   = useState<SupplierType[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [searchTerm,  setSearchTerm]  = useState("");
  const [filterType,  setFilterType]  = useState<FilterType>("all");
  const [sortBy,      setSortBy]      = useState<SortType>("debt-desc");
  const [showAdd,     setShowAdd]     = useState(false);

  const [name,    setName]    = useState("");
  const [phone,   setPhone]   = useState("");
  const [company, setCompany] = useState("");
  const [notes,   setNotes]   = useState("");
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.replace("/login"); return; }
    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session]);

  const fetchSuppliers = async () => {
    try {
      const res  = await fetch("/api/suppliers", { credentials: "include" });
      const data = await res.json();
      setSuppliers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error(t("suppliers.nameRequired")); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/suppliers", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ name, phone, company, notes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(t("suppliers.addSuccess"));
      setShowAdd(false);
      setName(""); setPhone(""); setCompany(""); setNotes("");
      fetchSuppliers();
    } catch (err: any) {
      toast.error(err.message || t("suppliers.addFailed"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, supplierName: string) => {
    toast(t("suppliers.deleteConfirm", { name: supplierName }), {
      action: {
        label: t("suppliers.deleteConfirmAction"),
        onClick: async () => {
          try {
            const res = await fetch(`/api/suppliers/${id}`, {
              method: "DELETE",
            });

            if (!res.ok) throw new Error();

            toast.success(t("suppliers.deleteSuccess"));

            setSuppliers((prev) =>
              prev.filter((s) => s._id !== id)
            );
          } catch {
            toast.error(t("suppliers.deleteFailed"));
          }
        },
      },
      cancel: {
        label: t("suppliers.cancelAction"),
        onClick: () => {},
      },
    });
  };

  const totalDebt = useMemo(() =>
    suppliers.reduce((s, sup) => s + Number(sup.totalDebt || 0), 0), [suppliers]);

  const filtered = useMemo(() => {
    let result = [...suppliers];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.company?.toLowerCase().includes(term) ||
        s.phone?.includes(term)
      );
    }
    if (filterType === "debt") result = result.filter(s => s.totalDebt > 0);
    if (filterType === "paid") result = result.filter(s => s.totalDebt <= 0);
    if (sortBy === "debt-desc") result.sort((a, b) => b.totalDebt - a.totalDebt);
    if (sortBy === "name")      result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [suppliers, searchTerm, filterType, sortBy]);

  const fmt = (v: number) => formatNumber(v, locale);

  if (loading) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-amber-100 border-t-amber-600" />
          <p className="font-bold text-slate-800">{t("suppliers.loadingTitle")}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-amber-100/60 blur-3xl" />
      <div className="absolute bottom-20 start-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-orange-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ee-[2rem] sm:rounded-ee-[4rem] bg-amber-50" />
            <div className="absolute bottom-0 end-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ss-[2rem] sm:rounded-ss-[4rem] bg-orange-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-amber-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-amber-700">
                  {t("suppliers.badge")}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                  {t("suppliers.title")}
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  {t("suppliers.subtitle")}
                </p>
              </div>
              <button
                onClick={() => setShowAdd(true)}
                className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-amber-500 px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg shadow-amber-500/25 transition-all hover:-translate-y-1 hover:bg-amber-600"
              >
                {t("suppliers.addButton")} <span className="ms-1 sm:ms-2 text-lg sm:text-xl">+</span>
              </button>
            </div>
          </div>
        </section>

        {/* STATS */}
        <section className="mb-5 sm:mb-8 grid gap-3 sm:gap-5 grid-cols-3">
          {[
            { label: t("suppliers.totalSuppliers"), value: fmt(suppliers.length),                                    icon: "🏭", color: "amber"  },
            { label: t("suppliers.totalDue"),        value: `${fmt(totalDebt)} ${t("suppliers.riyal")}`,              icon: "💸", color: "red"    },
            { label: t("suppliers.hasBalance"),      value: fmt(suppliers.filter(s => s.totalDebt > 0).length),       icon: "⚠️", color: "orange" },
          ].map(s => (
            <div key={s.label} className="rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
              <div className={`mb-2 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl text-lg sm:text-2xl bg-${s.color}-50`}>
                {s.icon}
              </div>
              <p className="text-[10px] sm:text-sm font-bold text-slate-500 leading-tight">{s.label}</p>
              <h2 className={`mt-1 sm:mt-2 text-sm sm:text-xl font-black text-${s.color}-700 leading-tight`}>{s.value}</h2>
            </div>
          ))}
        </section>

        {/* FILTERS */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
          <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <input
                type="text"
                placeholder={t("suppliers.searchPlaceholder")}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 py-3 sm:py-4 ps-10 pe-4 sm:pe-5 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
              />
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value as FilterType)}
              className="rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-3 sm:px-5 py-3 sm:py-4 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              <option value="all">{t("suppliers.filterAll")}</option>
              <option value="debt">{t("suppliers.filterDebt")}</option>
              <option value="paid">{t("suppliers.filterPaid")}</option>
            </select>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as SortType)}
              className="rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-3 sm:px-5 py-3 sm:py-4 text-sm font-bold text-slate-700 outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
            >
              <option value="debt-desc">{t("suppliers.sortDebtDesc")}</option>
              <option value="name">{t("suppliers.sortName")}</option>
            </select>
          </div>
          <p className="mt-2 sm:mt-4 text-xs sm:text-sm font-semibold text-slate-500">
            {t("suppliers.showingCount", { shown: fmt(filtered.length), total: fmt(suppliers.length) })}
          </p>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          {filtered.length > 0 ? (
            <>
              {/* Desktop */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-start text-xs sm:text-sm font-black text-slate-600">{t("suppliers.colSupplier")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-start text-xs sm:text-sm font-black text-slate-600">{t("suppliers.colCompany")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-start text-xs sm:text-sm font-black text-slate-600">{t("suppliers.colPhone")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-center text-xs sm:text-sm font-black text-slate-600">{t("suppliers.colBalance")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-center text-xs sm:text-sm font-black text-slate-600">{t("suppliers.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(sup => (
                      <tr key={sup._id} className="border-t border-slate-100 transition hover:bg-amber-50/30">
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                          <Link href={`/suppliers/${sup._id}`} className="group flex items-center gap-2 sm:gap-3">
                            <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-amber-50 text-sm sm:text-lg font-black text-amber-700">
                              {sup.name.charAt(0)}
                            </span>
                            <span className="font-bold text-slate-900 text-sm sm:text-base transition group-hover:text-amber-700">
                              {sup.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-slate-500">{sup.company || "—"}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-xs sm:text-sm text-slate-600" dir="ltr">{sup.phone || "—"}</td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                          <span className={`text-sm sm:text-lg font-black ${sup.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
                            {fmt(Number(sup.totalDebt || 0))} {t("suppliers.riyal")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                          <div className="flex justify-center gap-1.5 sm:gap-2">
                            <Link href={`/suppliers/${sup._id}`}
                              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-amber-50 text-sm sm:text-lg transition hover:bg-amber-100">
                              👁️
                            </Link>
                            <button
                              onClick={() => handleDelete(sup._id, sup.name)}
                              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-red-50 text-sm sm:text-lg transition hover:bg-red-100">
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filtered.map(sup => (
                  <div key={sup._id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/suppliers/${sup._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-base font-black text-amber-700">
                          {sup.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{sup.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{sup.company || sup.phone || "—"}</p>
                        </div>
                      </Link>
                      <div className="text-end shrink-0">
                        <p className={`text-sm font-black ${sup.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {fmt(Number(sup.totalDebt || 0))} {t("suppliers.riyal")}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                          sup.totalDebt > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {sup.totalDebt > 0 ? t("suppliers.statusDue") : t("suppliers.statusPaid")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/suppliers/${sup._id}`}
                        className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-amber-50 py-2 text-xs font-bold text-amber-700 hover:bg-amber-100 transition">
                        👁️ {t("suppliers.details")}
                      </Link>
                      <button
                        onClick={() => handleDelete(sup._id, sup.name)}
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-sm hover:bg-red-100 transition">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 sm:px-6 py-12 sm:py-20 text-center">
              <div className="mb-3 sm:mb-4 text-4xl sm:text-5xl">🏭</div>
              <p className="text-base sm:text-lg font-bold text-slate-700">{t("suppliers.emptyTitle")}</p>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">{t("suppliers.emptyDesc")}</p>
              <button
                onClick={() => setShowAdd(true)}
                className="mt-4 sm:mt-6 inline-flex rounded-xl sm:rounded-2xl bg-amber-500 px-6 sm:px-8 py-3 sm:py-4 text-sm font-bold text-white transition hover:bg-amber-600"
              >
                {t("suppliers.addNow")}
              </button>
            </div>
          )}
        </section>
      </div>

      {/* ADD MODAL */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-sm">
          <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 md:p-8 shadow-2xl">
            <div className="mb-5 sm:mb-6 text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-amber-50 text-3xl sm:text-4xl">
                🏭
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-950">{t("suppliers.modalTitle")}</h3>
            </div>

            <form onSubmit={handleAdd} className="space-y-3 sm:space-y-4">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{t("suppliers.nameLabel")}</label>
                <input
                  type="text" value={name} onChange={e => setName(e.target.value)} required
                  placeholder={t("suppliers.namePlaceholder")}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{t("suppliers.companyLabel")}</label>
                <input
                  type="text" value={company} onChange={e => setCompany(e.target.value)}
                  placeholder={t("suppliers.companyPlaceholder")}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{t("suppliers.phoneLabel")}</label>
                <input
                  type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                  placeholder={t("suppliers.phonePlaceholder")}
                  dir="ltr"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">{t("suppliers.notesLabel")}</label>
                <textarea
                  value={notes} onChange={e => setNotes(e.target.value)}
                  rows={2} placeholder={t("suppliers.notesPlaceholder")}
                  className="w-full resize-none rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-medium outline-none transition-all focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
                />
              </div>

              <div className="flex gap-2 sm:gap-3 pt-1">
                <button
                  type="submit" disabled={saving}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-amber-500 py-3 sm:py-4 text-sm sm:text-base font-bold text-white shadow-lg transition hover:bg-amber-600 disabled:opacity-60"
                >
                  {saving ? <span className="h-4 w-4 sm:h-5 sm:w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "🏭"}
                  {t("suppliers.submit")}
                </button>
                <button
                  type="button" onClick={() => setShowAdd(false)}
                  className="rounded-xl sm:rounded-2xl bg-slate-100 px-5 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  {t("suppliers.cancel")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
