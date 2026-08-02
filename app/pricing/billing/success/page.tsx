/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

export default function SuccessPage() {
  const { data: session } = useSession();
  const [attempts, setAttempts] = useState(0);
  const [message,  setMessage]  = useState("جاري التحقق من الاشتراك...");

  useEffect(() => {
    const checkAndRefresh = async () => {
      try {
        // 1️⃣ تحقق من MongoDB مباشرة
        const res  = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await res.json();

        console.log("🔍 DB plan:", data.plan, "| Session plan:", (session?.user as any)?.plan);

        if (data.plan && data.plan !== (session?.user as any)?.plan) {
          setMessage("تم التفعيل! جاري تحديث الجلسة...");

          // 2️⃣ أجبر NextAuth على إعادة بناء الـ token كاملاً
          await signIn("credentials", {
            redirect: false,
            // هذا سيفشل لكنه سيجدد الـ session check
          }).catch(() => {});

          // 3️⃣ الحل الأضمن — حدّث الـ cookie مباشرة عبر API
          await fetch("/api/auth/refresh-session", {
            method: "POST",
            credentials: "include",
          });

          setMessage("تم التفعيل! جاري التوجيه...");
          setTimeout(() => {
            window.location.href = "/dashboard"; // hard refresh بدل router.push
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
  }, [attempts, session]);

  const progress = Math.min(100, (attempts / 15) * 100);

  return (
    <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="rounded-3xl border border-slate-200 bg-white px-10 py-8 text-center shadow-xl">
        <div className="mb-4 text-6xl">🎉</div>
        <h1 className="text-2xl font-black text-slate-900">تم الاشتراك بنجاح!</h1>
        <p className="mt-2 text-slate-500">{message}</p>
        <div className="mx-auto mt-6 h-2 w-48 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </main>
  );
}