/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function NewCustomerPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) router.replace("/login");
  }, [session, status, router]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) { toast.error("يرجى إدخال الاسم ورقم الجوال"); return; }
    if (!session?.user?.id) { toast.error("يرجى تسجيل الدخول أولاً"); router.push("/login"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      const data = await res.json();
      if (res.ok) { toast.success("تم إضافة العميل بنجاح"); router.push("/customers"); }
      else toast.error(data.error || "فشل في إضافة العميل");
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-6xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-emerald-50" />
            <div className="relative flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="mb-2 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">عميل جديد</span>
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                  إضافة عميل جديد
                </h1>
                <p className="mt-2 sm:mt-3 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                  أضف بيانات العميل حتى تتمكن من تسجيل الديون والمدفوعات بسهولة.
                </p>
              </div>
              <Link
                href="/customers"
                className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-bold text-slate-700 transition-all hover:-translate-y-1 hover:bg-slate-50 whitespace-nowrap"
              >
                الرجوع للعملاء <span className="mr-1 sm:mr-2">←</span>
              </Link>
            </div>
          </div>
        </section>

        <section className="grid gap-5 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          {/* INFO PANEL */}
          <div className="hidden overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-xl shadow-blue-200/50 lg:block">
            <div className="relative min-h-[420px]">
              <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
              <div className="relative">
                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-3xl ring-1 ring-white/20 backdrop-blur">👤</div>
                <h2 className="text-2xl lg:text-3xl font-semibold leading-tight">بداية منظمة لكل عميل</h2>
                <p className="mt-4 max-w-md leading-relaxed text-blue-100">
                  بعد إضافة العميل، يمكنك تسجيل الدين، متابعة السداد، ومعرفة الرصيد المتبقي من صفحة واحدة.
                </p>
              </div>
              <div className="absolute bottom-0 right-0 left-0 space-y-3">
                <div className="rounded-2xl bg-white/15 p-4 ring-1 ring-white/20 backdrop-blur">
                  <p className="text-sm font-semibold text-blue-100">الخطوة ١</p>
                  <p className="mt-1.5 text-xl font-semibold">أضف الاسم والجوال</p>
                </div>
                <div className="rounded-2xl bg-white p-4 text-slate-900 shadow-2xl">
                  <p className="text-sm font-semibold text-slate-500">الخطوة ٢</p>
                  <p className="mt-1.5 text-xl font-semibold">ابدأ بتسجيل الديون والمدفوعات</p>
                </div>
              </div>
            </div>
          </div>

          {/* FORM */}
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-lg sm:shadow-xl shadow-slate-200/70">
            <div className="mb-5 sm:mb-8 text-center">
              <div className="mx-auto mb-3 sm:mb-4 flex h-12 w-12 sm:h-16 sm:w-16 items-center justify-center rounded-2xl sm:rounded-3xl bg-blue-50 text-3xl sm:text-4xl">👤</div>
              <h2 className="text-2xl sm:text-3xl font-semibold text-slate-950">بيانات العميل</h2>
              <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-slate-500">أدخل الاسم ورقم الجوال بشكل صحيح</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">اسم العميل</label>
                <input
                  type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: أحمد محمد" required
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="mb-1.5 sm:mb-2 block text-xs sm:text-sm font-bold text-slate-600">رقم الجوال</label>
                <input
                  type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx" required
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-lg font-medium outline-none transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="rounded-2xl sm:rounded-3xl border border-blue-100 bg-blue-50 p-3 sm:p-5">
                <p className="text-xs sm:text-sm font-bold text-blue-700">ملاحظة مهمة</p>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm leading-relaxed text-blue-700/80">
                  يمكنك تعديل بيانات العميل لاحقاً، وإضافة الديون أو المدفوعات بعد إنشاء العميل.
                </p>
              </div>

              <button
                type="submit" disabled={loading}
                className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-8 py-4 sm:py-5 text-sm sm:text-base lg:text-lg font-bold text-white shadow-lg sm:shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {loading ? "جاري الحفظ..." : <>حفظ العميل <span className="mr-2">✓</span></>}
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}