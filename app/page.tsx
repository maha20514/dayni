"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export default function RootRedirect() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    if (status === "unauthenticated") {
      router.replace("/home");
      return;
    }

    if (status === "authenticated") {
      // تحقق أن المستخدم لا يزال موجوداً في DB
      const verifyUser = async () => {
        try {
          const res = await fetch("/api/auth/me");

          if (res.status === 401 || res.status === 404) {
            // المستخدم محذوف — سجّل خروج وأعد توجيه
            await signOut({ redirect: false });
            router.replace("/login");
            return;
          }

          router.replace("/dashboard");
        } catch {
          router.replace("/home");
        }
      };

      verifyUser();
    }
  }, [status, router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-600 font-medium">جاري التحقق...</p>
      </div>
    </div>
  );
}