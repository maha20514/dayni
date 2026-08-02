/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { hasFeature } from "@/lib/permissions";
import { toast } from "sonner";

type PlanType = "free" | "basic" | "pro";

type Notification = {
  _id: string;
  title: string;
  message: string;
  type?: "info" | "success" | "warning" | "error";
  isRead: boolean;
  createdAt: string;
  customerId?: string;
};

const hiddenPaths = ["/login", "/register"];

export default function Navbar() {
  const pathname    = usePathname();
  const router      = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [shopName, setShopName] = useState("متجري");
  const [plan,     setPlan]     = useState<PlanType>("free");
  const [avatar,   setAvatar]   = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [notifications,      setNotifications]      = useState<Notification[]>([]);
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications,  setShowNotifications]  = useState(false);

  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated" && !!session?.user?.id;
  const canUseNotifications = hasFeature(plan, "notifications");

  const navLinks = [
    { href: "/dashboard", label: "الرئيسية" },
    { href: "/customers", label: "العملاء" },
    { href: "/suppliers",  label: "الموردون" },
    { href: "/reports",   label: "التقارير" },
    { href: "/pricing",   label: "الخطط" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session) { setIsLoaded(true); return; }
    setShopName((session.user as any)?.shopName || session.user?.name || "متجري");
    setAvatar(session.user?.image || null);
    setPlan(((session.user as any)?.plan || "free") as PlanType);
    setIsLoaded(true);
  }, [session, status]);

  useEffect(() => {
    if (!isAuthenticated || !canUseNotifications) return;
    const fetchNotifications = async () => {
      try {
        const res = await fetch(`/api/notifications`, { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setNotifications(data.notifications || []);
        setNotificationsCount(
          (data.notifications || []).filter((n: Notification) => !n.isRead).length
        );
      } catch (err) { console.error("Failed to fetch notifications:", err); }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [session, isAuthenticated, canUseNotifications]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowNotifications(false);
  }, [pathname]);

  if (hiddenPaths.includes(pathname)) return null;
  if (!isLoaded) return null;

 const handleLogout = async () => {
  toast("هل أنت متأكد من تسجيل الخروج؟", {
    action: {
      label: "تسجيل الخروج",
      onClick: async () => {
        sessionStorage.clear();

        await signOut({ redirect: false });

        router.push("/home");
      },
    },

    cancel: {
      label: "إلغاء",
      onClick: () => {},
    },
  });
};

  const goToOwner = () => {
    const isMember = (session?.user as any)?.isMember;
    if (isMember) return;
    router.push("/owner");
  };

  const getPlanColor = () => {
    if (plan === "pro")   return "border-purple-200 bg-purple-50 text-purple-700";
    if (plan === "basic") return "border-blue-200 bg-blue-50 text-blue-700";
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  };

  const getPlanText = () => {
    if (plan === "pro")   return "احترافي";
    if (plan === "basic") return "أساسي";
    return "مجاني";
  };

  const isActiveLink = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const formatTime = (date: string) =>
    new Intl.DateTimeFormat("ar-SA", { hour: "numeric", minute: "numeric" }).format(new Date(date));

  const markAsRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ notificationIds: [id] }),
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      setNotificationsCount(prev => Math.max(0, prev - 1));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ markAll: true }),
      });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setNotificationsCount(0);
      setShowNotifications(false);
    } catch (err) { console.error(err); }
  };

  // ════════════════════════════════════════
  // GUEST NAVBAR
  // ════════════════════════════════════════
  if (!isAuthenticated) {
    return (
      <header dir="rtl" className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="container mx-auto px-4 sm:px-6 lg:px-12">
          <div className="flex min-h-[64px] sm:min-h-[72px] items-center justify-between gap-3">
            <Link href="/home" className="flex items-center gap-2 sm:gap-3">
              <Image src="/logo.png" alt="دَيني" width={80} height={80} className="h-14 sm:h-16 lg:h-20 w-auto object-contain" priority />
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-950">دَيني</h1>
                <p className="-mt-0.5 text-[10px] sm:text-xs font-semibold text-slate-500">نظام إدارة الديون</p>
              </div>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link href="/login" className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 transition hover:bg-slate-50">
                تسجيل الدخول
              </Link>
              <Link href="/register" className="rounded-xl sm:rounded-2xl bg-blue-600 px-3 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:-translate-y-0.5 hover:bg-blue-700">
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </header>
    );
  }

  // ════════════════════════════════════════
  // AUTH NAVBAR
  // ════════════════════════════════════════
  return (
    <header dir="rtl" className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl">
      <div className="container mx-auto px-3 sm:px-6 lg:px-12">

        {/* ── Main row ── */}
        <div className="flex min-h-[64px] sm:min-h-[72px] lg:min-h-[80px] items-center justify-between gap-2 sm:gap-4">

          {/* Logo */}
          <Link href="/dashboard" className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Image src="/icon.png" alt="دَيني" width={60} height={60} className="h-10 sm:h-12 lg:h-14 w-auto object-contain" priority />
            <div className="hidden sm:block">
              <h1 className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-950 leading-none">{shopName}</h1>
              <p className="mt-0.5 text-[10px] sm:text-xs font-semibold text-slate-500">نظام إدارة الديون</p>
              {(session?.user as any)?.isMember && (
                <span className="mt-0.5 inline-flex rounded-full bg-purple-100 px-2 py-0.5 text-[9px] font-black text-purple-700">عضو فريق</span>
              )}
            </div>
            <div className="block sm:hidden">
              <h1 className="text-sm font-black tracking-tight text-slate-950 leading-none max-w-[90px] truncate">{shopName}</h1>
              {(session?.user as any)?.isMember && (
                <span className="mt-0.5 inline-flex rounded-full bg-purple-100 px-1.5 py-0.5 text-[8px] font-black text-purple-700">عضو</span>
              )}
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <nav className="hidden items-center gap-1 rounded-2xl border border-slate-200 bg-slate-50 p-1 lg:flex print:hidden">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${isActiveLink(link.href) ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white hover:text-blue-700"}`}>
                {link.label}
              </Link>
            ))}

            {/* الفريق */}
            {!((session?.user as any)?.isMember) && (
              plan === "pro" ? (
                <Link href="/team" className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${isActiveLink("/team") ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white hover:text-blue-700"}`}>
                  الفريق
                </Link>
              ) : (
                <div className="group relative">
                  <button disabled className="flex cursor-not-allowed items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 opacity-60">🔒 الفريق</button>
                  <div className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 w-48 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-center opacity-0 shadow-xl transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                    <p className="text-xs font-bold text-slate-800">🔒 ميزة احترافية</p>
                    <p className="mt-1 text-[10px] text-slate-500">الفريق متاح في الباقة الاحترافية</p>
                    <Link href="/pricing" className="pointer-events-auto mt-2 inline-block rounded-xl bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700">ترقية الباقة</Link>
                  </div>
                </div>
              )
            )}

            {/* التذكيرات */}
            {!((session?.user as any)?.isMember) && (
              plan === "pro" ? (
                <Link href="/notifications/reminders" className={`rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${isActiveLink("/notifications/reminders") ? "bg-white text-blue-700 shadow-sm" : "text-slate-600 hover:bg-white hover:text-blue-700"}`}>
                  التذكيرات
                </Link>
              ) : (
                <div className="group relative">
                  <button disabled className="flex cursor-not-allowed items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-400 opacity-60">🔒 التذكيرات</button>
                  <div className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 w-48 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-center opacity-0 shadow-xl transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                    <p className="text-xs font-bold text-slate-800">🔒 ميزة احترافية</p>
                    <p className="mt-1 text-[10px] text-slate-500">التذكيرات متاحة في الباقة الاحترافية</p>
                    <Link href="/pricing" className="pointer-events-auto mt-2 inline-block rounded-xl bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700">ترقية الباقة</Link>
                  </div>
                </div>
              )
            )}
          </nav>

          {/* ── Desktop Right Controls ── */}
          <div className="hidden items-center gap-2 lg:flex">

            {/* Notifications */}
            {canUseNotifications ? (
              <div className="relative" ref={dropdownRef}>
                <button onClick={() => setShowNotifications(prev => !prev)} className="relative flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl transition-all hover:bg-slate-50">
                  🔔
                  {notificationsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                      {notificationsCount > 9 ? "9+" : notificationsCount}
                    </span>
                  )}
                </button>
                {showNotifications && (
                  <div className="absolute left-1/2 top-[calc(100%+10px)] z-50 w-80 xl:w-96 -translate-x-1/2 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl">
                    <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">
                      <p className="text-base font-bold text-slate-900">الإشعارات</p>
                      {notificationsCount > 0 && (
                        <button onClick={markAllAsRead} className="text-sm font-medium text-blue-600 transition hover:text-blue-700">تحديد الكل كمقروء</button>
                      )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                      {notifications.length > 0 ? notifications.map((notif) => (
                        <div key={notif._id} onClick={() => markAsRead(notif._id)} className={`cursor-pointer border-b p-4 transition last:border-b-0 hover:bg-slate-50 ${!notif.isRead ? "bg-blue-50/60" : ""}`}>
                          <div className="flex gap-3">
                            <div className="mt-0.5 text-xl shrink-0">
                              {notif.type === "success" && "✅"}{notif.type === "warning" && "⚠️"}{notif.type === "error" && "❌"}{(!notif.type || notif.type === "info") && "📌"}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold leading-tight text-slate-900 text-sm">{notif.title}</p>
                              <p className="mt-1 text-xs leading-relaxed text-slate-600">{notif.message}</p>
                              <p className="mt-2 text-[10px] text-slate-400">{formatTime(notif.createdAt)}</p>
                            </div>
                            {!notif.isRead && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                          </div>
                        </div>
                      )) : (
                        <div className="py-12 text-center">
                          <div className="mb-3 text-4xl">🔔</div>
                          <p className="text-slate-500 text-sm">لا توجد إشعارات حالياً</p>
                        </div>
                      )}
                    </div>
                    <div className="border-t bg-slate-50 p-3">
                      <button onClick={() => { setShowNotifications(false); router.push("/notifications"); }} className="w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                        عرض كل الإشعارات
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="group relative">
                <button disabled className="relative flex h-10 w-10 cursor-not-allowed items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl opacity-50">
                  🔔
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-400 text-[9px] font-bold text-white ring-2 ring-white">🔒</span>
                </button>
                <div className="pointer-events-none absolute left-1/2 top-[calc(100%+8px)] z-50 w-48 -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 text-center opacity-0 shadow-xl transition-opacity group-hover:pointer-events-auto group-hover:opacity-100">
                  <p className="text-xs font-bold text-slate-800">🔒 ميزة احترافية</p>
                  <p className="mt-1 text-[10px] text-slate-500">الإشعارات متاحة في الباقة الاحترافية</p>
                  <Link href="/pricing" className="pointer-events-auto mt-2 inline-block rounded-xl bg-blue-600 px-3 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700">ترقية الباقة</Link>
                </div>
              </div>
            )}

            {/* Plan badge */}
            <div className={`rounded-2xl border px-3 py-2 text-xs font-black ${getPlanColor()}`}>
              الباقة: {getPlanText()}
            </div>

            {/* Owner button */}
            <button type="button" onClick={goToOwner} className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition-all hover:bg-slate-50 hover:shadow-md">
              {avatar ? (
                <Image src={avatar} alt="المالك" className="h-11 w-11 rounded-xl border border-slate-200 object-cover" width={44} height={44} />
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-base">👤</div>
              )}
              <div className="text-right">
                <p className="text-xs font-black text-slate-900 leading-none">المالك</p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">مدير المتجر</p>
              </div>
            </button>

            {/* Logout */}
            <button onClick={handleLogout} className="inline-flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 px-4 py-2.5 text-sm font-black text-red-600 transition-all hover:bg-red-100 active:scale-95">
              تسجيل خروج <span className="text-base">↩︎</span>
            </button>
          </div>

          {/* ── Mobile/Tablet: hamburger only ── */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(prev => !prev)}
              className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-black text-slate-900 shadow-sm transition hover:bg-slate-50"
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? "×" : "☰"}
            </button>
          </div>

        </div>

        {/* ════════════════════════════════════
            DRAWER
        ════════════════════════════════════ */}
        {isMobileMenuOpen && (
          <div className="border-t border-slate-100 pb-4 pt-3 lg:hidden">

            {/* ① Profile + Plan */}
            <button
              type="button"
              onClick={() => { setIsMobileMenuOpen(false); goToOwner(); }}
              className="mb-3 flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-right transition hover:bg-slate-100"
            >
              {avatar ? (
                <Image src={avatar} alt="المالك" className="h-10 w-10 rounded-xl border border-slate-200 object-cover shrink-0" width={40} height={40} />
              ) : (
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-lg">👤</div>
              )}
              <div className="flex-1">
                <p className="text-sm font-black text-slate-900 leading-none">{shopName}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-500">مدير المتجر</p>
                {(session?.user as any)?.isMember && (
                  <span className="mt-0.5 inline-flex rounded-full bg-purple-100 px-1.5 py-0.5 text-[8px] font-black text-purple-700">عضو فريق</span>
                )}
              </div>
              <div className={`shrink-0 rounded-xl border px-2.5 py-1.5 text-xs font-black ${getPlanColor()}`}>
                {getPlanText()}
              </div>
            </button>

            {/* ② Nav links grid — 3 columns */}
            <div className="mb-3 grid grid-cols-3 gap-1.5">
              {/* الروابط الأساسية */}
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl py-3 text-center text-xs font-bold transition-all ${
                    isActiveLink(link.href)
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* الفريق */}
              {!((session?.user as any)?.isMember) && (
                plan === "pro" ? (
                  <Link href="/team" className={`rounded-xl py-3 text-center text-xs font-bold transition-all ${isActiveLink("/team") ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                    الفريق
                  </Link>
                ) : (
                  <Link href="/pricing" className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-slate-50 py-3 text-center text-xs font-bold text-slate-400 hover:bg-slate-100">
                    <span>🔒</span><span>الفريق</span>
                  </Link>
                )
              )}

              {/* التذكيرات */}
              {!((session?.user as any)?.isMember) && (
                plan === "pro" ? (
                  <Link href="/notifications/reminders" className={`rounded-xl py-3 text-center text-xs font-bold transition-all ${isActiveLink("/notifications/reminders") ? "bg-blue-600 text-white shadow-sm" : "bg-slate-50 text-slate-600 hover:bg-slate-100"}`}>
                    التذكيرات
                  </Link>
                ) : (
                  <Link href="/pricing" className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-slate-50 py-3 text-center text-xs font-bold text-slate-400 hover:bg-slate-100">
                    <span>🔒</span><span>التذكيرات</span>
                  </Link>
                )
              )}

              {/* الإشعارات */}
              {!((session?.user as any)?.isMember) && (
                plan === "pro" ? (
                  <Link
                    href="/notifications"
                    className={`relative rounded-xl py-3 text-center text-xs font-bold transition-all ${
                      isActiveLink("/notifications") && !isActiveLink("/notifications/reminders")
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    الإشعارات
                    {notificationsCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-1 ring-white">
                        {notificationsCount > 9 ? "9+" : notificationsCount}
                      </span>
                    )}
                  </Link>
                ) : (
                  <Link href="/pricing" className="flex flex-col items-center justify-center gap-0.5 rounded-xl bg-slate-50 py-3 text-center text-xs font-bold text-slate-400 hover:bg-slate-100">
                    <span>🔒</span><span>الإشعارات</span>
                  </Link>
                )
              )}
            </div>

            {/* ③ Logout */}
            <button
              onClick={handleLogout}
              className="w-full rounded-xl bg-red-50 py-3 text-sm font-black text-red-600 transition hover:bg-red-100 active:scale-[0.98]"
            >
              تسجيل الخروج ↩︎
            </button>

          </div>
        )}

      </div>
    </header>
  );
}