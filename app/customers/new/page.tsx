/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

export default function NewCustomerPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);


const [userId, setUserId] = useState<string | null>(null);

useEffect(() => {
  const id = localStorage.getItem("userId");
  setUserId(id);
}, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!name.trim() || !phone.trim()) {
    alert("يرجى إدخال الاسم ورقم الجوال");
    return;
  }

  setLoading(true);

  try {
    const res = await fetch("/api/customers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        userId,
        name: name.trim(), 
        phone: phone.trim() 
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ تم إضافة العميل بنجاح");
      router.push("/customers");
    } else {
      alert(data.error || "فشل في إضافة العميل");
    }
  } catch (err) {
    console.error(err);
    alert("حدث خطأ في الاتصال بالخادم");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="container py-12 max-w-xl mx-auto">
      <div className="card p-10">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-3xl font-bold text-slate-900">إضافة عميل جديد</h2>
          <p className="text-slate-500 mt-2">املأ البيانات التالية</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">اسم العميل</label>
            <input
              type="text"
              className="input text-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="مثال: أحمد محمد"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-2">رقم الجوال</label>
            <input
              type="tel"
              className="input text-lg"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="05xxxxxxxx"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-success w-full text-xl py-4 mt-6 disabled:opacity-70"
          >
            {loading ? "جاري الحفظ..." : "✅ حفظ العميل"}
          </button>
        </form>
      </div>
    </div>
  );
}
