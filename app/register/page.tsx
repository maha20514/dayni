"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("shopName", data.shopName);
        localStorage.setItem("email", data.email);

        router.push("/dashboard");
      } else {
        setError(data.error || "حدث خطأ أثناء التسجيل");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-6 overflow-hidden relative">
      {/* خلفية متحركة خفيفة */}
      <div className="absolute inset-0 bg-[radial-gradient(at_center,#4f46e520_0%,transparent_70%)] animate-pulse" />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* الجزء العلوي الفخم */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 px-10 py-14 text-center relative">
            <div className="mx-auto w-24 h-24 bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center mb-6 shadow-inner">
              🛍️
            </div>
            
            <h1 className="text-white text-4xl font-bold tracking-tight">
              إنشاء متجر جديد
            </h1>
            <p className="text-blue-100 mt-3 text-lg">
              ابدأ إدارة مبيعاتك وديونك بكل سهولة
            </p>
          </div>

          {/* النموذج */}
          <div className="p-10">
            <form onSubmit={handleRegister} className="space-y-7">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">اسم المتجر</label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-lg"
                  placeholder="مثال: متجر الرياض الكبير"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-lg"
                  placeholder="example@shop.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 border border-slate-200 rounded-2xl focus:outline-none focus:border-indigo-500 transition-all text-lg"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-violet-700 text-white py-4 rounded-2xl font-semibold text-lg transition-all disabled:opacity-70 shadow-lg mt-6"
              >
                {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب جديد"}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-slate-600">
                لديك حساب بالفعل؟{" "}
                <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                  تسجيل الدخول
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          © 2026 دَيني - نظام إدارة الديون الذكي
        </p>
      </div>
    </div>
  );
}