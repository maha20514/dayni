"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function PricingPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleUpgrade = (newPlan: "basic" | "pro") => {
    router.push(`/pricing/checkout?plan=${newPlan}`);
  };

  const plans = [
    {
      id: "free" as const,
      name: "مجاني",
      price: 0,
      period: "شهرياً",
      description: "حتى 10 عملاء",
      features: [
        "إدارة حتى 10 عملاء",
        "إصدار فواتير غير محدود",
        "تسجيل المدفوعات",
        "متابعة الرصيد",
      ],
      buttonText: "الاستمرار مجاناً",
      popular: false,
    },
    {
      id: "basic" as const,
      name: "أساسي",
      price: 19,
      period: "شهرياً",
      description: "عملاء غير محدودين",
      features: [
        "عملاء غير محدودين",
        "إصدار فواتير احترافية",
        "تقارير مفصلة",
        "دعم فني سريع",
        "تصدير البيانات",
      ],
      buttonText: "اشترك الآن",
      popular: true,
    },
    {
      id: "pro" as const,
      name: "احترافي",
      price: 39,
      period: "شهرياً",
      description: "كل المميزات + إضافات",
      features: [
        "كل مميزات الأساسي",
        "إشعارات ذكية",
        "دعم أولوية",
        "تعدد المستخدمين",
        "تحليلات متقدمة",
      ],
      buttonText: "اشترك الآن",
      popular: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-16">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-slate-900 mb-4">اختر خطتك المناسبة</h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            ابدأ مجاناً وطور متجرك مع دَيني. يمكنك الترقية أو الإلغاء في أي وقت.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-3xl p-8 relative transition-all duration-300 ${
                plan.popular 
                  ? "border-2 border-emerald-500 shadow-2xl scale-[1.03]" 
                  : "border border-slate-200 hover:border-slate-300"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm font-bold px-8 py-1.5 rounded-full">
                  الأكثر شعبية
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-6xl font-bold text-slate-900">{plan.price}</span>
                  <span className="text-slate-500">ريال</span>
                </div>
                <p className="text-slate-500 mt-1">{plan.period}</p>
                <p className="text-sm text-slate-600 mt-4 min-h-[44px]">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-10 text-slate-700">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="text-emerald-500 text-xl">✓</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {plan.id === "free" ? (
                <Link
                  href="/customers"
                  className="block w-full py-4 rounded-2xl text-center font-semibold text-lg border border-slate-300 hover:bg-slate-50 transition-all"
                >
                  {plan.buttonText}
                </Link>
              ) : (
                <button
                  onClick={() => handleUpgrade(plan.id)}
                  className={`block w-full py-4 rounded-2xl text-center font-semibold text-lg transition-all ${
                    plan.popular
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "border border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {plan.buttonText}
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-16 text-slate-500 text-sm">
          • يمكنك الترقية أو الإلغاء في أي وقت • الدفع آمن ومشفر
        </div>
      </div>
    </div>
  );
}