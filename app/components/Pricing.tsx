import Link from 'next/link';
import React from 'react';

const Pricing = () => {
  return (
    <>
    <section className="py-24 bg-slate-50">
  <div className="container mx-auto px-6 text-center">
    <h2 className="text-4xl font-bold mb-4 text-slate-900">اختر خطتك المناسبة</h2>
    <p className="text-slate-600 text-xl mb-16">ابدأ مجاناً وطور متجرك مع نموذج أسعار بسيط وشفاف</p>

    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
      
      {/* الخطة المجانية */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all h-full flex flex-col">
        <div className="text-emerald-600 font-semibold text-lg mb-2">مجاني</div>
        <div className="text-6xl font-bold text-slate-900 mb-1">0 ريال</div>
        <p className="text-slate-500 mb-8">شهرياً</p>

        <div className="text-2xl font-semibold mb-8 text-slate-800">حتى 10 عملاء</div>

        <ul className="space-y-4 text-left mb-auto text-slate-700">
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> إدارة حتى 10 عملاء</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> إصدار فواتير غير محدود</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> تسجيل المدفوعات</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> متابعة الرصيد</li>
        </ul>

        <Link
          href="/register"
          className="mt-10 block w-full border border-slate-300 hover:bg-slate-50 py-4 rounded-2xl text-lg font-semibold transition-all"
        >
          ابدأ مجاناً
        </Link>
      </div>

      {/* الخطة الأساسية - الأكثر شعبية */}
      <div className="bg-white border-2 border-emerald-500 rounded-3xl p-8 relative hover:shadow-2xl transition-all h-full flex flex-col scale-105">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-sm font-bold px-8 py-1.5 rounded-full">
          الأكثر شعبية
        </div>

        <div className="text-emerald-600 font-semibold text-lg mb-2">أساسي</div>
        <div className="text-6xl font-bold text-slate-900 mb-1">19 ريال</div>
        <p className="text-slate-500 mb-8">شهرياً</p>

        <div className="text-2xl font-semibold mb-8 text-slate-800">عملاء غير محدودين</div>

        <ul className="space-y-4 text-left mb-auto text-slate-700">
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> عملاء غير محدودين</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> إصدار فواتير احترافية</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> تقارير مفصلة</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> دعم فني سريع</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> تصدير البيانات</li>
        </ul>

        <Link
          href="/register"
          className="mt-10 block w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl text-lg font-semibold transition-all"
        >
          اشترك الآن
        </Link>
      </div>

      {/* الخطة الاحترافية */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 hover:shadow-xl transition-all h-full flex flex-col">
        <div className="text-emerald-600 font-semibold text-lg mb-2">احترافي</div>
        <div className="text-6xl font-bold text-slate-900 mb-1">39 ريال</div>
        <p className="text-slate-500 mb-8">شهرياً</p>

        <div className="text-2xl font-semibold mb-8 text-slate-800">كل المميزات + إضافات</div>

        <ul className="space-y-4 text-left mb-auto text-slate-700">
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> كل مميزات الأساسي</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> إشعارات ذكية</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> دعم أولوية</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> تعدد المستخدمين</li>
          <li className="flex items-start gap-3"><span className="text-emerald-500 mt-1">✓</span> تحليلات متقدمة</li>
        </ul>

        <Link
          href="/register"
          className="mt-10 block w-full border border-slate-300 hover:bg-slate-50 py-4 rounded-2xl text-lg font-semibold transition-all"
        >
          اشترك الآن
        </Link>
      </div>
    </div>

    <p className="text-slate-500 mt-12 text-sm">
      يمكنك الترقية أو الإلغاء في أي وقت • الدفع آمن
    </p>
  </div>
</section>
    </>

  );
}

export default Pricing;
