/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";
import { useSession } from "next-auth/react";
import { hasFeature } from "@/lib/permissions";
import { toast } from "sonner";
import { useTranslation, formatNumber } from "@/lib/i18n/LanguageContext";

interface CustomerType {
  _id: string;
  name: string;
  phone: string;
  totalDebt: number;
  userId: string;
}

type PlanType = "free" | "basic" | "pro";
type FilterType = "all" | "debt" | "no-debt";
type SortType = "debt-desc" | "name";

export default function CustomersPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { t, dir, locale } = useTranslation();

  const [customers, setCustomers] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState<PlanType>("free");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");
  const [sortBy, setSortBy] = useState<SortType>("debt-desc");

  const isMember       = (session?.user as any)?.isMember;
  const memberRole     = (session?.user as any)?.memberRole;
  const canAdd         = !isMember || memberRole === "admin";
  const currentPlan    = (session?.user as any)?.plan || userPlan;
  const canAddCustomer = canAdd && (currentPlan === "basic" || currentPlan === "pro" || customers.length < 10);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) { router.replace("/login"); return; }
    setUserPlan((session.user as any)?.plan || "free");
    fetchCustomers(session.user.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);

  const fetchCustomers = async (userId: string) => {
    try {
      const res  = await fetch("/api/customers", { credentials: "include" });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setCustomers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Fetch customers error:", error);
    } finally {
      setLoading(false);
    }
  };

  const canExport = hasFeature(userPlan, "export_data");

  const totalDebt = useMemo(() =>
    customers.reduce((sum, c) => sum + Number(c.totalDebt || 0), 0), [customers]);

  const debtCustomersCount = useMemo(() =>
    customers.filter((c) => c.totalDebt > 0).length, [customers]);

  const filteredAndSorted = useMemo(() => {
    let result = [...customers];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) =>
        c.name.toLowerCase().includes(term) || c.phone.includes(term)
      );
    }
    if (filterType === "debt") result = result.filter((c) => c.totalDebt > 0);
    if (filterType === "no-debt") result = result.filter((c) => c.totalDebt <= 0);
    if (sortBy === "debt-desc") result.sort((a, b) => b.totalDebt - a.totalDebt);
    if (sortBy === "name") result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [customers, searchTerm, filterType, sortBy]);

  const exportCustomers = () => {
    if (!canExport) { toast.error(t("customers.exportDisabled")); return; }
    const shopName = (session?.user as any)?.shopName || t("common.appName");
    const wsData = [
      [`${t("customers.title")} - ${shopName}`],
      ["", "", ""],
      [t("customers.colCustomer"), t("customers.colPhone"), `${t("customers.colBalance")} (${t("customers.riyal")})`],
      ...customers.map((c) => [c.name, c.phone, formatNumber(c.totalDebt, locale)]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, t("customers.title"));
    XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const openWhatsApp = (phone: string, name: string, debt: number) => {
    const shopName = (session?.user as any)?.shopName || t("common.appName");
    const cleanPhone = phone.replace(/\D/g, "");
    const message = encodeURIComponent(
      t("customers.whatsappGreeting", { name, shop: shopName, debt: formatNumber(debt, locale) })
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, "_blank");
  };

  const deleteCustomer = async (id: string, name: string) => {
    if (isMember && memberRole !== "admin") {
      toast.error(t("customers.noDeletePermission"));
      return;
    }

    toast(t("customers.deleteConfirm", { name }), {
      action: {
        label: t("customers.deleteConfirmAction"),
        onClick: async () => {
          try {
            const res = await fetch(`/api/customers/${id}`, {
              method: "DELETE",
            });

            if (res.ok) {
              toast.success(t("customers.deleteSuccess", { name }));
              fetchCustomers(session?.user?.id as string);
            } else {
              toast.error(t("customers.deleteFailed"));
            }
          } catch {
            toast.error(t("customers.deleteError"));
          }
        },
      },
      cancel: {
        label: t("customers.cancelAction"),
        onClick: () => {},
      },
    });
  };

  const fmt = (v: number) => formatNumber(v, locale);

  if (loading) {
    return (
      <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-base font-bold text-slate-800">{t("customers.loadingTitle")}</p>
          <p className="mt-1 text-xs text-slate-500">{t("customers.loadingDesc")}</p>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute end-0 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 start-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute start-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ee-[2rem] sm:rounded-ee-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 end-0 h-20 w-20 sm:h-32 sm:w-32 rounded-ss-[2rem] sm:rounded-ss-[4rem] bg-emerald-50" />

            <div className="relative flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">
                  {t("customers.badge")}
                </span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                  {t("customers.title")}
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  {t("customers.subtitle")}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row">
                {canExport && (
                  <button
                    onClick={exportCustomers}
                    className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-800 transition-all hover:-translate-y-1 hover:bg-slate-50"
                  >
                    {t("customers.exportButton")} <span className="ms-1 sm:ms-2">📥</span>
                  </button>
                )}
                <Link
                  href="/customers/new"
                  className={`inline-flex items-center justify-center rounded-xl sm:rounded-2xl px-5 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-bold transition-all ${
                    canAddCustomer
                      ? "bg-blue-600 text-white shadow-lg sm:shadow-xl shadow-blue-500/25 hover:-translate-y-1 hover:bg-blue-700"
                      : "cursor-not-allowed bg-slate-200 text-slate-400"
                  }`}
                  onClick={(e) => {
                    if (!canAdd) {
                      e.preventDefault();
                      toast.error(t("customers.noAddPermission"));
                      return;
                    }
                    if (!canAddCustomer) {
                      e.preventDefault();
                      toast.error(t("customers.limitToastError"));
                    }
                  }}
                >
                  {t("customers.addButton")} <span className="ms-1 sm:ms-2 text-lg sm:text-xl">+</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* PLAN ALERT */}
        {!canAdd ? (
          <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-amber-200 bg-amber-50 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🔒</span>
              <div>
                <p className="font-bold text-amber-800">{t("customers.viewOnlyTitle")}</p>
                <p className="mt-1 text-sm text-amber-700">{t("customers.viewOnlyDesc")}</p>
              </div>
            </div>
          </section>
        ) : !canAddCustomer ? (
          <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-red-200 bg-red-50 p-4 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm sm:text-base lg:text-lg font-bold text-red-700">{t("customers.limitReachedTitle")}</p>
                <p className="mt-1 text-xs sm:text-sm font-semibold text-red-600">{t("customers.limitReachedDesc")}</p>
              </div>
              <button
                onClick={() => router.push("/pricing/checkout?plan=basic")}
                className="rounded-xl sm:rounded-2xl bg-red-600 px-5 sm:px-8 py-3 sm:py-4 text-sm font-bold text-white shadow-lg shadow-red-500/20 transition-all hover:-translate-y-1 hover:bg-red-700 whitespace-nowrap"
              >
                {t("customers.upgradeNow")}
              </button>
            </div>
          </section>
        ) : null}

        {/* SUMMARY CARDS */}
        <section className="mb-5 sm:mb-8 grid gap-3 sm:gap-5 grid-cols-3">
          <div className="rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
            <div className="mb-2 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-lg sm:text-2xl">
              👥
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500">{t("customers.totalCustomers")}</p>
            <h2 className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black text-blue-700">
              {fmt(customers.length)}
            </h2>
          </div>

          <div className="rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
            <div className="mb-2 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-red-50 text-lg sm:text-2xl">
              💰
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">{t("customers.totalBalance")}</p>
            <h2 className="mt-1 sm:mt-2 text-base sm:text-3xl font-black text-red-700">
              <span className="block sm:inline">{fmt(totalDebt)}</span>
              <span className="text-xs sm:text-base font-bold"> {t("customers.riyal")}</span>
            </h2>
          </div>

          <div className="rounded-xl sm:rounded-[1.75rem] border border-slate-200 bg-white p-3 sm:p-6 shadow-sm">
            <div className="mb-2 sm:mb-4 flex h-8 w-8 sm:h-12 sm:w-12 items-center justify-center rounded-xl sm:rounded-2xl bg-emerald-50 text-lg sm:text-2xl">
              ✅
            </div>
            <p className="text-xs sm:text-sm font-bold text-slate-500 leading-tight">{t("customers.hasDebt")}</p>
            <h2 className="mt-1 sm:mt-2 text-xl sm:text-3xl font-black text-emerald-700">
              {fmt(debtCustomersCount)}
            </h2>
          </div>
        </section>

        {/* FILTERS */}
        <section className="mb-5 sm:mb-8 rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-3 sm:p-5 shadow-sm">
          <div className="grid gap-2 sm:gap-4 grid-cols-1 sm:grid-cols-[1fr_auto_auto]">
            <div className="relative">
              <input
                type="text"
                placeholder={t("customers.searchPlaceholder")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 py-3 sm:py-4 ps-10 sm:ps-12 pe-4 sm:pe-5 text-sm sm:text-base font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
              <span className="absolute start-3 sm:start-5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
            </div>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">{t("customers.filterAll")}</option>
              <option value="debt">{t("customers.filterDebt")}</option>
              <option value="no-debt">{t("customers.filterNoDebt")}</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortType)}
              className="rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-3 sm:px-5 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            >
              <option value="debt-desc">{t("customers.sortDebtDesc")}</option>
              <option value="name">{t("customers.sortName")}</option>
            </select>
          </div>

          <p className="mt-2 sm:mt-4 text-xs sm:text-sm font-semibold text-slate-500">
            {t("customers.showingCount", { shown: fmt(filteredAndSorted.length), total: fmt(customers.length) })}
          </p>
        </section>

        {/* TABLE */}
        <section className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          {filteredAndSorted.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-start text-xs sm:text-sm font-black text-slate-600">{t("customers.colCustomer")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-start text-xs sm:text-sm font-black text-slate-600">{t("customers.colPhone")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-center text-xs sm:text-sm font-black text-slate-600">{t("customers.colBalance")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-center text-xs sm:text-sm font-black text-slate-600">{t("customers.colStatus")}</th>
                      <th className="px-4 sm:px-6 py-4 sm:py-5 text-center text-xs sm:text-sm font-black text-slate-600">{t("customers.colActions")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSorted.map((customer) => (
                      <tr key={customer._id} className="border-t border-slate-100 transition hover:bg-blue-50/30">
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                          <Link href={`/customers/${customer._id}`} className="group flex items-center gap-2 sm:gap-3">
                            <span className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-sm sm:text-lg font-black text-blue-700">
                              {customer.name.charAt(0)}
                            </span>
                            <span className="font-bold text-slate-900 text-sm sm:text-base transition group-hover:text-blue-700">
                              {customer.name}
                            </span>
                          </Link>
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 font-semibold text-slate-600 text-sm sm:text-base" dir="ltr">
                          {customer.phone}
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                          <span className={`text-sm sm:text-lg font-black ${customer.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
                            {fmt(customer.totalDebt)} {t("customers.riyal")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5 text-center">
                          <span className={`inline-flex rounded-full px-2.5 sm:px-4 py-1 sm:py-2 text-xs font-black ${
                            customer.totalDebt > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                          }`}>
                            {customer.totalDebt > 0 ? t("customers.statusDebt") : t("customers.statusNoDebt")}
                          </span>
                        </td>
                        <td className="px-4 sm:px-6 py-4 sm:py-5">
                          <div className="flex justify-center gap-1.5 sm:gap-2">
                            <Link href={`/customers/${customer._id}`} className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-blue-50 text-sm sm:text-lg transition hover:bg-blue-100">👁️</Link>
                            <button onClick={() => openWhatsApp(customer.phone, customer.name, customer.totalDebt)} className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-emerald-50 text-sm sm:text-lg transition hover:bg-emerald-100">💬</button>
                            <button onClick={() => deleteCustomer(customer._id, customer.name)} className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-red-50 text-sm sm:text-lg transition hover:bg-red-100">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-slate-100">
                {filteredAndSorted.map((customer) => (
                  <div key={customer._id} className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      <Link href={`/customers/${customer._id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-base font-black text-blue-700">
                          {customer.name.charAt(0)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 text-sm truncate">{customer.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5" dir="ltr">{customer.phone}</p>
                        </div>
                      </Link>
                      <div className="text-end shrink-0">
                        <p className={`text-sm font-black ${customer.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}>
                          {fmt(customer.totalDebt)} {t("customers.riyal")}
                        </p>
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-black ${
                          customer.totalDebt > 0 ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"
                        }`}>
                          {customer.totalDebt > 0 ? t("customers.statusDebt") : t("customers.statusNoDebt")}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <Link href={`/customers/${customer._id}`} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition">
                        👁️ {t("customers.details")}
                      </Link>
                      <button onClick={() => openWhatsApp(customer.phone, customer.name, customer.totalDebt)} className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-50 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition">
                        💬 {t("customers.whatsapp")}
                      </button>
                      <button onClick={() => deleteCustomer(customer._id, customer.name)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-sm hover:bg-red-100 transition">
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="px-4 sm:px-6 py-12 sm:py-20 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl bg-slate-100 text-2xl sm:text-4xl">🔎</div>
              <h3 className="text-lg sm:text-2xl font-bold text-slate-900">{t("customers.noResultsTitle")}</h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {t("customers.noResultsDesc")}
              </p>
              <button
                onClick={() => { setSearchTerm(""); setFilterType("all"); setSortBy("debt-desc"); }}
                className="mt-5 rounded-xl sm:rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
              >
                {t("customers.resetSearch")}
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
