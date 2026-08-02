/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function PurchaseDebtsPage() {
  const params         = useParams();
  const purchasedebtId = params.id as string;
  const { data: session } = useSession();

  const [purchasedebt, setPurchaseDebt] = useState<any>(null);
  const [supplier,     setSupplier]     = useState<any>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [downloading,  setDownloading]  = useState(false);

  const shopName = (session?.user as any)?.shopName || session?.user?.name || "متجري";
  const fmt = (d: Date) => d.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  useEffect(() => {
    const fetchPurchaseDebt = async () => {
      try {
        const res = await fetch(`/api/purchase-debts/${purchasedebtId}`);
        if (!res.ok) throw new Error("not found");
        const data = await res.json();
        setPurchaseDebt(data);
        setSupplier(data.supplierId);
      } catch {
        setError("لم يتم العثور على الدين الشرائي");
      } finally {
        setLoading(false);
      }
    };
    fetchPurchaseDebt();
  }, [purchasedebtId]);

  const handleDownloadPDF = async () => {
    const invoice = document.getElementById("invoice-card");
    if (!invoice) return;
    setDownloading(true);
    try {
      const { toPng }  = await import("html-to-image");
      const { jsPDF }  = await import("jspdf");

      const dataUrl = await toPng(invoice, {
        pixelRatio:      3,
        quality:         1,
        backgroundColor: "#ffffff",
        skipFonts:       false,
      });

      const img = new window.Image();
      img.src   = dataUrl;
      await new Promise(res => { img.onload = res; });

      const mm   = (px: number) => (px * 25.4) / 96;
      const imgW = mm(img.width  / 3);
      const imgH = mm(img.height / 3);

      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: [imgW, imgH], compress: true });
      pdf.addImage(dataUrl, "PNG", 0, 0, imgW, imgH, "", "FAST");

      const fileName = `فاتورة-دين-${purchasedebt._id?.slice(-6)}.pdf`;
      pdf.save(fileName);
      

      const blob = pdf.output("blob");
      if (navigator.canShare?.({ files: [new File([blob], fileName, { type: "application/pdf" })] })) {
        await navigator.share({ title: "فاتورة دين شراء", files: [new File([blob], fileName, { type: "application/pdf" })] });
      }
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-bold text-slate-700">جاري تحميل الفاتورة...</p>
        </div>
      </main>
    );
  }

  if (error || !purchasedebt) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">😔</div>
          <h2 className="text-xl font-bold text-red-600">الدين الشرائي غير موجود</h2>
          <Link href="/suppliers" className="mt-5 inline-flex rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700">
            ← الموردون
          </Link>
        </div>
      </main>
    );
  }

  const invoiceDate = purchasedebt.date    ? new Date(purchasedebt.date)    : new Date();
  const dueDate     = purchasedebt.dueDate ? new Date(purchasedebt.dueDate) : null;
  const invoiceNum  = purchasedebt._id?.slice(-6).toUpperCase();
  const amount      = Number(purchasedebt.amount).toLocaleString("ar-SA");

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-200 py-6 sm:py-10 print:bg-white print:py-0">

      {/* ── Action bar ── */}
      <div className="mx-auto mb-5 flex max-w-xl items-center justify-between px-4 sm:px-6 print:hidden">
        <Link
          href={`/suppliers/${supplier?._id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← رجوع
        </Link>

        <button
          onClick={handleDownloadPDF}
          disabled={downloading}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition hover:-translate-y-0.5 hover:bg-blue-700 disabled:opacity-60 active:scale-95"
        >
          {downloading
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : "📥"
          }
          {downloading ? "جاري التنزيل..." : "تنزيل PDF"}
        </button>
      </div>

      {/* ── Invoice card ── */}
      <div className="mx-auto max-w-xl px-4 sm:px-6 print:max-w-none print:px-0">
        <div
          id="invoice-card"
          className="overflow-hidden rounded-2xl bg-white shadow-2xl shadow-slate-300/50 print:rounded-none print:shadow-none"
        >

          {/* Top stripe */}
          <div className="h-1.5 bg-gradient-to-l from-blue-600 to-indigo-500" />

          <div className="p-5 sm:p-8">

            {/* ── Header: logo block + invoice number ── */}
             {/* ── Header ── */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 p-3 sm:p-5">
 
            {/* Logo + name */}
            <div className="flex items-center gap-3 -mr-5">
                <Image src="/logo_ar.png" alt="logo" width={48} height={48} className="h-12 w-auto" />
              <div className="-mr-4">
                <p className="text-sm font-bold text-slate-900">{shopName}</p>
                <p className="text-xs text-slate-400 mt-0.5">فاتورة شراء بالدين</p>
              </div>
            </div>
 
            {/* Invoice number */}
            <div className="text-left flex-shrink-0">
              <p className="text-[10px] font-semibold text-slate-400 mb-0.5">رقم الفاتورة</p>
              <p className="text-base font-black text-slate-800 tracking-tight">#{invoiceNum}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{fmt(invoiceDate)}</p>
            </div>
          </div>
 

            {/* ── Supplier info ── */}
            <div className="mb-4 sm:mb-5 grid grid-cols-2 gap-3 sm:gap-4 rounded-xl bg-slate-50 p-3 sm:p-5">
              <div>
                <p className="mb-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-slate-400">المورد</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{supplier?.name || "غير محدد"}</p>
                {supplier?.company && (
                  <p className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">{supplier.company}</p>
                )}
              </div>
              <div className="text-left">
                <p className="mb-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-slate-400">الجوال</p>
                <p className="text-xs sm:text-sm font-bold text-slate-900">{supplier?.phone || "—"}</p>
              </div>

              {dueDate && (
                <div className="col-span-2 border-t border-slate-200 pt-3">
                  <p className="mb-1 text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-slate-400">موعد السداد</p>
                  <p className="text-xs sm:text-sm font-bold text-amber-600">
                    📅 {dueDate.toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              )}
            </div>

            {/* ── Items table ── */}
            <div className="mb-4 sm:mb-5 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-3 sm:px-5 py-2.5 text-right text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-slate-400">الوصف</th>
                    <th className="px-3 sm:px-5 py-2.5 text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-slate-400">الكمية</th>
                    <th className="px-3 sm:px-5 py-2.5 text-left text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-slate-400">المبلغ</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-t border-slate-100 px-3 sm:px-5 py-4 text-xs sm:text-sm text-slate-700">
                      {purchasedebt.description || "—"}
                    </td>
                    <td className="border-t border-slate-100 px-3 sm:px-5 py-4 text-center text-xs sm:text-sm text-slate-500">
                      ١
                    </td>
                    <td className="border-t border-slate-100 px-3 sm:px-5 py-4 text-left text-sm sm:text-lg font-black text-red-600">
                      {amount} يالر
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* ── Total ── */}
            <div className="mb-5 sm:mb-7 flex justify-end">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-5 sm:px-7 py-3 sm:py-4 text-left min-w-[150px] sm:min-w-[190px]">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wide text-blue-400 mb-1.5">الإجمالي المستحق</p>
                <p className="text-2xl sm:text-4xl font-black text-blue-700 leading-none">{amount}</p>
                <p className="text-[10px] sm:text-xs font-semibold text-blue-400 mt-1.5">ريال سعودي</p>
              </div>
            </div>

            {/* ── Signatures ── */}
            <div className="mb-5 sm:mb-6 grid grid-cols-2 gap-4 sm:gap-8">
              <div className="text-center">
                <div className="h-8 sm:h-10 border-b-2 border-dashed border-slate-200" />
                <p className="mt-2 text-[9px] sm:text-[10px] font-semibold text-slate-400">توقيع المستلم</p>
              </div>
              <div className="text-center">
                <div className="h-8 sm:h-10 border-b-2 border-dashed border-slate-200" />
                <p className="mt-2 text-[9px] sm:text-[10px] font-semibold text-slate-400">توقيع المورد</p>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 pt-4 text-center text-[9px] sm:text-[10px] text-slate-400">
              هذه الفاتورة وثيقة رسمية • شكراً لثقتكم
            </div>

          </div>

          {/* Bottom stripe */}
          <div className="h-1 bg-gradient-to-l from-blue-600 to-indigo-500" />
        </div>
      </div>

    </div>
  );
}