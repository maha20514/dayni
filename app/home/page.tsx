"use client";

import Link from "next/link";
import Pricing from "../components/Pricing";   // تأكد من المسار الصحيح

export default function HomePage() {
  return (
    <div className="bg-slate-50 min-h-screen overflow-hidden">
      {/* HERO SECTION */}
      <section className="min-h-screen flex items-center justify-center relative bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 bg-[radial-gradient(at_center,#3b82f610_0%,transparent_70%)]"></div>

        <div className="container mx-auto px-6 text-center relative z-10 max-w-4xl pt-10">
          <div className="inline-flex items-center gap-3 bg-white shadow-sm border border-slate-100 px-6 py-3 rounded-full mb-10">
            <span className="text-2xl">📒</span>
            <span className="font-medium text-slate-700">نظام إدارة الديون الذكي</span>
          </div>

          <h1 className="text-7xl md:text-8xl font-bold tracking-tighter text-slate-900 mb-6">
            دَيني
          </h1>

          <p className="text-2xl md:text-3xl text-slate-600 max-w-3xl mx-auto leading-relaxed mb-12">
            نظام بسيط وذكي يساعد أصحاب المحلات على تسجيل ديون الزبائن ومعرفة من دفع ومن لم يدفع.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-5 rounded-2xl text-xl font-semibold transition-all shadow-lg flex items-center justify-center gap-3"
            >
              ابدأ متجرك مجاناً الآن
            </Link>

            <Link
              href="/login"
              className="border border-slate-300 hover:bg-white hover:border-slate-400 px-12 py-5 rounded-2xl text-xl font-semibold transition-all"
            >
              تسجيل الدخول
            </Link>
          </div>

          <p className="text-slate-500 mt-8 text-sm">
            لا تحتاج بطاقة ائتمان • جرب مجاناً للأبد
          </p>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 text-[220px] opacity-5 pointer-events-none">
          📒
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">
              لماذا يختارك أصحاب المحلات؟
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              كل ما تحتاجه لإدارة ديون متجرك بكل سهولة واحترافية
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "👥", title: "إدارة العملاء", desc: "سجل بيانات العملاء ورصيدهم بدقة واحترافية" },
              { icon: "📄", title: "إصدار الفواتير", desc: "أصدر فواتير احترافية وتابعها في ثوانٍ" },
              { icon: "💰", title: "تسجيل المدفوعات", desc: "سجل الدفعات وشاهد تأثيرها على الرصيد فوراً" },
              { icon: "📊", title: "تقارير واضحة", desc: "اعرف إجمالي الديون والمدفوعات في أي وقت" },
              { icon: "🔍", title: "متابعة الرصيد", desc: "تابع رصيد كل عميل بدقة وفي الوقت الفعلي" },
              { icon: "📱", title: "سهل الاستخدام", desc: "واجهة عربية بسيطة وسريعة تناسب الجميع" },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group bg-white border border-slate-100 hover:border-blue-200 rounded-3xl p-10 hover:shadow-xl transition-all duration-300"
              >
                <div className="text-6xl mb-8 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <Pricing />

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            جاهز تبدأ إدارة ديونك؟
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-xl mx-auto">
            انضم إلى آلاف أصحاب المحلات الذين يديرون أعمالهم بذكاء مع دَيني
          </p>

          <Link
            href="/register"
            className="inline-block bg-white text-blue-700 hover:bg-slate-100 px-14 py-5 rounded-2xl text-xl font-semibold transition-all shadow-xl"
          >
            سجل متجرك الآن — مجاناً
          </Link>
        </div>
      </section>
    </div>
  );
}