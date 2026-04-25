/* eslint-disable react-hooks/set-state-in-effect */

"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [shopName, setShopName] = useState("متجري");
  const [plan, setPlan] = useState("free");
  const [avatar, setAvatar] = useState("/default-avatar.png");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const storedShopName = localStorage.getItem("shopName") || "متجري";
    const storedPlan = localStorage.getItem("plan") || "free";
    const storedAvatar = localStorage.getItem("avatar") || "/default-avatar.png";

    setShopName(storedShopName);
    setPlan(storedPlan);
    setAvatar(storedAvatar);
    setIsLoaded(true);
  }, []);

  // إخفاء الـ Navbar في صفحات الدخول والتسجيل
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const handleLogout = () => {
    if (confirm("هل أنت متأكد من تسجيل الخروج؟")) {
      localStorage.clear();
      router.push("/login");
    }
  };

  const getPlanColor = () => {
    if (plan === "pro") return "bg-purple-100 text-purple-700";
    if (plan === "basic") return "bg-blue-100 text-blue-700";
    return "bg-emerald-100 text-emerald-700";
  };

  const getPlanText = () => {
    if (plan === "pro") return "احترافي";
    if (plan === "basic") return "أساسي";
    return "مجاني";
  };

  if (!isLoaded) return null;

  
  const goToOwner = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      router.push(`/owner/${userId}`);
    } else {
      router.push("/login");
    }
  };

  return (
    <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-6 py-5">
        <div className="flex justify-between items-center">
          {/* الجانب الأيسر: اللوجو + اسم المتجر */}
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center text-3xl font-bold">
              د
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{shopName}</h1>
              <p className="text-xs text-slate-500 -mt-1">نظام إدارة الديون</p>
            </div>
          </div>

          {/* الروابط الوسط */}
          <nav className="flex items-center gap-10 text-lg font-medium">
            <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
              الرئيسية
            </Link>
            <Link href="/customers" className="hover:text-blue-600 transition-colors">
              العملاء
            </Link>
            <Link href="/reports" className="hover:text-blue-600 transition-colors">
              التقارير
            </Link>
          </nav>

          {/* الجانب الأيمن: صورة المالك + الخطة + تسجيل الخروج */}
          <div className="flex items-center gap-6">
            {/* الخطة */}
            <div className={`px-4 py-1.5 rounded-2xl text-sm font-medium ${getPlanColor()}`}>
              {getPlanText()}
            </div>

            {/* صورة المالك + اسم المتجر */}
            <div 
              onClick={goToOwner}
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-100 px-4 py-2 rounded-2xl transition"
            >
              <Image 
                src={avatar} 
                alt="المالك" 
                className="w-9 h-9 object-cover rounded-2xl border border-slate-200" 
                width={36}
                height={36}
              />
              <div className="text-right">
                <p className="font-semibold text-slate-800 text-sm">المالك</p>
                <p className="text-xs text-slate-500">مدير المتجر</p>
              </div>
            </div>

            {/* زر تسجيل الخروج */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-6 py-3 rounded-2xl font-medium transition-all active:scale-95"
            >
              تسجيل الخروج
              <span className="text-xl">↩︎</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

 