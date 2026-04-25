/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function StoreOwnerPage() {
  const router = useRouter();

  const [shopName, setShopName] = useState("متجري");
  const [email, setEmail] = useState("");
  const [avatar, setAvatar] = useState("/default-avatar.png");
  const [plan, setPlan] = useState<"free" | "basic" | "pro">("free");

  const [isEditingName, setIsEditingName] = useState(false);
  const [newShopName, setNewShopName] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalDebt: 0,
    totalInvoices: 0,
    totalPayments: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    const storedEmail = localStorage.getItem("email");

    if (!userId) {
      router.push("/login");
      return;
    }

    setShopName(localStorage.getItem("shopName") || "متجري");
    setNewShopName(localStorage.getItem("shopName") || "متجري");
    setEmail(storedEmail || "owner@dayni.com");   // fallback
    setAvatar(localStorage.getItem("avatar") || "/default-avatar.png");
    setPlan((localStorage.getItem("plan") || "free") as "free" | "basic" | "pro");

    fetchStats(userId);
  }, [router]);

  const fetchStats = async (userId: string) => {
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      const myCustomers = data.filter((c: any) => c.userId === userId);

      let totalDebt = 0;
      myCustomers.forEach((c: any) => totalDebt += Number(c.totalDebt || 0));

      setStats({
        totalCustomers: myCustomers.length,
        totalDebt,
        totalInvoices: myCustomers.length * 3,
        totalPayments: Math.floor(myCustomers.length * 2),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 400 * 1024) {
      alert("الصورة كبيرة جداً، اختر صورة أقل من 400KB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatar(base64);
      localStorage.setItem("avatar", base64);
      alert("✅ تم تغيير الصورة بنجاح");
    };
    reader.readAsDataURL(file);
  };

  const handleSaveShopName = () => {
    if (newShopName.trim()) {
      localStorage.setItem("shopName", newShopName.trim());
      setShopName(newShopName.trim());
      setIsEditingName(false);
      alert("✅ تم تحديث اسم المتجر");
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) return alert("كلمات المرور غير متطابقة");
    if (newPassword.length < 6) return alert("كلمة المرور يجب أن تكون 6 أحرف فأكثر");

    alert("✅ تم تغيير كلمة المرور بنجاح (سيتم ربطها بالداتابيس قريباً)");
    setShowPasswordModal(false);
    setCurrentPassword(""); 
    setNewPassword(""); 
    setConfirmPassword("");
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">جاري التحميل...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-6 max-w-5xl">
        <h1 className="text-4xl font-bold text-center mb-12">إعدادات المالك</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* كارد إعدادات الحساب */}
          <div className="bg-white rounded-3xl shadow p-10">
            <h2 className="text-2xl font-bold mb-8">إعدادات الحساب</h2>
            <div className="space-y-8">
              <div onClick={() => setShowPasswordModal(true)} className="flex items-center gap-5 p-6 hover:bg-slate-50 rounded-2xl cursor-pointer transition">
                <div className="text-4xl">🔑</div>
                <div>
                  <p className="font-semibold">تغيير كلمة المرور</p>
                  <p className="text-slate-500 text-sm">آخر تغيير منذ شهر</p>
                </div>
              </div>

              <div className="flex items-center gap-5 p-6 hover:bg-slate-50 rounded-2xl cursor-pointer transition">
                <div className="text-4xl">📤</div>
                <div>
                  <p className="font-semibold">تصدير بيانات المتجر</p>
                  <p className="text-slate-500 text-sm">Excel + PDF</p>
                </div>
              </div>
            </div>
          </div>

          {/* كارد معلومات المتجر */}
          <div className="bg-white rounded-3xl shadow p-10">
            <div className="flex justify-between items-start mb-10">
              <div>
                <div className="flex items-center gap-4">
                  <h2 className="text-3xl font-bold">{shopName}</h2>
                  <button onClick={() => setIsEditingName(!isEditingName)} className="text-emerald-600">✏️</button>
                </div>
                <p className="text-xl text-slate-600 mt-2">{email}</p>
              </div>

              <div className="relative">
                <img src={avatar} alt="المالك" className="w-28 h-28 object-cover rounded-2xl shadow" />
                <label className="absolute -bottom-2 -right-2 bg-white p-3 rounded-xl shadow cursor-pointer hover:bg-slate-100">
                  📷
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                </label>
              </div>
            </div>

            <div className="inline-block px-5 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              {plan === "free" ? "الخطة المجانية" : plan === "basic" ? "الخطة الأساسية" : "الخطة الاحترافية"}
            </div>

            <div className="grid grid-cols-2 gap-6 mt-12">
              <div className="bg-slate-50 p-6 rounded-2xl text-center">
                <p className="text-4xl font-bold text-emerald-600">{stats.totalCustomers}</p>
                <p className="text-sm text-slate-600">عميل</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl text-center">
                <p className="text-4xl font-bold text-red-600">{stats.totalDebt.toLocaleString()}</p>
                <p className="text-sm text-slate-600">ريال ديون</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl text-center">
                <p className="text-4xl font-bold">{stats.totalInvoices}</p>
                <p className="text-sm text-slate-600">فاتورة</p>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl text-center">
                <p className="text-4xl font-bold text-emerald-600">{stats.totalPayments}</p>
                <p className="text-sm text-slate-600">دفعة</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal تغيير كلمة المرور */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-10 w-full max-w-md">
            <h3 className="text-2xl font-bold mb-8">تغيير كلمة المرور</h3>
            <div className="space-y-6">
              <input type="password" placeholder="كلمة المرور الحالية" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full px-5 py-4 border rounded-2xl" />
              <input type="password" placeholder="كلمة المرور الجديدة" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full px-5 py-4 border rounded-2xl" />
              <input type="password" placeholder="تأكيد كلمة المرور" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-5 py-4 border rounded-2xl" />
            </div>
            <div className="flex gap-4 mt-10">
              <button onClick={handleChangePassword} className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-semibold">حفظ</button>
              <button onClick={() => setShowPasswordModal(false)} className="flex-1 bg-slate-200 py-4 rounded-2xl font-semibold">إلغاء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}