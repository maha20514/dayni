"use client";

export const dynamic = "force-dynamic";

import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { toast } from "sonner";

type PlanKey = "basic" | "pro";

const planInfo = {
  basic: {
    name: "الخطة الأساسية",
    price: 19,
    features: ["عملاء غير محدودين", "تقارير واضحة", "تصدير البيانات", "دعم فني سريع"],
  },
  pro: {
    name: "الخطة الاحترافية",
    price: 39,
    features: ["كل مميزات الأساسية", "إشعارات ذكية واتساب", "تعدد المستخدمين", "تحليلات متقدمة"],
  },
};

// ── Bank account info — edit these ──────────────────────────
const BANK_INFO = {
  bankName:      "البنك الأهلي السعودي",
  accountName:   "اسم صاحب الحساب",  // ← غير هذا
  iban:          "SA00 0000 0000 0000 0000 0000", // ← غير هذا
  accountNumber: "0000000000",          // ← غير هذا
};

export default function ManualCheckoutContent() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const { data: session } = useSession();

  const rawPlan = searchParams.get("plan");
  const selectedPlan: PlanKey =
    rawPlan === "pro" || rawPlan === "basic" ? rawPlan : "basic";
  const plan = planInfo[selectedPlan];

  const [step,        setStep]        = useState<1 | 2 | 3>(1);
  const [transferRef, setTransferRef] = useState("");
  const [notes,       setNotes]       = useState("");
  const [proofImage,  setProofImage]  = useState<string | null>(null);
  const [submitting,  setSubmitting]  = useState(false);
  const [copied,      setCopied]      = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error("الصورة يجب أن تكون أصغر من 2MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setProofImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) { router.push("/login"); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/payment-requests", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          plan:        selectedPlan,
          transferRef,
          notes,
          proofImage,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "حدث خطأ";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 px-3 py-6 sm:px-6 sm:py-10 text-slate-900">
      <div className="pointer-events-none absolute right-0 top-20 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="pointer-events-none absolute bottom-20 left-0 h-48 w-48 sm:h-72 sm:w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-2xl">

        {/* ── Header ── */}
        <div className="mb-5 sm:mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-4 sm:p-8 text-center">
            <div className="absolute left-0 top-0 h-16 w-16 sm:h-24 sm:w-24 rounded-br-[2rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-16 w-16 sm:h-24 sm:w-24 rounded-tl-[2rem] bg-emerald-50" />
            <div className="relative">
              <span className="mb-3 inline-flex rounded-full bg-blue-50 px-4 py-1.5 text-xs sm:text-sm font-bold text-blue-700">
                ترقية الخطة
              </span>
              <h1 className="text-xl sm:text-3xl font-semibold text-slate-950">
                اشتراك {plan.name}
              </h1>
              <p className="mt-1 sm:mt-2 text-sm text-slate-500">
                ادفع عبر التحويل البنكي وسنفعّل خطتك خلال 24 ساعة
              </p>
            </div>
          </div>
        </div>

        {/* ── Steps indicator ── */}
        <div className="mb-5 sm:mb-8 flex items-center gap-2">
          {[
            { n: 1, label: "تفاصيل التحويل" },
            { n: 2, label: "تأكيد الدفع" },
            { n: 3, label: "تم الإرسال" },
          ].map((s, i) => (
            <div key={s.n} className="flex flex-1 items-center gap-2">
              <div className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full text-xs sm:text-sm font-bold transition-all ${
                step >= s.n ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-500"
              }`}>
                {step > s.n ? "✓" : s.n}
              </div>
              <span className={`text-xs sm:text-sm font-semibold hidden sm:block ${step >= s.n ? "text-blue-700" : "text-slate-400"}`}>
                {s.label}
              </span>
              {i < 2 && <div className={`flex-1 h-0.5 ${step > s.n ? "bg-blue-500" : "bg-slate-200"}`} />}
            </div>
          ))}
        </div>

        {/* ════ STEP 1: Bank info ════ */}
        {step === 1 && (
          <div className="space-y-4 sm:space-y-5">

            {/* Plan summary */}
            <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 shadow-lg shadow-slate-200/70">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base sm:text-lg font-bold text-slate-950">ملخص الاشتراك</h2>
                <span className={`rounded-full px-3 py-1 text-xs font-black ${
                  selectedPlan === "pro" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                }`}>
                  {selectedPlan === "pro" ? "احترافي" : "أساسي"}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-semibold text-slate-600">{plan.name}</span>
                <span className="text-xl sm:text-2xl font-black text-blue-700">{plan.price} ريال<span className="text-sm font-bold">/شهر</span></span>
              </div>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs sm:text-sm text-slate-600">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-black text-emerald-700">✓</span>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* Bank details */}
            <div className="rounded-2xl sm:rounded-[2rem] border border-blue-200 bg-blue-50 p-4 sm:p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base sm:text-lg font-bold text-blue-900">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-base text-white">🏦</span>
                بيانات التحويل البنكي
              </h2>

              {[
                { label: "اسم البنك",     value: BANK_INFO.bankName,      key: "bank" },
                { label: "اسم الحساب",    value: BANK_INFO.accountName,   key: "name" },
                { label: "رقم الآيبان",   value: BANK_INFO.iban,          key: "iban" },
                { label: "رقم الحساب",    value: BANK_INFO.accountNumber, key: "acc"  },
              ].map((row) => (
                <div key={row.key} className="mb-3 flex items-center justify-between rounded-xl border border-blue-100 bg-white px-4 py-3">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400">{row.label}</p>
                    <p className="text-sm sm:text-base font-black text-slate-900">{row.value}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(row.value, row.key)}
                    className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                  >
                    {copied === row.key ? "✓ تم" : "نسخ"}
                  </button>
                </div>
              ))}

              <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                <p className="text-xs sm:text-sm font-bold text-amber-800">
                  ⚠️ تأكد من كتابة اسم المتجر في ملاحظات التحويل
                </p>
              </div>
            </div>

            <button
              onClick={() => setStep(2)}
              className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 py-4 sm:py-5 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 hover:bg-blue-700"
            >
              أكملت التحويل — التالي ←
            </button>
            <button onClick={() => router.back()} className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
              رجوع
            </button>
          </div>
        )}

        {/* ════ STEP 2: Confirm transfer ════ */}
        {step === 2 && (
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-4 sm:p-6 md:p-8 shadow-xl shadow-slate-200/70">
            <h2 className="mb-5 text-base sm:text-xl font-bold text-slate-950">تأكيد عملية التحويل</h2>

            <div className="space-y-4">
              {/* Transfer ref */}
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600">
                  رقم مرجع التحويل <span className="text-slate-400 font-normal">(اختياري)</span>
                </label>
                <input
                  type="text"
                  value={transferRef}
                  onChange={(e) => setTransferRef(e.target.value)}
                  placeholder="مثال: 1234567890"
                  className="w-full rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 sm:py-4 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Screenshot upload */}
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600">
                  صورة إيصال التحويل <span className="text-slate-400 font-normal">(موصى بها)</span>
                </label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="cursor-pointer rounded-xl sm:rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 sm:p-8 text-center transition hover:border-blue-400 hover:bg-blue-50"
                >
                  {proofImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proofImage} alt="إيصال" className="mx-auto max-h-40 rounded-xl object-contain" />
                  ) : (
                    <>
                      <div className="mb-2 text-3xl sm:text-4xl">📸</div>
                      <p className="text-sm font-bold text-slate-600">اضغط لرفع صورة الإيصال</p>
                      <p className="mt-1 text-xs text-slate-400">PNG, JPG — أقل من 2MB</p>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                {proofImage && (
                  <button onClick={() => setProofImage(null)} className="mt-2 text-xs font-bold text-red-500 hover:text-red-600">
                    حذف الصورة
                  </button>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="mb-1.5 block text-xs sm:text-sm font-bold text-slate-600">
                  ملاحظات إضافية <span className="text-slate-400 font-normal">(اختياري)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="أي معلومات إضافية تريد إضافتها..."
                  className="w-full resize-none rounded-xl sm:rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Summary box */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-bold text-slate-400 mb-2">ملخص طلبك</p>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">الخطة</span>
                  <span className="font-bold">{plan.name}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-slate-600">المبلغ</span>
                  <span className="font-black text-blue-700">{plan.price} ريال / شهر</span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl sm:rounded-2xl bg-blue-600 py-4 sm:py-5 text-sm sm:text-base font-bold text-white shadow-xl shadow-blue-500/25 transition hover:-translate-y-1 hover:bg-blue-700 disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {submitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />}
                {submitting ? "جاري الإرسال..." : "إرسال طلب التفعيل ←"}
              </button>
              <button onClick={() => setStep(1)} className="w-full rounded-xl border border-slate-300 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50">
                ← رجوع
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 3: Success ════ */}
        {step === 3 && (
          <div className="rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white p-6 sm:p-10 text-center shadow-xl shadow-slate-200/70">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-50 text-5xl">
              🎉
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-700">تم إرسال طلبك بنجاح!</h2>
            <p className="mt-3 text-sm sm:text-base leading-relaxed text-slate-600">
              سيتم مراجعة طلبك خلال <strong>24 ساعة</strong> وتفعيل خطتك تلقائياً.
              <br />
              ستصلك رسالة بريد إلكتروني عند التفعيل.
            </p>
            <div className="my-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-right">
              <p className="text-xs sm:text-sm font-bold text-blue-800">📧 للاستفسار تواصل معنا على:</p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-blue-700">support@dayni.app</p>
            </div>
            <button
              onClick={() => router.push("/dashboard")}
              className="inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-blue-700"
            >
              العودة للوحة التحكم ←
            </button>
          </div>
        )}
      </div>
    </main>
  );
}