"use client";

import Link from "next/link";
import Pricing from "../components/Pricing";

const features = [
  { icon: "👥", title: "إدارة العملاء", desc: "أضف عملاءك بسهولة وتابع أرصدتهم وديونهم في مكان واحد." },
  { icon: "💰", title: "تسجيل الديون والمدفوعات", desc: "سجل الديون والمدفوعات وشاهد تحديث الرصيد مباشرة." },
  { icon: "📊", title: "نظرة عامة ذكية", desc: "اطلع على إجمالي الديون والمدفوعات والمتبقي بسهولة." },
  { icon: "🔍", title: "بحث سريع", desc: "اعثر على أي عميل بسرعة حتى في أوقات الزحمة." },
  { icon: "📱", title: "يعمل على الجوال", desc: "واجهة مصممة لتعمل بسلاسة على جميع الأجهزة." },
  { icon: "🔒", title: "بسيط وآمن", desc: "نظام خاص وآمن مصمم خصيصاً للمحلات الصغيرة." },
];

const steps = [
  { num: "١", title: "أنشئ حسابك", desc: "سجّل في دقيقة واحدة بدون بطاقة ائتمان", icon: "✨" },
  { num: "٢", title: "أضف عملاءك", desc: "سجّل العملاء وابدأ بإدارة ديونهم فوراً", icon: "👥" },
  { num: "٣", title: "تابع كل شيء", desc: "راقب الديون والمدفوعات من لوحة واحدة", icon: "📊" },
];

function DashboardMockup() {
  return (
    <div className="relative rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-5 shadow-2xl">
      <div className="mb-4 sm:mb-5 flex items-center justify-between border-b border-slate-100 pb-3 sm:pb-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900">لوحة التحكم</h2>
        <span className="rounded-lg sm:rounded-xl bg-blue-50 px-2.5 sm:px-3 py-1 text-xs sm:text-sm font-black text-blue-700">دَيني</span>
      </div>

      {/* stats */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="rounded-xl sm:rounded-2xl bg-red-50 p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-xs font-bold text-red-500">الديون</p>
          <h3 className="mt-0.5 sm:mt-1 text-sm sm:text-lg font-black text-red-700">4,250 ر</h3>
        </div>
        <div className="rounded-xl sm:rounded-2xl bg-emerald-50 p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-xs font-bold text-emerald-500">المدفوع</p>
          <h3 className="mt-0.5 sm:mt-1 text-sm sm:text-lg font-black text-emerald-700">1,800 ر</h3>
        </div>
        <div className="rounded-xl sm:rounded-2xl bg-blue-50 p-2.5 sm:p-4">
          <p className="text-[10px] sm:text-xs font-bold text-blue-500">العملاء</p>
          <h3 className="mt-0.5 sm:mt-1 text-sm sm:text-lg font-black text-blue-700">32</h3>
        </div>
      </div>

      {/* collection bar */}
      <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl bg-slate-50 p-2.5 sm:p-3">
        <div className="mb-1.5 sm:mb-2 flex justify-between text-[10px] sm:text-xs font-semibold">
          <span className="text-slate-500">نسبة التحصيل</span>
          <span className="text-emerald-600 font-black">42%</span>
        </div>
        <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-200">
          <div className="h-full w-[42%] rounded-full bg-emerald-500" />
        </div>
      </div>

      {/* customers */}
      <div className="mt-3 sm:mt-4 space-y-1.5 sm:space-y-2">
        {[
          { name: "أحمد محمد", amount: "350 ر", paid: false },
          { name: "خالد علي", amount: "120 ر", paid: true },
          { name: "سعد العمري", amount: "780 ر", paid: false },
        ].map((c) => (
          <div key={c.name} className="flex items-center justify-between rounded-lg sm:rounded-xl bg-slate-50 px-2.5 sm:px-3 py-2 sm:py-2.5">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl bg-slate-200 text-[10px] sm:text-sm font-black text-slate-600">
                {c.name[0]}
              </div>
              <div>
                <p className="text-[10px] sm:text-sm font-bold text-slate-900">{c.name}</p>
                <p className="text-[9px] sm:text-xs text-slate-400">{c.amount}</p>
              </div>
            </div>
            <span className={`rounded-full px-1.5 sm:px-2.5 py-0.5 text-[9px] sm:text-xs font-bold ${c.paid ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
              {c.paid ? "مدفوع" : "مستحق"}
            </span>
          </div>
        ))}
      </div>

      {/* remaining */}
      <div className="mt-3 sm:mt-4 rounded-xl sm:rounded-2xl bg-slate-900 p-3 sm:p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] sm:text-xs text-slate-400">المتبقي للتحصيل</p>
            <h3 className="mt-0.5 sm:mt-1 text-lg sm:text-2xl font-black">2,450 ر</h3>
          </div>
          <div className="rounded-lg sm:rounded-xl bg-white/10 px-2 sm:px-3 py-1 sm:py-1.5 text-[10px] sm:text-xs font-bold text-slate-300">
            الآن
          </div>
        </div>
      </div>

      {/* floating badge */}
      <div className="absolute -left-3 -top-3 sm:-left-4 sm:-top-4 rounded-xl sm:rounded-2xl bg-emerald-500 px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-white shadow-lg shadow-emerald-500/30">
        ✓ محدّث تلقائياً
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <main dir="rtl" className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">

      {/* HERO */}
      <section className="relative min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute right-0 top-0 h-72 w-72 sm:h-96 sm:w-96 rounded-full bg-blue-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-56 w-56 sm:h-80 sm:w-80 rounded-full bg-emerald-200/30 blur-3xl" />
        </div>

        <div className="container relative z-10 mx-auto grid items-center gap-10 sm:gap-16 px-4 sm:px-6 py-16 sm:py-24 lg:grid-cols-2">
          {/* TEXT */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <div className="mb-6 sm:mb-8 inline-flex items-center gap-2 sm:gap-3 rounded-full border border-slate-100 bg-white px-4 sm:px-5 py-2 sm:py-3 shadow-sm">
              <span className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm sm:text-lg">📒</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-700">نظام إدارة الديون للمحلات</span>
            </div>

            <h1 className="mb-4 sm:mb-6 bg-gradient-to-l from-blue-600 to-emerald-500 bg-clip-text text-5xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent">
              دَيني
            </h1>

            <p className="mb-8 sm:mb-10 text-base sm:text-xl leading-relaxed text-slate-600 md:text-2xl">
              نظام بسيط واحترافي يساعدك على تسجيل ديون العملاء، متابعة المدفوعات، ومعرفة من دفع ومن لم يدفع.
            </p>

            <div className="flex flex-col justify-center gap-3 sm:gap-4 sm:flex-row lg:justify-start">
              <Link href="/register" className="rounded-xl sm:rounded-2xl bg-blue-600 px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700">
                ابدأ الآن مجاناً
              </Link>
              <Link href="/login" className="rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-8 sm:px-10 py-4 sm:py-5 text-base sm:text-lg font-bold transition-all hover:-translate-y-1 hover:border-blue-200 hover:text-blue-700">
                تسجيل الدخول
              </Link>
            </div>

            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-slate-500">بدون بطاقة ائتمان • مناسب لجميع المحلات</p>
          </div>

          {/* MOCKUP */}
          <div className="relative order-1 lg:order-2">
            <div className="absolute -inset-3 sm:-inset-5 rounded-2xl sm:rounded-3xl bg-blue-200/40 blur-2xl" />
            <DashboardMockup />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto mb-10 sm:mb-16 max-w-2xl text-center">
            <span className="mb-3 sm:mb-5 inline-flex rounded-full bg-blue-50 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-700">كيف يعمل؟</span>
            <h2 className="text-2xl sm:text-4xl font-semibold text-slate-950 md:text-5xl">ابدأ في 3 خطوات بسيطة</h2>
          </div>

          <div className="relative grid gap-6 sm:gap-8 md:grid-cols-3">
            <div className="absolute right-[16.67%] top-10 hidden h-0.5 w-2/3 bg-gradient-to-l from-blue-200 to-emerald-200 md:block" />
            {steps.map((step, i) => (
              <div key={step.num} className="relative text-center">
                <div className={`mx-auto mb-4 sm:mb-6 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl sm:rounded-3xl text-2xl sm:text-3xl shadow-xl ${i === 0 ? "bg-blue-600 shadow-blue-500/25" : i === 1 ? "bg-indigo-600 shadow-indigo-500/25" : "bg-emerald-600 shadow-emerald-500/25"}`}>
                  <span className="text-white">{step.icon}</span>
                </div>
                <div className={`absolute right-1/2 top-0 flex h-6 w-6 sm:h-7 sm:w-7 -translate-y-2 translate-x-1/2 items-center justify-center rounded-full text-[10px] sm:text-xs font-black text-white ${i === 0 ? "bg-blue-400" : i === 1 ? "bg-indigo-400" : "bg-emerald-400"}`}>
                  {step.num}
                </div>
                <h3 className="mb-1.5 sm:mb-2 text-lg sm:text-xl font-bold text-slate-900">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-500">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-slate-50 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mx-auto mb-10 sm:mb-16 max-w-3xl text-center">
            <span className="mb-3 sm:mb-5 inline-flex rounded-full bg-slate-100 px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-700">مميزات دَيني</span>
            <h2 className="mb-3 sm:mb-5 text-2xl sm:text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">كل ما تحتاجه لإدارة ديون متجرك</h2>
            <p className="text-sm sm:text-lg leading-relaxed text-slate-600">واجهة بسيطة، أدوات واضحة، وتجربة عملية تناسب أصحاب المحلات.</p>
          </div>

          <div className="grid gap-3 sm:gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.title} className="rounded-2xl sm:rounded-[1.75rem] border border-slate-200 bg-slate-50 p-1.5 sm:p-2 transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50/40">
                <div className="h-full rounded-xl sm:rounded-[1.5rem] bg-white p-4 sm:p-7 shadow-sm">
                  <div className="mb-3 sm:mb-6 flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl bg-blue-50 text-2xl sm:text-3xl">{feature.icon}</div>
                  <h3 className="mb-1.5 sm:mb-3 text-base sm:text-xl font-semibold text-slate-950">{feature.title}</h3>
                  <p className="text-xs sm:text-base leading-relaxed text-slate-600">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <Pricing />

      {/* CTA */}
      <section className="relative overflow-hidden bg-slate-50 py-16 sm:py-28">
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#f8fafc,#ffffff,#f8fafc)]" />
        <div className="absolute right-10 top-20 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute bottom-10 left-10 h-48 w-48 sm:h-64 sm:w-64 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="container relative z-10 mx-auto px-4 sm:px-6">
          <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl sm:rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl shadow-slate-200/80">
            <div className="grid lg:grid-cols-[0.9fr_1.1fr]">

              {/* visual side */}
              <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-600 to-indigo-700 p-8 lg:p-10 text-white lg:block">
                <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-emerald-300/20 blur-3xl" />
                <div className="relative h-full min-h-[380px]">
                  <div className="absolute right-0 top-6 w-64 lg:w-72 rounded-2xl bg-white/15 p-4 lg:p-5 ring-1 ring-white/20 backdrop-blur-xl">
                    <p className="text-sm font-semibold text-blue-100">خطوة ١</p>
                    <h3 className="mt-1.5 text-lg lg:text-2xl font-semibold">أضف العميل</h3>
                  </div>
                  <div className="absolute left-4 top-36 w-64 lg:w-72 rounded-2xl bg-white p-4 lg:p-5 text-slate-900 shadow-2xl">
                    <p className="text-sm font-semibold text-slate-500">خطوة ٢</p>
                    <h3 className="mt-1.5 text-lg lg:text-2xl font-semibold">تابع الرصيد</h3>
                    <div className="mt-3 rounded-xl bg-red-50 p-3 text-red-700">
                      <div className="flex justify-between font-semibold text-sm"><span>المتبقي</span><span>2,450 ر</span></div>
                    </div>
                  </div>
                  <div className="absolute bottom-8 right-12 w-64 lg:w-72 rounded-2xl bg-white/15 p-4 lg:p-5 ring-1 ring-white/20 backdrop-blur-xl">
                    <p className="text-sm font-semibold text-emerald-100">خطوة ٣</p>
                    <h3 className="mt-1.5 text-lg lg:text-2xl font-semibold">سجّل السداد</h3>
                  </div>
                </div>
              </div>

              {/* content side */}
              <div className="p-6 sm:p-8 text-center md:p-10 lg:p-12 lg:text-right">
                <span className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 sm:px-5 py-2 text-xs sm:text-sm font-semibold text-emerald-700">✓ نظام بسيط للمحلات</span>
                <h2 className="text-2xl sm:text-4xl font-semibold leading-tight text-slate-950 md:text-5xl">
                  اترك الدفاتر الورقية
                  <span className="mt-1 sm:mt-2 block">
                    وخلّي{" "}
                    <span className="bg-gradient-to-l from-blue-600 to-emerald-500 bg-clip-text font-black tracking-tight text-transparent">دَيني</span>
                    {" "}يرتّبها
                  </span>
                </h2>
                <p className="mt-4 sm:mt-6 text-sm sm:text-lg leading-relaxed text-slate-600">
                  من أول عميل إلى آخر دفعة، كل شيء واضح ومنظم في مكان واحد.
                </p>
                <div className="mt-6 sm:mt-8 grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2">
                  {["تسجيل العملاء بسرعة", "متابعة الديون والمدفوعات", "معرفة المتبقي فوراً", "واجهة عربية سهلة"].map((item) => (
                    <div key={item} className="flex items-center gap-2 sm:gap-3 rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-2.5 sm:py-3">
                      <span className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-emerald-100 text-[10px] sm:text-sm font-bold text-emerald-700">✓</span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-8 sm:mt-10 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center lg:justify-start">
                  <Link href="/register" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-semibold text-white shadow-xl shadow-blue-500/25 transition-all hover:-translate-y-1 hover:bg-blue-700">
                    سجل الآن مجاناً <span className="mr-2">←</span>
                  </Link>
                  <Link href="/login" className="inline-flex items-center justify-center rounded-xl sm:rounded-2xl border border-slate-300 bg-white px-8 sm:px-10 py-4 sm:py-5 text-sm sm:text-lg font-semibold text-slate-800 transition-all hover:-translate-y-1 hover:border-blue-200 hover:text-blue-700">
                    تسجيل الدخول
                  </Link>
                </div>
                <p className="mt-6 sm:mt-8 text-[10px] sm:text-sm font-semibold text-slate-500">بدون بطاقة ائتمان • يمكنك الإلغاء في أي وقت</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}