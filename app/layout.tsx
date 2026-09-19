import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Providers from "./providers";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Dayni | دَيني — Debt Management",
  description: "Manage customers, invoices, and payments — إدارة العملاء والفواتير والمدفوعات",
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
  // NOTE: lang/dir start as "ar"/"rtl" for the first paint (matches the
  // app's historical default) and are then synced client-side by
  // <LanguageProvider> to the user's stored/browser preference.
  // suppressHydrationWarning avoids a false-positive warning for that
  // intentional, one-time client-side correction.
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className="bg-slate-50 min-h-screen flex flex-col" suppressHydrationWarning>
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
