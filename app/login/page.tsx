"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("shopName", data.shopName || "");
        localStorage.setItem("email", data.email || "");
        localStorage.setItem("plan", data.plan || "free");

        router.push("/dashboard");
      } else {
        setError(data.error || "البريد أو كلمة المرور غير صحيحة");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* الجزء العلوي الملون */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-center">
            <div className="mx-auto w-20 h-20 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6">
              🛒
            </div>
            <h1 className="text-white text-3xl font-bold">مرحباً بعودتك</h1>
            <p className="text-blue-100 mt-2">تسجيل الدخول إلى حساب متجرك</p>
          </div>

          {/* النموذج */}
          <div className="p-10">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 transition"
                  placeholder="example@shop.com"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-600 mb-2">كلمة المرور</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-4 border border-slate-300 rounded-2xl focus:outline-none focus:border-blue-500 transition"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border border-red-100">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-700 hover:to-violet-700 text-white py-4 rounded-2xl font-semibold text-lg disabled:opacity-70 transition-all hover:brightness-105"
              >
                {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول →"}
              </button>
            </form>

            <div className="text-center mt-8">
              <p className="text-slate-600">
                ليس لديك حساب؟{" "}
                <Link href="/register" className="text-blue-600 font-semibold hover:underline">
                  إنشاء حساب جديد
                </Link>
              </p>
            </div>
          </div>
        </div>

        <p className="text-center text-slate-400 text-sm mt-8">
          © 2026 دَيني - نظام إدارة الديون
        </p>
      </div>
    </div>
  );
}