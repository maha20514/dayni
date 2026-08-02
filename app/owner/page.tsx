/* eslint-disable react-hooks/immutability */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getPermissions } from "@/lib/permissions";
import { toast } from "sonner";

type PlanType = "free" | "basic" | "pro";
type StatsType = {
  totalCustomers: number;
  totalDebt:      number;
  totalInvoices:  number;
  totalPayments:  number;
};

export default function StoreOwnerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isMember = (session?.user as any)?.isMember;

  const [shopName,      setShopName]      = useState("متجري");
  const [email,         setEmail]         = useState("");
  const [avatar,        setAvatar]        = useState<string | null>(null);
  const [plan,          setPlan]          = useState<PlanType>("free");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newShopName,   setNewShopName]   = useState("");
  const [savingName,    setSavingName]    = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword,   setCurrentPassword]   = useState("");
  const [newPassword,       setNewPassword]       = useState("");
  const [confirmPassword,   setConfirmPassword]   = useState("");
  const [savingPassword,    setSavingPassword]    = useState(false);
  const [avatarUploading,   setAvatarUploading]   = useState(false);
  const [stats,   setStats]   = useState<StatsType>({ totalCustomers: 0, totalDebt: 0, totalInvoices: 0, totalPayments: 0 });
  const [loading, setLoading] = useState(true);

  const permissions = getPermissions(plan);
  const canExport   = permissions.export;

  useEffect(() => {
    if (status === "loading") return;
    if (status !== "authenticated" || !session?.user?.id) { router.replace("/login"); return; }
    if (isMember) { router.replace("/dashboard"); return; }

    const u = session.user as any;
    setShopName(u.shopName || u.name || "متجري");
    setNewShopName(u.shopName || u.name || "متجري");
    setEmail(session.user.email || "");
    setAvatar(session.user.image || null);
    setPlan(u.plan || "free");
    fetchStats(session.user.id);
  }, [status, session?.user?.id]);

  const fetchStats = async (userId: string) => {
    try {
      const res  = await fetch("/api/customers", { credentials: "include" });
      const data = await res.json();
      if (!res.ok) { if (res.status === 401) { router.replace("/login"); } return; }
      const mine = Array.isArray(data) ? data.filter((c: any) => c.userId === userId || c.userId?.toString() === userId) : [];
      const totalDebt = mine.reduce((s: number, c: any) => s + Number(c.totalDebt || 0), 0);
      setStats({ totalCustomers: mine.length, totalDebt, totalInvoices: mine.length * 3, totalPayments: Math.floor(mine.length * 2) });
    } catch (err) { console.error("fetchStats error:", err); } finally { setLoading(false); }
  };

  const refreshSession = async () => {
    await fetch("/api/auth/refresh-session", { method: "POST", credentials: "include" });
    window.location.reload();
  };

  const saveShopName = async () => {
    if (!newShopName.trim()) { toast.error("يرجى إدخال اسم المتجر"); return; }
    setSavingName(true);
    try {
      const res  = await fetch("/api/users/updateShop", {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName: newShopName }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data.error || "فشل التحديث"); return; }
      setShopName(newShopName);
      setIsEditingName(false);
      toast.success("تم تحديث اسم المتجر");
      await refreshSession();
    } catch { toast.error("خطأ في الاتصال"); } finally { setSavingName(false); }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("الصورة يجب أن تكون أصغر من 500KB"); return; }
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      try {
        const res  = await fetch("/api/users/updateShop", {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ avatar: base64 }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setAvatar(base64);
        toast.success("تم تحديث الصورة");
        await refreshSession();
      } catch (err: any) { toast.error(err.message || "فشل رفع الصورة"); } finally { setAvatarUploading(false); }
    };
    reader.readAsDataURL(file);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) { toast.error("جميع الحقول مطلوبة"); return; }
    if (newPassword !== confirmPassword) { toast.error("كلمات المرور الجديدة غير متطابقة"); return; }
    if (newPassword.length < 6) { toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return; }
    setSavingPassword(true);
    try {
      const res  = await fetch("/api/auth/change-password", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success("تم تغيير كلمة المرور بنجاح");
      setShowPasswordModal(false);
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (err: any) { toast.error(err.message); } finally { setSavingPassword(false); }
  };

  const getPlanLabel   = () => plan === "pro" ? "الخطة الاحترافية" : plan === "basic" ? "الخطة الأساسية" : "الخطة المجانية";
  const getPlanClasses = () => plan === "pro" ? "bg-purple-50 text-purple-700 border-purple-200" : plan === "basic" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-emerald-50 text-emerald-700 border-emerald-200";

  if (status === "loading" || loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-6 sm:px-8 py-5 sm:py-6 text-center shadow-xl shadow-slate-200/70">
          <div className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm sm:text-lg font-bold text-slate-800">جاري التحميل...</p>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">يتم تجهيز إعدادات المتجر الآن</p>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-4 sm:py-6 lg:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-100/60 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

        {/* ── HEADER ── */}
        <section className="mb-4 sm:mb-6 lg:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-200/70">
          <div className="relative p-4 sm:p-6 lg:p-10">
            <div className="absolute left-0 top-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-br-[2rem] lg:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-16 w-16 sm:h-24 sm:w-24 lg:h-32 lg:w-32 rounded-tl-[2rem] lg:rounded-tl-[4rem] bg-emerald-50" />
            <div className="relative flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <span className="mb-2 sm:mb-3 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">
                  إعدادات المالك
                </span>
                <h1 className="text-xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight text-slate-950">
                  إدارة حساب المتجر
                </h1>
                <p className="mt-1 sm:mt-2 lg:mt-3 text-xs sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  عدّل بيانات المتجر، صورة الحساب، الخطة الحالية، وإعدادات الأمان.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex w-fit items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-4 text-xs sm:text-base font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700"
              >
                العودة للوحة التحكم <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-4 sm:gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr]">

          {/* ── STORE PROFILE ── */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-200/70">

            {/* Avatar + Name */}
            <div className="mb-5 sm:mb-6 lg:mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3 sm:gap-4 lg:gap-5">

                {/* Avatar */}
                <div className="relative shrink-0">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt="المالك"
                      className="h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 rounded-2xl sm:rounded-3xl border border-slate-200 object-cover shadow-lg"
                    />
                  ) : (
                    <div className="flex h-20 w-20 sm:h-24 sm:w-24 lg:h-28 lg:w-28 items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200 bg-slate-100 text-4xl sm:text-5xl shadow-lg">
                      👤
                    </div>
                  )}
                  <label className={`absolute -bottom-2 -right-2 flex h-9 w-9 sm:h-10 sm:w-10 lg:h-11 lg:w-11 cursor-pointer items-center justify-center rounded-xl sm:rounded-2xl border border-slate-200 bg-white text-lg sm:text-xl shadow-lg transition hover:bg-slate-50 ${avatarUploading ? "opacity-50 cursor-wait" : ""}`}>
                    {avatarUploading
                      ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                      : "📷"}
                    <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" disabled={avatarUploading} />
                  </label>
                </div>

                {/* Name + plan */}
                <div className="flex-1 min-w-0">
                  {!isEditingName ? (
                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-slate-950 break-all">
                        {shopName}
                      </h2>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="flex h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-blue-50 text-base sm:text-lg transition hover:bg-blue-100"
                      >
                        ✏️
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 sm:space-y-3">
                      <input
                        value={newShopName}
                        onChange={e => setNewShopName(e.target.value)}
                        className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3 lg:py-4 text-sm sm:text-base lg:text-lg font-bold outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                        placeholder="اسم المتجر"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={saveShopName}
                          disabled={savingName}
                          className="inline-flex items-center gap-1.5 rounded-lg sm:rounded-xl bg-blue-600 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
                        >
                          {savingName && <span className="h-3 w-3 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                          حفظ
                        </button>
                        <button
                          onClick={() => { setNewShopName(shopName); setIsEditingName(false); }}
                          className="rounded-lg sm:rounded-xl bg-slate-100 px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-200"
                        >
                          إلغاء
                        </button>
                      </div>
                    </div>
                  )}
                  <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm lg:text-base font-semibold text-slate-500 truncate">{email}</p>
                  <span className={`mt-2 sm:mt-3 lg:mt-4 inline-flex rounded-full border px-3 sm:px-4 py-1 sm:py-1.5 text-xs sm:text-sm font-bold ${getPlanClasses()}`}>
                    {getPlanLabel()}
                  </span>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4">
              {[
                { icon: "👥", label: "العملاء",        value: stats.totalCustomers.toLocaleString("ar-SA"),        color: "blue"    },
                { icon: "💰", label: "إجمالي الديون",  value: `${stats.totalDebt.toLocaleString("ar-SA")} ريال`,  color: "red"     },
                { icon: "🧾", label: "الفواتير",        value: stats.totalInvoices.toLocaleString("ar-SA"),         color: "amber"   },
                { icon: "✅", label: "الدفعات",         value: stats.totalPayments.toLocaleString("ar-SA"),         color: "emerald" },
              ].map(s => {
                const colorMap: any = {
                  blue:    "bg-blue-50 text-blue-700",
                  red:     "bg-red-50 text-red-700",
                  amber:   "bg-amber-50 text-amber-700",
                  emerald: "bg-emerald-50 text-emerald-700",
                };
                return (
                  <div key={s.label} className="rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:p-6">
                    <div className={`mb-2 sm:mb-3 lg:mb-4 flex h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl text-lg sm:text-xl lg:text-2xl ${colorMap[s.color]}`}>
                      {s.icon}
                    </div>
                    <p className="text-[10px] sm:text-xs lg:text-sm font-bold text-slate-500">{s.label}</p>
                    <h3 className={`mt-1 sm:mt-1.5 lg:mt-2 text-sm sm:text-lg lg:text-2xl xl:text-3xl font-black leading-tight ${colorMap[s.color].split(" ")[1]}`}>
                      {s.value}
                    </h3>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── ACCOUNT SETTINGS ── */}
          <div className="space-y-4 sm:space-y-5 lg:space-y-6">
            <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 lg:p-8 shadow-lg shadow-slate-200/70">
              <div className="mb-4 sm:mb-5 lg:mb-6">
                <h2 className="text-base sm:text-xl lg:text-2xl font-bold text-slate-950">إعدادات الحساب</h2>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-medium text-slate-500">
                  تحكم في أمان الحساب وبيانات المتجر
                </p>
              </div>

              <div className="space-y-2 sm:space-y-3">

                {/* Change password */}
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="flex w-full items-center justify-between rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:p-5 text-right transition hover:border-blue-200 hover:bg-blue-50/40"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-blue-50 text-lg sm:text-xl lg:text-2xl">🔑</div>
                    <div>
                      <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-900">تغيير كلمة المرور</p>
                      <p className="mt-0.5 hidden sm:block text-xs sm:text-sm font-medium text-slate-500">تحديث كلمة مرور حسابك</p>
                    </div>
                  </div>
                  <span className="text-slate-400 text-sm">←</span>
                </button>
                {/* Support Button */}
<Link
  href="/support"
  className="flex w-full items-center justify-between rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:p-5 text-right transition hover:border-emerald-200 hover:bg-emerald-50/40"
>
  <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
    <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-emerald-50 text-lg sm:text-xl lg:text-2xl">
      💬
    </div>
    <div>
      <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-900">الدعم الفني</p>
      <p className="mt-0.5 hidden sm:block text-xs sm:text-sm font-medium text-slate-500">
        تواصل مع فريق دَيني
      </p>
    </div>
  </div>
  <span className="text-slate-400 text-sm">←</span>
</Link>

                {/* Export */}
                {canExport ? (
                  <button
                    onClick={() => toast.info("جاري تصدير البيانات...")}
                    className="flex w-full items-center justify-between rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:p-5 text-right transition hover:border-emerald-200 hover:bg-emerald-50/40"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-emerald-50 text-lg sm:text-xl lg:text-2xl">📤</div>
                      <div>
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-900">تصدير بيانات المتجر</p>
                        <p className="mt-0.5 hidden sm:block text-xs sm:text-sm font-medium text-slate-500">Excel + PDF</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">←</span>
                  </button>
                ) : <div className="relative group">
  <button
    className="flex w-full items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-5 text-right transition hover:border-amber-200 hover:bg-amber-50/40"
  >
    <div className="flex items-center gap-4">
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-2xl">
        📤

        {/* Lock */}
        <div className="absolute -right-1 -top-1 text-sm">
          🔒
        </div>
      </div>

      <div>
        <p className="font-bold text-slate-900">
          تصدير بيانات المتجر
        </p>

        <p className="mt-1 text-sm font-medium text-slate-500">
          Excel + PDF
        </p>
      </div>
    </div>

    <span className="text-slate-400">←</span>
  </button>

  {/* Tooltip */}
  <div className="pointer-events-none absolute right-1/2 top-full z-50 mt-3 w-72 translate-x-1/2 scale-95 rounded-3xl border border-slate-200 bg-white p-5 text-center opacity-0 shadow-2xl transition-all duration-200 group-hover:pointer-events-auto group-hover:scale-100 group-hover:opacity-100">

    <p className="mb-1 text-lg font-black text-slate-900">
      🔒 ميزة احترافية
    </p>

    <p className="mb-5 text-sm leading-7 text-slate-500">
      التصدير متاح في الباقة الاحترافية
    </p>

    <Link
      href="/pricing"
      className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-700"
    >
      ترقية الباقة
    </Link>

    {/* Arrow */}
    <div className="absolute -top-2 right-1/2 h-4 w-4 translate-x-1/2 rotate-45 border-l border-t border-slate-200 bg-white" />
  </div>
</div>}

                

                {/* Billing */}
                {plan !== "free" && (
                  <Link
                    href="/settings/billing"
                    className="flex w-full items-center justify-between rounded-xl sm:rounded-2xl lg:rounded-3xl border border-slate-200 bg-slate-50 p-3 sm:p-4 lg:p-5 text-right transition hover:border-purple-200 hover:bg-purple-50/40"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3 lg:gap-4">
                      <div className="flex h-9 w-9 sm:h-10 sm:w-10 lg:h-12 lg:w-12 items-center justify-center rounded-lg sm:rounded-xl lg:rounded-2xl bg-purple-50 text-lg sm:text-xl lg:text-2xl">💳</div>
                      <div>
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-900">إدارة الاشتراك والفواتير</p>
                        <p className="mt-0.5 hidden sm:block text-xs sm:text-sm font-medium text-slate-500">تغيير البطاقة، إلغاء الاشتراك</p>
                      </div>
                    </div>
                    <span className="text-slate-400 text-sm">←</span>
                  </Link>
                )}
              </div>
            </div>

            {/* Plan card */}
            <div className="overflow-hidden rounded-2xl sm:rounded-[2rem] border border-blue-200 bg-blue-50 p-4 sm:p-5 lg:p-6 shadow-sm">
              <h3 className="text-sm sm:text-base lg:text-xl font-bold text-blue-800">
                خطتك الحالية: {getPlanLabel()}
              </h3>
              <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold leading-relaxed text-blue-700">
                يمكنك ترقية خطتك للحصول على عملاء غير محدودين، تصدير البيانات، وتقارير أكثر تقدماً.
              </p>
              <Link
                href="/pricing"
                className="mt-3 sm:mt-4 lg:mt-5 inline-flex rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-6 py-2.5 sm:py-3 lg:py-4 text-xs sm:text-sm lg:text-base font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-1 hover:bg-blue-700"
              >
                عرض الخطط <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* ── PASSWORD MODAL ── */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm sm:max-w-md rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-5 sm:p-6 lg:p-8 shadow-2xl">
            <div className="mb-5 sm:mb-6 lg:mb-8 text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">🔑</div>
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-950">تغيير كلمة المرور</h3>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-slate-500">اختر كلمة مرور قوية لحماية حسابك</p>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {[
                { placeholder: "كلمة المرور الحالية",  value: currentPassword, setter: setCurrentPassword },
                { placeholder: "كلمة المرور الجديدة",  value: newPassword,     setter: setNewPassword     },
                { placeholder: "تأكيد كلمة المرور",    value: confirmPassword, setter: setConfirmPassword  },
              ].map(f => (
                <input
                  key={f.placeholder}
                  type="password"
                  placeholder={f.placeholder}
                  value={f.value}
                  onChange={e => f.setter(e.target.value)}
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 sm:py-3.5 lg:py-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              ))}
            </div>

            <div className="mt-5 sm:mt-6 lg:mt-8 grid grid-cols-2 gap-2 sm:gap-3">
              <button
                onClick={handleChangePassword}
                disabled={savingPassword}
                className="inline-flex items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-blue-600 px-4 py-3 sm:py-3.5 lg:py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {savingPassword && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                حفظ
              </button>
              <button
                onClick={() => { setShowPasswordModal(false); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}
                className="rounded-xl sm:rounded-2xl bg-slate-100 px-4 py-3 sm:py-3.5 lg:py-4 text-sm font-bold text-slate-700 transition hover:bg-slate-200"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}