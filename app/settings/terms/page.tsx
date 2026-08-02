// app/terms/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "شروط الخدمة — دَيني",
  description: "شروط وأحكام استخدام منصة دَيني لإدارة الديون",
};

export default function TermsPage() {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-10 sm:py-16 text-slate-900">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 sm:p-10">
            <div className="absolute left-0 top-0 h-28 w-28 rounded-br-[3rem] bg-blue-50 hidden sm:block" />
            <div className="absolute bottom-0 right-0 h-28 w-28 rounded-tl-[3rem] bg-indigo-50 hidden sm:block" />
            <div className="relative">
              <span className="mb-4 inline-flex rounded-full bg-blue-50 px-5 py-2 text-sm font-bold text-blue-700">
                قانوني
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight text-slate-950">
                شروط الخدمة
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                آخر تحديث: يونيو ٢٠٢٦
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <div className="space-y-6">

          <PolicySection title="١. قبول الشروط">
            باستخدامك لمنصة دَيني، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يُرجى عدم استخدام الخدمة. يحق لنا تعديل هذه الشروط في أي وقت، وسيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال المنصة.
          </PolicySection>

          <PolicySection title="٢. وصف الخدمة">
            دَيني هي منصة سحابية لإدارة ديون العملاء، تُمكّن أصحاب المحلات والمتاجر الصغيرة من تسجيل الديون والمدفوعات ومتابعة أرصدة العملاء. نحن نقدم هذه الخدمة بثلاث خطط اشتراك: المجانية، الأساسية، والاحترافية، ولكل خطة ميزاتها ومحدوداتها المحددة.
          </PolicySection>

          <PolicySection title="٣. حساب المستخدم">
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>يجب أن يكون لديك عمر لا يقل عن ١٨ عامًا لإنشاء حساب.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>أنت مسؤول عن الحفاظ على سرية بيانات تسجيل الدخول الخاصة بك.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>يجب تقديم معلومات دقيقة وحديثة عند التسجيل وتحديثها عند الحاجة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>أنت مسؤول عن جميع الأنشطة التي تجري تحت حسابك.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>يحق لنا إيقاف أو حذف الحسابات التي تنتهك هذه الشروط.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٤. الاستخدام المقبول">
            توافق على عدم استخدام المنصة لأي من الأغراض التالية:
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">•</span>انتهاك أي قوانين أو لوائح مُعمول بها في المملكة العربية السعودية.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">•</span>نشر محتوى مضلل أو احتيالي أو مسيء.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">•</span>محاولة اختراق أو تعطيل خوادم المنصة أو قواعد بياناتها.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">•</span>إعادة بيع أو تأجير أو ترخيص الخدمة لأطراف ثالثة دون إذن صريح.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-red-400">•</span>استخدام أدوات آلية للوصول إلى البيانات بشكل غير مصرح به.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٥. الاشتراكات والمدفوعات">
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>تُجدَّد الاشتراكات المدفوعة تلقائيًا شهريًا حتى يتم إلغاؤها.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>يمكنك إلغاء اشتراكك في أي وقت من صفحة إدارة الاشتراك.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>عند الإلغاء، تبقى مزايا الخطة المدفوعة حتى نهاية الفترة الحالية.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>نحتفظ بالحق في تغيير الأسعار مع إشعار مسبق لا يقل عن ٣٠ يومًا.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>جميع المدفوعات تُعالج بأمان عبر بوابات دفع موثوقة.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٦. الملكية الفكرية">
            جميع المحتويات والتصاميم والشعارات والكود البرمجي المستخدمة في منصة دَيني هي ملك حصري لنا أو لمرخّصينا. لا يُمنح لك أي ترخيص باستخدام هذه الملكية الفكرية خارج نطاق الاستخدام المعتاد للمنصة. بياناتك وبيانات عملائك تبقى ملكًا لك في جميع الأوقات.
          </PolicySection>

          <PolicySection title="٧. إخلاء المسؤولية">
            تُقدَّم الخدمة &quot;كما هي&quot; دون أي ضمانات صريحة أو ضمنية. لا نتحمل المسؤولية عن أي خسائر أو أضرار ناجمة عن الاستخدام أو عدم القدرة على الاستخدام. نسعى دائمًا لضمان توافر الخدمة وأمانها، لكننا لا نضمن ذلك في جميع الأوقات.
          </PolicySection>

          <PolicySection title="٨. القانون المنظِّم">
            تخضع هذه الشروط لأحكام وقوانين المملكة العربية السعودية. في حال نشوء أي نزاع، يتم تسويته وفق الأنظمة السعودية المعمول بها.
          </PolicySection>

          <PolicySection title="٩. التواصل معنا">
            لأي استفسارات حول هذه الشروط، يُرجى التواصل معنا عبر:{" "}
            <a href="mailto:support@dayni.app" className="font-bold text-blue-600 hover:underline">
              support@dayni.app
            </a>
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