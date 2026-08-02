// app/refund/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الاسترداد — دَيني",
  description: "سياسة استرداد المبالغ المدفوعة في منصة دَيني",
};

export default function RefundPage() {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-10 sm:py-16 text-slate-900">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-amber-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-orange-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 sm:p-10">
            <div className="absolute left-0 top-0 h-28 w-28 rounded-br-[3rem] bg-amber-50 hidden sm:block" />
            <div className="absolute bottom-0 right-0 h-28 w-28 rounded-tl-[3rem] bg-orange-50 hidden sm:block" />
            <div className="relative">
              <span className="mb-4 inline-flex rounded-full bg-amber-50 px-5 py-2 text-sm font-bold text-amber-700">
                قانوني
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight text-slate-950">
                سياسة الاسترداد
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                آخر تحديث: يونيو ٢٠٢٦
              </p>
            </div>
          </div>
        </section>

        {/* Commitment banner */}
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl shrink-0">🤝</span>
            <p className="text-sm sm:text-base leading-relaxed text-amber-800">
              نحن في دَيني نسعى لرضاك التام. إذا لم تكن راضيًا عن خدمتنا، نحن هنا لمساعدتك والوصول لحل مناسب.
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-6">

          <PolicySection title="١. ضمان استرداد المبلغ">
            نقدم ضمان استرداد المبلغ كاملًا خلال <strong>٧ أيام</strong> من تاريخ أول اشتراك مدفوع. إذا لم تكن راضيًا عن الخدمة لأي سبب كان خلال هذه الفترة، ما عليك سوى التواصل معنا وسنعيد المبلغ كاملًا دون أي أسئلة.
          </PolicySection>

          <PolicySection title="٢. حالات الاسترداد المقبولة">
            يمكن طلب الاسترداد في الحالات التالية:
            <ul className="mt-3 space-y-3">
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800">✅ خلال ٧ أيام من الاشتراك الأول</p>
                <p className="mt-1 text-sm text-emerald-700">استرداد كامل المبلغ دون شروط.</p>
              </div>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                <p className="font-bold text-blue-800">✅ عطل تقني مستمر</p>
                <p className="mt-1 text-sm text-blue-700">في حال توقف الخدمة بشكل كامل لأكثر من ٤٨ ساعة متواصلة، يحق لك المطالبة باسترداد نسبي.</p>
              </div>
              <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                <p className="font-bold text-purple-800">✅ تكرار في الفوترة</p>
                <p className="mt-1 text-sm text-purple-700">في حال تم خصم مبلغ مضاعف أو خاطئ، نعيد الفرق فورًا.</p>
              </div>
            </ul>
          </PolicySection>

          <PolicySection title="٣. حالات لا يُطبَّق فيها الاسترداد">
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">✗</span>بعد انقضاء فترة الـ ٧ أيام للاشتراكات المتجددة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">✗</span>الاشتراكات التي استُخدمت فيها الخدمة بشكل مكثف (أكثر من ٥٠ عملية).</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">✗</span>الحسابات التي تم تعطيلها بسبب انتهاك شروط الخدمة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">✗</span>الرسوم المتعلقة بالفترة الماضية من الاشتراك.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٤. كيفية طلب الاسترداد">
            <ol className="mt-2 space-y-3">
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">١</span>
                <div>
                  <p className="font-bold text-slate-800">تواصل معنا</p>
                  <p className="text-sm text-slate-600">أرسل بريدًا إلكترونيًا إلى <a href="mailto:support@dayni.app" className="font-bold text-blue-600 hover:underline">support@dayni.app</a> أو استخدم صفحة الدعم الفني.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">٢</span>
                <div>
                  <p className="font-bold text-slate-800">أرفق معلوماتك</p>
                  <p className="text-sm text-slate-600">اذكر البريد الإلكتروني للحساب وسبب طلب الاسترداد وتاريخ الدفع.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">٣</span>
                <div>
                  <p className="font-bold text-slate-800">المراجعة والرد</p>
                  <p className="text-sm text-slate-600">سنراجع طلبك ونرد عليك خلال ٢-٣ أيام عمل.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-black text-amber-700">٤</span>
                <div>
                  <p className="font-bold text-slate-800">إعادة المبلغ</p>
                  <p className="text-sm text-slate-600">يُعاد المبلغ إلى نفس وسيلة الدفع الأصلية خلال ٥-١٠ أيام عمل.</p>
                </div>
              </li>
            </ol>
          </PolicySection>

          <PolicySection title="٥. الإلغاء مقابل الاسترداد">
            <div className="grid gap-4 sm:grid-cols-2 mt-2">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="font-bold text-slate-800 mb-2">🚫 الإلغاء</p>
                <p className="text-sm text-slate-600">يمنع تجديد الاشتراك في الدورة القادمة. تظل مزايا خطتك الحالية متاحة حتى نهاية الفترة المدفوعة.</p>
              </div>
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-bold text-emerald-800 mb-2">💰 الاسترداد</p>
                <p className="text-sm text-emerald-700">يعني إعادة المبلغ المدفوع وإيقاف الخدمة فورًا. مشروط بضوابط محددة في البنود أعلاه.</p>
              </div>
            </div>
          </PolicySection>

          <PolicySection title="٦. طرق الاسترداد">
            يُعاد المبلغ عبر:
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>نفس بطاقة الائتمان أو الخصم المستخدمة في الدفع.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>التحويل البنكي المباشر في حال الدفع بالتحويل.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>تستغرق عمليات الاسترداد عادةً من ٥ إلى ١٠ أيام عمل للظهور في حسابك.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٧. التواصل للاستفسار">
            إذا كان لديك أي سؤال حول سياسة الاسترداد، لا تتردد في التواصل معنا:{" "}
            <a href="mailto:support@dayni.app" className="font-bold text-blue-600 hover:underline">
              support@dayni.app
            </a>
            . نحن نرد على جميع الاستفسارات خلال ٢٤ ساعة في أيام العمل.
          </PolicySection>

        </div>

        {/* Back link */}
        <div className="mt-10 text-center">
          <Link href="/home" className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50">
            ← العودة للرئيسية
          </Link>
        </div>

      </div>
    </main>
  );
}

function PolicySection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-5 sm:p-8 shadow-sm">
      <h2 className="mb-3 text-lg sm:text-xl font-black text-slate-950">{title}</h2>
      <div className="text-sm sm:text-base leading-relaxed text-slate-600">{children}</div>
    </div>
  );
}