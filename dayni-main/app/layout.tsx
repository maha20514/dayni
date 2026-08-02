import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "  Dayni |نظام إدارة الديون",
  description: "إدارة العملاء والفواتير والمدفوعات",
  verification: {
    google: "05qEdS1wg3nsHrVNvblj7F6I_BqApzxwk6zgmMyWd0A",
  },
   icons: {
    icon: "/icon.svg",           
    apple: "/icon.svg",
  },
   keywords: [
    "dayni",
    "ديني",
    "نظام إدارة الديون",
    "Debt Management App",
    "Track Debts",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className="bg-slate-50 min-h-screen flex flex-col">
        
        <Providers>
          <Navbar />

          <main className="flex-1 container mx-auto py-8 px-6">
            {children}
            <Toaster richColors position="top-center" />
          </main>

          <Footer />
        </Providers>

      </body>
    </html>
  );
}