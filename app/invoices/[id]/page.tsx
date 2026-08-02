// ═══════════════════════════════════════════
// InvoicePrintPage — app/invoices/[id]/page.tsx
// ═══════════════════════════════════════════
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function InvoicePrintPage() {
  const params    = useParams();
  const invoiceId = params.id as string;
  const { data: session } = useSession();

  const [invoice,  setInvoice]  = useState<any>(null);
  const [customer, setCustomer] = useState<any>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [downloading, setDownloading] = useState(false);

  const shopName = (session?.user as any)?.shopName || session?.user?.name || "متجري";

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setInvoice(data);
        setCustomer(data.customerId);
      } catch {
        setError("لم يتم العثور على الفاتورة");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [invoiceId]);

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white px-6 py-5 sm:px-8 sm:py-6 text-center shadow-xl">
          <div className="mx-auto mb-3 sm:mb-4 h-10 w-10 sm:h-12 sm:w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm sm:text-base font-bold text-slate-700">جاري تحميل الفاتورة...</p>
        </div>
      </main>
    );
  }

  if (error || !invoice) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-4xl sm:text-5xl">😔</div>
          <h2 className="text-xl sm:text-2xl font-bold text-red-600">الفاتورة غير موجودة</h2>
          <Link href="/customers" className="mt-5 inline-flex rounded-xl sm:rounded-2xl bg-blue-600 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-bold text-white hover:bg-blue-700">
            ← العملاء
          </Link>
        </div>
      </main>
    );
  }

  const invoiceDate = invoice.date ? new Date(invoice.date) : new Date();
  const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null;

  const handleDownloadPDF = async () => {
    const card = document.getElementById("invoice-card");
    if (!card) return;
    setDownloading(true);

   try{
    const { toPng } = await import("html-to-image");
    const { jsPDF } = await import("jspdf");

    const dataUrl = await toPng(card, {
      pixelRatio: 2,
      backgroundColor: "#ffffff",
    });

    const img = new window.Image();
    img.src = dataUrl;
    await new Promise(res => { img.onload = res; });

    const mm = (px: number) => (px * 25.4) / 96;
    const imgW = mm(img.width / 2);
    const imgH = mm(img.height / 2);

    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [imgW, imgH] });
    pdf.addImage(dataUrl, "PNG", 0, 0, imgW, imgH);

    const fileName = `فاتورة-${invoice._id?.slice(-6)}.pdf`;
    pdf.save(fileName);

    const blob = pdf.output("blob");
    if (navigator.canShare?.({ files: [new File([blob], fileName, { type: "application/pdf" })] })) {
      await navigator.share({ title: "فاتورة بيع", files: [new File([blob], fileName, { type: "application/pdf" })] });
    }
   }catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }
    
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 py-6 sm:py-10 print:bg-white print:py-0">

      {/* Action bar */}
      <div className="mx-auto mb-5 sm:mb-6 flex max-w-xl items-center justify-between px-3 sm:px-6 print:hidden gap-2 sm:gap-0">
        <Link
          href={`/customers/${customer?._id}`}
          className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl border border-slate-200 bg-white px-3 sm:px-5 py-2 sm:py-3 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← رجوع للعميل
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60 active:scale-95"
        >
  {downloading
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : "📥"
          }
          {downloading ? "جاري التنزيل..." : "تنزيل PDF"}        </button>
      </div>

      {/* Invoice card */}
      <div className="mx-auto max-w-xl px-3 sm:px-6 print:max-w-none print:px-0">
        <div id="invoice-card" className="overflow-hidden rounded-2xl sm:rounded-3xl bg-white shadow-xl print:rounded-none print:shadow-none">

          {/* Top stripe */}
          <div className="h-1.5 bg-gradient-to-l from-blue-600 to-indigo-600" />

          <div className="p-5 sm:p-8">

            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-100 p-3 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4 -mr-5">
                <Image
                  src="/logo_ar.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
                <div className="-mr-4">
                  <p className="text-sm  font-bold text-slate-900">{shopName}</p>
                  <p className="text-xs mt-0.5 text-slate-400">فاتورة بيع بالدين</p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-0.5 sm:mb-1">رقم الفاتورة</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900">#{invoice._id?.slice(-6).toUpperCase()}</p>
                <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-slate-500">
                  {invoiceDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* معلومات العميل */}
            <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-5">
              <div>
                <p className="mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-bold text-slate-400">العميل</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{customer?.name || "غير محدد"}</p>
              </div>
              <div className="text-left">
                <p className="mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-bold text-slate-400">رقم الجوال</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{customer?.phone || "—"}</p>
              </div>
              {dueDate && (
                <div className="col-span-2 border-t border-slate-200 pt-2 sm:pt-3 mt-0.5 sm:mt-1">
                  <p className="mb-0.5 sm:mb-1 text-[10px] sm:text-xs font-bold text-slate-400">موعد السداد</p>
                  <p className="text-xs sm:text-sm font-bold text-amber-600">
                    {dueDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            {/* جدول البضاعة */}
            <div className="mb-4 sm:mb-6 overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200">
              <table className="w-full">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-right text-[10px] sm:text-xs font-bold text-slate-400">الوصف</th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-center text-[10px] sm:text-xs font-bold text-slate-400">الكمية</th>
                    <th className="px-3 sm:px-5 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-bold text-slate-400">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-t border-slate-100 px-3 sm:px-5 py-4 sm:py-5 text-xs sm:text-sm text-slate-700">
                      {invoice.description || "—"}
                    </td>
                    <td className="border-t border-slate-100 px-3 sm:px-5 py-4 sm:py-5 text-center text-xs sm:text-sm text-slate-600">١</td>
                    <td className="border-t border-slate-100 px-3 sm:px-5 py-4 sm:py-5 text-left text-base sm:text-lg font-black text-red-600">
                      {Number(invoice.amount).toLocaleString("ar-SA")} يالر
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* الإجمالي */}
            <div className="mb-5 sm:mb-8 flex justify-end">
              <div className="rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 px-5 sm:px-7 py-4 sm:py-5 text-left min-w-[160px] sm:min-w-[200px]">
                <p className="text-[10px] sm:text-xs font-bold text-blue-500 mb-0.5 sm:mb-1">الإجمالي المستحق</p>
                <p className="text-2xl sm:text-4xl font-black text-blue-700">
                  {Number(invoice.amount).toLocaleString("ar-SA")}
                </p>
                <p className="text-xs sm:text-sm font-bold text-blue-400 mt-0.5 sm:mt-1">ريال سعودي</p>
              </div>
            </div>

            {/* التوقيعات */}
            <div className="mb-5 sm:mb-7 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="h-8 sm:h-10 border-b border-slate-300" />
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-400">توقيع البائع</p>
              </div>
              <div className="text-center">
                <div className="h-8 sm:h-10 border-b border-slate-300" />
                <p className="mt-1.5 sm:mt-2 text-[10px] sm:text-xs text-slate-400">توقيع العميل</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-4 sm:pt-5 text-center text-[10px] sm:text-xs text-slate-400">
              هذه الفاتورة وثيقة رسمية • شكراً لثقتكم
            </div>
          </div>

          {/* Bottom stripe */}
          <div className="h-1 bg-gradient-to-l from-blue-600 to-indigo-600" />
        </div>
      </div>
    </div>
  );
}