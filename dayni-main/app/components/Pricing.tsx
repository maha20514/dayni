import Link from "next/link";
import React from "react";

type PricingPlan = {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  buttonText: string;
  href: string;
  popular?: boolean;
};

const pricingPlans: PricingPlan[] = [
  {
    name: "مجاني", price: "0 ريال", period: "شهرياً",
    description: "مناسب للبداية وتجربة النظام",
    features: ["إدارة حتى 10 عملاء", "تسجيل الديون والمدفوعات", "متابعة رصيد كل عميل", "واجهة عربية سهلة"],
    buttonText: "ابدأ مجاناً", href: "/register",
  },
  {
    name: "أساسي", price: "19 ريال", period: "شهرياً",
    description: "الأفضل لأصحاب المحلات الصغيرة",
    features: ["عملاء غير محدودين", "ديون ومدفوعات غير محدودة", "تقارير واضحة ومفصلة", "تصدير البيانات", "دعم فني سريع"],
    buttonText: "اشترك الآن", href: "/register", popular: true,
  },
  {
    name: "احترافي", price: "39 ريال", period: "شهرياً",
    description: "للمتاجر التي تحتاج مميزات متقدمة",
    features: ["كل مميزات الخطة الأساسية", "إشعارات ذكية للمدفوعات", "تعدد المستخدمين", "تحليلات متقدمة", "دعم بأولوية"],
    buttonText: "اشترك الآن", href: "/register",
  },
];

export default function Pricing() {
  return (
    <section dir="rtl" className="relative overflow-hidden bg-slate-50 py-16 sm:py-24">
      <div className="absolute right-0 top-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-blue-200/30 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-56 w-56 sm:h-72 sm:w-72 rounded-full bg-emerald-200/30 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="mx-auto mb-10 sm:mb-16 max-w-3xl text-center">
          <span className="mb-3 sm:mb-4 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-blue-700">خطط مرنة</span>
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950 md:text-5xl">
            اختر الخطة المناسبة لمتجرك
          </h2>
          <p className="mt-3 sm:mt-5 text-sm sm:text-base lg:text-xl font-medium leading-relaxed text-slate-600">
            ابدأ مجاناً، ثم قم بالترقية عندما يكبر متجرك وتحتاج إلى مميزات أكثر.
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-4 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={`relative flex h-full flex-col rounded-2xl sm:rounded-[2rem] border bg-white p-5 sm:p-8 transition-all duration-300 hover:-translate-y-1 sm:hover:-translate-y-2 hover:shadow-2xl ${
                plan.popular
                  ? "border-blue-500 shadow-xl sm:shadow-2xl shadow-blue-100 sm:scale-[1.02] lg:scale-105"
                  : "border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-blue-100/70"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 sm:-top-4 right-1/2 translate-x-1/2 rounded-full bg-blue-600 px-4 sm:px-7 py-1.5 sm:py-2 text-[10px] sm:text-sm font-black text-white shadow-lg shadow-blue-500/30 whitespace-nowrap">
                  الأكثر اختياراً
                </div>
              )}

              <div className="mb-5 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-black text-slate-950">{plan.name}</h3>
                <p className="mt-2 sm:mt-3 min-h-[44px] text-xs sm:text-sm md:text-base font-medium leading-relaxed text-slate-500">{plan.description}</p>
              </div>

              <div className="mb-5 sm:mb-8">
                <div className="flex items-end gap-1.5 sm:gap-2">
                  <span className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-950">{plan.price}</span>
                </div>
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm font-bold text-slate-500">{plan.period}</p>
              </div>

              <ul className="mb-6 sm:mb-10 flex-1 space-y-2.5 sm:space-y-4 text-right">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm md:text-base font-semibold leading-relaxed text-slate-700">
                    <span className="mt-0.5 flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] sm:text-sm font-black text-emerald-700">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href={plan.href}
                className={`mt-auto inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base lg:text-lg font-black transition-all active:scale-[0.98] ${
                  plan.popular
                    ? "bg-blue-600 text-white shadow-xl shadow-blue-500/25 hover:bg-blue-700"
                    : "border border-slate-300 bg-white text-slate-800 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {plan.buttonText}
              </Link>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 sm:mt-12 max-w-3xl rounded-2xl sm:rounded-3xl border border-slate-200 bg-white/80 p-3 sm:p-5 text-center shadow-sm backdrop-blur">
          <p className="text-[10px] sm:text-sm font-semibold leading-relaxed text-slate-500">
            يمكنك الترقية أو الإلغاء في أي وقت • لا توجد رسوم مخفية • الدفع آمن
          </p>
        </div>
      </div>
    </section>
  );
}