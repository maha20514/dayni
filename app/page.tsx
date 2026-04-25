"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function RootRedirect() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (userId) {
      // المستخدم مسجل دخول → يروح للداشبورد
      router.replace("/dashboard");
    } else {
      // غير مسجل → يروح لصفحة الهوم
      router.replace("/home");
    }
  }, [router]);

  // شاشة تحميل أثناء التحقق
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-slate-600 font-medium">جاري التحقق...</p>
      </div>
    </div>
  );
}