// app/privacy/page.tsx
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "سياسة الخصوصية — دَيني",
  description: "سياسة خصوصية منصة دَيني وكيفية حماية بياناتك",
};

export default function PrivacyPage() {
  return (
    <main dir="rtl" className="relative min-h-screen overflow-hidden bg-slate-50 py-10 sm:py-16 text-slate-900">
      <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-emerald-100/50 blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-0 h-72 w-72 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      <div className="container relative z-10 mx-auto max-w-4xl px-4 sm:px-6">

        {/* Header */}
        <section className="mb-8 overflow-hidden rounded-2xl sm:rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
          <div className="relative p-6 sm:p-10">
            <div className="absolute left-0 top-0 h-28 w-28 rounded-br-[3rem] bg-emerald-50 hidden sm:block" />
            <div className="absolute bottom-0 right-0 h-28 w-28 rounded-tl-[3rem] bg-teal-50 hidden sm:block" />
            <div className="relative">
              <span className="mb-4 inline-flex rounded-full bg-emerald-50 px-5 py-2 text-sm font-bold text-emerald-700">
                قانوني
              </span>
              <h1 className="text-3xl sm:text-5xl font-black leading-tight text-slate-950">
                سياسة الخصوصية
              </h1>
              <p className="mt-3 text-base sm:text-lg text-slate-500">
                آخر تحديث: يونيو ٢٠٢٦
              </p>
            </div>
          </div>
        </section>

        {/* Intro */}
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <p className="text-sm sm:text-base leading-relaxed text-emerald-800">
            نحن في دَيني نأخذ خصوصيتك بجدية تامة. توضح هذه السياسة كيفية جمع بياناتك واستخدامها وحمايتها عند استخدامك لمنصتنا.
          </p>
        </div>

        {/* Content */}
        <div className="space-y-6">

          <PolicySection title="١. البيانات التي نجمعها">
            <p className="mb-3">نجمع أنواعًا مختلفة من البيانات لتقديم خدماتنا بشكل أفضل:</p>
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-800">بيانات الحساب</p>
                <p className="mt-1 text-slate-600">الاسم، البريد الإلكتروني، اسم المتجر، وكلمة المرور المشفّرة.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-800">بيانات الاستخدام</p>
                <p className="mt-1 text-slate-600">بيانات العملاء والفواتير والمدفوعات التي تُدخلها في المنصة.</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                <p className="font-bold text-slate-800">البيانات التقنية</p>
                <p className="mt-1 text-slate-600">عنوان IP، نوع المتصفح، الجهاز المستخدم، وأوقات الوصول.</p>
              </div>
            </div>
          </PolicySection>

          <PolicySection title="٢. كيف نستخدم بياناتك">
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">✓</span>تشغيل الخدمة وتزويدك بمميزاتها.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">✓</span>إرسال الإشعارات والتذكيرات المتعلقة بحسابك.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">✓</span>تحسين تجربة المستخدم وتطوير ميزات جديدة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">✓</span>معالجة المدفوعات والاشتراكات.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">✓</span>تقديم الدعم الفني عند الحاجة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">✓</span>الامتثال للمتطلبات القانونية والتنظيمية.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٣. مشاركة البيانات">
            <p className="mb-3">لا نبيع بياناتك الشخصية لأي طرف ثالث. قد نشارك بيانات محدودة في الحالات التالية فقط:</p>
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span><strong>مزودي الخدمات:</strong> مثل شركات معالجة الدفع وخدمات الاستضافة السحابية، وهؤلاء ملزمون بحماية بياناتك.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span><strong>المتطلبات القانونية:</strong> إذا طُلب منا ذلك بموجب القانون أو أمر قضائي.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span><strong>حماية الحقوق:</strong> لحماية حقوقنا أو حقوق مستخدمينا من الاحتيال أو الضرر.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٤. أمان البيانات">
            نستخدم أحدث تقنيات التشفير والحماية لضمان أمان بياناتك:
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">🔒</span>تشفير SSL/TLS لجميع البيانات المنقولة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">🔒</span>كلمات المرور مشفّرة بخوارزمية bcrypt.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">🔒</span>قواعد بيانات محمية في بيئات سحابية آمنة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-emerald-500">🔒</span>نسخ احتياطية دورية للبيانات.</li>
            </ul>
          </PolicySection>

          <PolicySection title="٥. ملفات تعريف الارتباط (Cookies)">
            نستخدم ملفات تعريف الارتباط الضرورية لتشغيل الجلسات وتحسين التجربة. لا نستخدم ملفات تتبع لأغراض إعلانية. يمكنك إدارة إعدادات الكوكيز من متصفحك.
          </PolicySection>

          <PolicySection title="٦. حقوقك">
            لديك الحق في:
            <ul className="mt-2 space-y-2 text-slate-600">
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>الوصول إلى بياناتك الشخصية المحفوظة لدينا.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>تصحيح أو تحديث بياناتك غير الدقيقة.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>طلب حذف حسابك وبياناتك.</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>تصدير بياناتك (متاح في الخطط المدفوعة).</li>
              <li className="flex items-start gap-2"><span className="mt-1 text-blue-500">•</span>إلغاء الاشتراك من رسائل التسويق.</li>
            </ul>
            لممارسة أي من هذه الحقوق، تواصل معنا على{" "}
            <a href="mailto:support@dayni.app" className="font-bold text-blue-600 hover:underline">support@dayni.app</a>
          </PolicySection>

          <PolicySection title="٧. احتفاظنا بالبيانات">
            نحتفظ ببياناتك طالما حسابك نشطًا. عند حذف حسابك، تُحذف بياناتك خلال ٣٠ يومًا ما لم تكن هناك متطلبات قانونية للاحتفاظ بها لفترة أطول.
          </PolicySection>

          <PolicySection title="٨. التغييرات على هذه السياسة">
            نحتفظ بحق تحديث هذه السياسة. سيتم إخطارك بأي تغييرات جوهرية عبر البريد الإلكتروني أو من خلال إشعار بارز على المنصة قبل ٣٠ يومًا من سريانها.
          </PolicySection>

          <PolicySection title="٩. التواصل معنا">
            لأي أسئلة أو مخاوف تتعلق بخصوصيتك:{" "}
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