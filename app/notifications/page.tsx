/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { hasFeature } from "@/lib/permissions";
import Link from "next/link";
import { useTranslation } from "@/lib/i18n/LanguageContext";

type NotificationType = {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const { t, dir, locale } = useTranslation();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [loading, setLoading] = useState(true);

  const userId = session?.user?.id;
  const plan = (session?.user as any)?.plan || "free";
  const canUseNotifications = hasFeature(plan, "notifications");

  const fetchNotifications = async () => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/notifications`, { credentials: "include" });
      const data = await res.json();
      if (Array.isArray(data)) setNotifications(data);
      else if (Array.isArray(data.notifications)) setNotifications(data.notifications);
      else setNotifications([]);
    } catch (err) { console.error(err); setNotifications([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, [userId]);

  const markAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PATCH", credentials: "include" });
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) { console.error(err); }
  };

  const markAllAsRead = async () => {
    try {
      await fetch(`/api/notifications`, { method: "PATCH", headers: { "Content-Type": "application/json" }, credentials: "include", body: JSON.stringify({ markAll: true }) });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) { console.error(err); }
  };

  const deleteNotification = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE", credentials: "include" });
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div dir={dir} className="flex min-h-screen items-center justify-center px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-bold text-slate-700">{t("notifications.loadingTitle")}</p>
        </div>
      </div>
    );
  }

  if (!canUseNotifications) {
    return (
      <main dir={dir} className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6">
        <div className="text-center max-w-sm sm:max-w-md">
          <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🔒</div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">{t("notifications.lockedTitle")}</h2>
          <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
            {t("notifications.lockedDesc")}
          </p>
          <Link href="/pricing" className="inline-flex items-center gap-2 rounded-xl sm:rounded-2xl bg-blue-600 px-5 sm:px-6 py-3 text-sm sm:text-base text-white font-bold hover:bg-blue-700 transition">
            {t("notifications.upgradeToPro")}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-slate-50 p-3 sm:p-6">
      <div className="mx-auto max-w-4xl">

        {/* HEADER */}
        <div className="mb-5 sm:mb-8 flex items-center justify-between gap-3">
          <h1 className="text-xl sm:text-3xl font-bold">{t("notifications.title")} 🔔</h1>
          {notifications.some((n) => !n.isRead) && (
            <button
              onClick={markAllAsRead}
              className="rounded-lg sm:rounded-xl bg-blue-600 px-3 sm:px-5 py-2 text-xs sm:text-base text-white font-bold hover:bg-blue-700 whitespace-nowrap"
            >
              {t("notifications.markAll")}
            </button>
          )}
        </div>

        {/* EMPTY */}
        {notifications.length === 0 && (
          <div className="rounded-2xl sm:rounded-3xl border border-dashed bg-white p-8 sm:p-10 text-center">
            <div className="mb-3 text-4xl sm:text-5xl">🎉</div>
            <p className="text-sm sm:text-base font-bold text-slate-700">{t("notifications.empty")}</p>
          </div>
        )}

        {/* LIST */}
        <div className="space-y-3 sm:space-y-4">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`rounded-xl sm:rounded-2xl border p-3 sm:p-5 transition ${n.isRead ? "bg-white border-slate-200" : "bg-blue-50 border-blue-200"}`}
            >
              <div className="flex items-start justify-between gap-3 sm:gap-4">
                <div className="flex gap-2 sm:gap-4 min-w-0 flex-1">
                  <div className="text-xl sm:text-3xl shrink-0">
                    {n.type === "invoice" ? "💰" : n.type === "payment" ? "✅" : "🔔"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm sm:text-lg font-bold">{n.title}</p>
                    <p className="text-xs sm:text-base text-slate-600 mt-0.5 sm:mt-1">{n.message}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-1 sm:mt-2">
                      {new Date(n.createdAt).toLocaleString(locale === "ar" ? "ar-SA" : "en-US")}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 sm:gap-2 shrink-0">
                  {!n.isRead && (
                    <button onClick={() => markAsRead(n._id)} className="text-[10px] sm:text-sm text-blue-600 hover:underline whitespace-nowrap">
                      {t("notifications.read")}
                    </button>
                  )}
                  <button onClick={() => deleteNotification(n._id)} className="text-[10px] sm:text-sm text-red-600 hover:underline">
                    {t("notifications.delete")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
