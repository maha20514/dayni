"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

type PlanId = "free" | "basic" | "pro";
type PaidPlanId = "basic" | "pro";

type Plan = {
  id: PlanId;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  popular: boolean;
};

const plans: Plan[] = [
  {
    id: "free", name: "مجاني", price: 0, period: "شهرياً",
    description: "مناسب للبداية وتجربة النظام",
    features: ["إدارة حتى 10 عملاء", "تسجيل الديون والمدفوعات", "متابعة رصيد كل عميل", "واجهة عربية سهلة"],
    buttonText: "الاستمرار مجاناً", popular: false,
  },
  {
    id: "basic", name: "أساسي", price: 19, period: "شهرياً",
    description: "الأفضل لأصحاب المحلات الصغيرة",
    features: ["عملاء غير محدودين", "ديون ومدفوعات غير محدودة", "تقارير واضحة ومفصلة", "تصدير البيانات", "دعم فني سريع"],
    buttonText: "اشترك الآن", popular: true,
  },
  {
    id: "pro", name: "احترافي", price: 39, period: "شهرياً",
    description: "للمتاجر التي تحتاج مميزات متقدمة",
    features: ["كل مميزات الخطة الأساسية", "إشعارات ذكية للمدفوعات", "تعدد المستخدمين", "تحليلات متقدمة", "دعم بأولوية"],
    buttonText: "اشترك الآن", popular: false,
  },
];

const isPaidPlan = (id: PlanId): id is PaidPlanId => id === "basic" || id === "pro";

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<PaidPlanId | null>(null);

  const { data: session } = useSession();
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isMember = (session?.user as any)?.isMember;

  const handleUpgrade = (newPlan: PaidPlanId) => {
    setLoadingPlan(newPlan);
    router.push(`/pricing/checkout?plan=${newPlan}`);
  };

  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-6 sm:py-10 text-slate-900">
      <div className="absolute right-0 top-20 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-100/60 blur-3xl" />
      <div className="absolute bottom-20 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-100/50 blur-3xl" />

      <div className="container relative z-10 mx-auto max-w-7xl px-3 sm:px-6">

        {/* HEADER */}
        <section className="mb-6 sm:mb-10 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-lg sm:shadow-xl shadow-slate-200/70">
          <div className="relative p-5 sm:p-8 text-center md:p-10">
            <div className="absolute left-0 top-0 h-20 w-20 sm:h-32 sm:w-32 rounded-br-[2rem] sm:rounded-br-[4rem] bg-blue-50" />
            <div className="absolute bottom-0 right-0 h-20 w-20 sm:h-32 sm:w-32 rounded-tl-[2rem] sm:rounded-tl-[4rem] bg-emerald-50" />
            <div className="relative mx-auto max-w-3xl">
              <span className="mb-3 sm:mb-5 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">خطط دَيني</span>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight text-slate-950">
                اختر الخطة المناسبة لمتجرك
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base lg:text-lg leading-relaxed text-slate-600">
                ابدأ مجاناً، ثم قم بالترقية عندما يكبر متجرك.
              </p>
            </div>
          </div>
        </section>

        {/* PLANS */}
        <section className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => {
            const planBadge = plan.id === "free" ? "بداية مجانية" : plan.id === "basic" ? "الأفضل للمحلات" : "مميزات متقدمة";
            const planBadgeClass = plan.id === "pro" ? "bg-purple-50 text-purple-700" : plan.id === "basic" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700";

            return (
              <div
                key={plan.id}
                className={`relative flex h-full flex-col rounded-2xl sm:rounded-[2rem] border bg-white p-5 sm:p-8 transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl ${
                  plan.popular
                    ? "border-blue-500 shadow-xl sm:shadow-2xl shadow-blue-100 lg:scale-[1.02]"
                    : "border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-blue-100/70"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 right-1/2 translate-x-1/2 rounded-full bg-blue-600 px-4 sm:px-7 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-white shadow-lg shadow-blue-500/30 whitespace-nowrap">
                    الأكثر اختياراً
                  </div>
                )}

                <div className="mb-5 sm:mb-8">
                  <div className="mb-3 sm:mb-5 flex items-center justify-between gap-2">
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-950">{plan.name}</h2>
                    <span className={`rounded-full px-2.5 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black ${planBadgeClass}`}>
                      {planBadge}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-500">{plan.description}</p>
                </div>

                <div className="mb-5 sm:mb-8 rounded-2xl sm:rounded-3xl bg-slate-50 p-4 sm:p-6">
                  <div className="flex items-end gap-1.5 sm:gap-2">
                    <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">{plan.price}</span>
                    <span className="pb-1.5 sm:pb-2 text-base sm:text-lg font-bold text-slate-600">ريال</span>
                  </div>
                  <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-slate-500">{plan.period}</p>
                </div>

                <ul className="mb-6 sm:mb-10 flex-1 space-y-2.5 sm:space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm md:text-base font-semibold leading-relaxed text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] sm:text-sm font-black text-emerald-700">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isPaidPlan(plan.id) ? (
                  <Link
                    href="/customers"
                    className="mt-auto inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold text-slate-800 transition-all hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    {plan.buttonText}
                  </Link>
                ) : (
                  <button
                    type="button"
                     onClick={() => {
                      if (isMember) {
                        toast.error("فقط مالك المتجر يمكنه تغيير الخطة");
                        return;
                      }
                      if (plan.id === "basic" || plan.id === "pro") {
                        handleUpgrade(plan.id);
                      }
                    }}
                    disabled={loadingPlan === plan.id}
                    className={`mt-auto inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-bold transition-all disabled:cursor-not-allowed disabled:opacity-70 ${
                      plan.popular
                        ? "bg-blue-600 text-white shadow-lg sm:shadow-xl shadow-blue-500/25 hover:bg-blue-700"
                        : "border border-slate-300 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                  >
                    {loadingPlan === plan.id ? "جاري التوجيه..." : plan.buttonText}
                  </button>
                )}
              </div>
            );
          })}
        </section>

        <section className="mx-auto mt-6 sm:mt-10 max-w-4xl rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white/80 p-4 sm:p-5 text-center shadow-sm backdrop-blur">
          <p className="text-xs sm:text-sm font-semibold leading-relaxed text-slate-500">
            يمكنك الترقية أو الإلغاء في أي وقت • لا توجد رسوم مخفية • الدفع آمن ومشفر
          </p>
        </section>
      </div>
    </main>
  );
}