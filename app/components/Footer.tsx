"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  if (pathname.startsWith("/dashboard")) return null;
  if (pathname.startsWith("/settings/forgot-password")) return null;
  if (pathname.startsWith("/settings/reset-password")) return null;
  if (pathname.startsWith("/settings/verify-email")) return null;

  return (
    <footer dir="rtl" className="relative mt-12 sm:mt-24 border-t border-slate-200 bg-white print:hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,#dbeafe_0%,transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,#f0fdf4_0%,transparent_50%)]" />

      <div className="container relative z-10 mx-auto max-w-7xl px-4 sm:px-6">

        {/* TOP */}
        <div className="grid gap-8 sm:gap-12 py-10 sm:py-16 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">

          {/* BRAND */}
          <div className="sm:col-span-2 lg:col-span-2">
            <div className="mb-4 sm:mb-5 flex items-center gap-2 sm:gap-3">
              <Image
                src="/icon.png"
                alt="دَيني"
                width={60}
                height={60}
                className="h-12 sm:h-14 lg:h-16 w-auto object-contain flex rounded-xl sm:rounded-2xl bg-linear-to-br"
                priority
              />
              <div>
                <h3 className="text-lg sm:text-xl font-black tracking-tight text-slate-900">دَيني</h3>
                <p className="text-[10px] sm:text-xs font-semibold text-slate-400">Debt Management System</p>
              </div>
            </div>

            <p className="max-w-sm text-xs sm:text-sm leading-relaxed text-slate-600">
              نظام ذكي لإدارة ديون العملاء للمحلات الصغيرة والبقالات بطريقة بسيطة واحترافية.
            </p>

            <div className="mt-3 sm:mt-5 flex flex-wrap gap-1.5 sm:gap-2">
              {["🔒 آمن ومحمي", "🌐 واجهة عربية", "⚡ سريع وسهل"].map((f) => (
                <span key={f} className="rounded-full border border-slate-200 bg-slate-50 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold text-slate-600">
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h4 className="mb-3 sm:mb-5 text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400">روابط سريعة</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { href: "/home",    label: "الرئيسية"       },
                { href: "/pricing", label: "الأسعار"         },
                { href: "/login",   label: "تسجيل الدخول"    },
                { href: "/register",label: "إنشاء حساب"      },
                { href: "/dashboard",label:"لوحة التحكم"     },
                { href: "/support", label: "الدعم الفني"      },
              ].map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="group flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-slate-600 transition hover:text-blue-600">
                    <span className="inline-block h-1 w-2.5 sm:w-3 rounded-full bg-slate-300 transition group-hover:w-4 group-hover:bg-blue-500" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* PLANS */}
          <div>
            <h4 className="mb-3 sm:mb-5 text-[10px] sm:text-sm font-black uppercase tracking-widest text-slate-400">الباقات</h4>
            <ul className="space-y-2 sm:space-y-3">
              {[
                { label: "الباقة المجانية",   badge: "مجاني",       color: "emerald" },
                { label: "الباقة الأساسية",   badge: "أساسي",       color: "blue"    },
                { label: "الباقة الاحترافية", badge: "احترافي ✦",   color: "purple"  },
              ].map((p) => (
                <li key={p.label}>
                  <Link href="/pricing" className="group flex items-center justify-between transition hover:text-blue-600">
                    <span className="text-xs sm:text-sm text-slate-600 group-hover:text-blue-600">{p.label}</span>
                    <span className={`rounded-full px-1.5 sm:px-2 py-0.5 text-[9px] sm:text-[10px] font-black ${p.color === "emerald" ? "bg-emerald-100 text-emerald-700" : p.color === "blue" ? "bg-blue-100 text-blue-700" : "bg-purple-100 text-purple-700"}`}>
                      {p.badge}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <Link href="/register" className="mt-4 sm:mt-6 inline-flex w-full items-center justify-center rounded-xl sm:rounded-2xl bg-blue-600 px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:bg-blue-700">
              ابدأ مجاناً ←
            </Link>
          </div>
        </div>

        {/* POLICIES ROW */}
        <div className="border-t border-slate-100 py-4 sm:py-5">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 sm:gap-x-8">
            {[
              { href: "/settings/terms",   label: "شروط الخدمة"      },
              { href: "/settings/privacy", label: "سياسة الخصوصية"   },
              { href: "/settings/refund",  label: "سياسة الاسترداد"   },
              { href: "/support", label: "الدعم الفني"        },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs sm:text-sm font-semibold text-slate-500 transition hover:text-blue-600"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="flex flex-col items-center justify-between gap-3 sm:gap-4 border-t border-slate-200 py-4 sm:py-6 sm:flex-row">
          <p className="text-[10px] sm:text-sm font-medium text-slate-500 text-center sm:text-right">
            © {new Date().getFullYear()} دَيني — جميع الحقوق محفوظة
          </p>

          <div className="flex items-center gap-3 sm:gap-6 text-[9px] sm:text-sm text-slate-400 flex-wrap justify-center">
            <span className="flex items-center gap-1 sm:gap-1.5"><span className="text-xs sm:text-base">💳</span> بدون بطاقة ائتمان</span>
            <span className="h-3 w-px bg-slate-200 hidden sm:block" />
            <span className="flex items-center gap-1 sm:gap-1.5"><span className="text-xs sm:text-base">🔓</span> إلغاء في أي وقت</span>
            <span className="h-3 w-px bg-slate-200 hidden sm:block" />
            <span className="flex items-center gap-1 sm:gap-1.5"><span className="text-xs sm:text-base">🇸🇦</span> صُنع بالسعودية</span>
          </div>
        </div>

      </div>
    </footer>
  );
}