"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shopName, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        // حفظ userId في localStorage
        localStorage.setItem("userId", data.userId);
        setMessage("تم التسجيل بنجاح!");
        setShopName(""); setEmail(""); setPassword("");

        // إعادة التوجيه لصفحة Hero
        router.push("/hero");
      } else {
        setMessage(data.error);
      }
    } catch (err) {
      console.error(err);
      setMessage("حدث خطأ أثناء التسجيل");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 border rounded shadow">
      <h1 className="text-xl font-bold mb-4">تسجيل متجر جديد</h1>
      <form onSubmit={handleRegister} className="space-y-3">
        <input type="text" placeholder="اسم المتجر" value={shopName} onChange={e => setShopName(e.target.value)} className="w-full p-2 border rounded" />
        <input type="email" placeholder="البريد الإلكتروني" value={email} onChange={e => setEmail(e.target.value)} className="w-full p-2 border rounded" />
        <input type="password" placeholder="كلمة المرور" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">تسجيل</button>
      </form>
      {message && <p className="mt-3 text-center">{message}</p>}
    </div>
  );
}