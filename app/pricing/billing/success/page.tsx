/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useTranslation } from "@/lib/i18n/LanguageContext";

export default function SuccessPage() {
  const { data: session } = useSession();
  const { t, dir } = useTranslation();
  const [attempts, setAttempts] = useState(0);
  const [message,  setMessage]  = useState(t("billingSuccess.checking"));

  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        const res  = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        if (data.plan && data.plan !== (session?.user as any)?.plan) {
          setMessage(t("billingSuccess.activated"));

          await signIn("credentials", {
            redirect: false,
          }).catch(() => {});

          await fetch("/api/auth/refresh-session", {
            method: "POST",
            credentials: "include",
          });

          setMessage(t("billingSuccess.redirecting"));
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 500);
          return;
        }

        if (attempts < 15) {
          setAttempts(prev => prev + 1);
        } else {
          window.location.href = "/dashboard";
        }
      } catch {
        if (attempts < 15) setAttempts(prev => prev + 1);
        else window.location.href = "/dashboard";
      }
    };

    const timer = setTimeout(checkAndRefresh, 2000);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempts, session]);

  const progress = Math.min(100, (attempts / 15) * 100);

  return (
    <main dir={dir} className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-3xl border border-slate-200 bg-white px-10 py-8 text-center shadow-xl">
        <div className="mb-4 text-6xl">🎉</div>
        <h1 className="text-2xl font-black text-slate-900">{t("billingSuccess.title")}</h1>
        <p className="mt-2 text-slate-500">{message}</p>
        <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </main>
  );
}
