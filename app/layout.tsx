import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";

export const metadata: Metadata = {
  title: "نظام إدارة الديون",
  description: "إدارة العملاء والفواتير والمدفوعات",
  icons: { icon: "/favicon.ico" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-50 font-sans antialiased min-h-screen">
        <Navbar />

        <main className="container mx-auto py-8 px-6">
          {children}
        </main>
      </body>
    </html>
  );
}