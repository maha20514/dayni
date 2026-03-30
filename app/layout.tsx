import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "نظام إدارة الديون",
  description: "إدارة العملاء والفواتير والمدفوعات",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-50 font-sans antialiased">
        {/* الهيدر الاحترافي */}
        <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
          <div className="container flex justify-between items-center py-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-2xl font-bold">
                د
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">إدارة الديون</h1>
                <p className="text-xs text-slate-500 -mt-1">نظام محاسبي احترافي</p>
              </div>
            </div>

            <nav className="flex items-center gap-8 text-lg">
              <Link href="/customers" className="hover:text-blue-600 transition-colors font-medium">
                العملاء
              </Link>
              {/* يمكنك إضافة روابط أخرى لاحقًا */}
            </nav>
          </div>
        </header>

        <main className="container py-8">
          {children}
        </main>
      </body>
    </html>
  );
}