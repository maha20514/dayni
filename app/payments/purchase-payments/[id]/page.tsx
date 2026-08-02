/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

export default function PurchasePaymentPrintPage() {
  const params = useParams();
  const purchasepaymentId = params.id as string;
  const { data: session } = useSession();

  const [purchasePayment, setpurchasePayment] = useState<any>(null);
  const [supplier, setSupplier] = useState<any>(null);
  const [loading, setLoading] = useState(true);
   const [downloading,  setDownloading]  = useState(false);

  const shopName = (session?.user as any)?.shopName || session?.user?.name || "متجري";

  useEffect(() => {
    const fetchPurchasePayment = async () => {
      try {
        const res = await fetch(`/api/purchase-payments/${purchasepaymentId}`);
        if (res.ok) {
          const data = await res.json();
          setpurchasePayment(data);
          setSupplier(data.supplier);
        }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchPurchasePayment();
  }, [purchasepaymentId]);

  if (loading) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-center shadow-xl">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-emerald-600" />
          <p className="text-sm font-bold text-slate-700">جاري تحميل السند...</p>
        </div>
      </main>
    );
  }

  const handleDownloadPDF = async () => {
    const payment = document.getElementById("payment-card");
    if (!payment) return;
    setDownloading(true);
    try{
       const { toPng } = await import("html-to-image");
    const { jsPDF } = await import("jspdf");

    const dataUrl = await toPng(payment, {
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

    const fileName = `سند-تسديد-${purchasePayment._id?.slice(-6)}.pdf`;
    pdf.save(fileName);

    const blob = pdf.output("blob");
    if (navigator.canShare?.({ files: [new File([blob], fileName, { type: "application/pdf" })] })) {
      await navigator.share({ title: "سند تسديد دفعة", files: [new File([blob], fileName, { type: "application/pdf" })] });
    }

    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setDownloading(false);
    }

   
  };

  if (!purchasePayment) {
    return (
      <main dir="rtl" className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="text-center">
          <div className="mb-4 text-5xl">😔</div>
          <h2 className="text-xl font-bold text-red-600">السند غير موجود</h2>
          <Link href="/suppliers" className="mt-5 inline-flex rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700">
            ← الموردون
          </Link>
        </div>
      </main>
    );
  }

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 py-6 sm:py-10 print:bg-white print:py-0">

      {/* Action bar */}
      <div className="mx-auto mb-5 sm:mb-7 flex max-w-xl items-center justify-between px-4 sm:px-6 print:hidden">
        <Link
          href={`/suppliers/${supplier?._id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          ← رجوع 
        </Link>
        <button
          onClick={handleDownloadPDF}
          className="inline-flex items-center gap-2 sm:gap-2 rounded-xl sm:rounded-2xl bg-emerald-600 px-4 sm:px-5 py-2 sm:py-2-5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
           {downloading
            ? <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            : "📥"
          }
          {downloading ? "جاري التنزيل..." : "تنزيل PDF"}
        </button>
      </div>

      {/* Receipt card */}
      <div className="mx-auto max-w-xl px-4 sm:px-6 print:max-w-none print:px-0">
        <div id="payment-card" className="overflow-hidden rounded-2xl shadow-slate-300/50 bg-white shadow-2xl print:rounded-none print:shadow-none">

          {/* Top stripe */}
          <div className="h-1.5 bg-gradient-to-l from-emerald-500 to-teal-500" />

          <div className="p-5 sm:p-8">

            {/* Header */}
            <div className="flex items-start justify-between border-b gap-3 border-slate-100 p-3 sm:p-5">
              <div className="flex items-center gap-3 sm:gap-4 -mr-5">
                <Image
                  src="/logo_ar.png"
                  alt="Logo"
                  width={48}
                  height={48}
                  className="h-12 w-auto"
                />
                <div className="-mr-4">
                  <p className="text-sm font-bold text-slate-900">{shopName}</p>
                  <p className="text-xs mt-0.5 text-slate-400">سند تسديد دفعة</p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-[10px] sm:text-xs font-bold text-slate-400 mb-1">رقم السند</p>
                <p className="text-lg sm:text-2xl font-black text-slate-900">#{purchasePayment._id?.slice(-6).toUpperCase()}</p>
                <p className="mt-1 text-[10px] sm:text-xs text-slate-500">
                  {new Date(purchasePayment.date).toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>

            {/* المبلغ */}
            <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-emerald-200 bg-emerald-50 py-6 sm:py-8 text-center">
              <p className="mb-1.5 sm:mb-2 text-[10px] sm:text-xs font-bold tracking-widest text-emerald-500">المبلغ المسدَّد</p>
              <p className="text-3xl sm:text-5xl font-black text-emerald-700">
                {Number(purchasePayment.amount).toLocaleString("ar-SA")}
              </p>
              <p className="mt-1 text-sm sm:text-base font-bold text-emerald-500">ريال سعودي</p>
            </div>

            {/* معلومات المورد */}
            <div className="mb-4 sm:mb-6 grid grid-cols-2 gap-3 sm:gap-4 rounded-xl sm:rounded-2xl bg-slate-50 p-3 sm:p-5">
              <div>
                <p className="mb-1 text-[10px] sm:text-xs font-bold text-slate-400">اسم المورد</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{supplier?.name || "غير محدد"}</p>
                {supplier?.company && (
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{supplier.company}</p>
                )}
              </div>
              <div className="text-left">
                <p className="mb-1 text-[10px] sm:text-xs font-bold text-slate-400">رقم الجوال</p>
                <p className="text-sm sm:text-base font-bold text-slate-900">{supplier?.phone || "—"}</p>
              </div>
            </div>

            {/* ملاحظات */}
            {purchasePayment.notes && (
              <div className="mb-4 sm:mb-6 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 px-4 sm:px-5 py-3 sm:py-4">
                <p className="mb-1 text-[10px] sm:text-xs font-bold text-slate-400">ملاحظات</p>
                <p className="text-xs sm:text-sm text-slate-700">{purchasePayment.notes}</p>
              </div>
            )}

            {/* التوقيعات */}
            <div className="mb-5 sm:mb-7 grid grid-cols-2 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="h-8 sm:h-10 border-b border-slate-300" />
                <p className="mt-2 text-[10px] sm:text-xs text-slate-400">توقيع المسدِّد</p>
              </div>
              <div className="text-center">
                <div className="h-8 sm:h-10 border-b border-slate-300" />
                <p className="mt-2 text-[10px] sm:text-xs text-slate-400">توقيع المورد</p>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-slate-100 pt-4 sm:pt-5 text-center text-[10px] sm:text-xs text-slate-400">
              هذا السند يُعتبر إيصال تسديد رسمي • شكراً لثقتكم
            </div>
          </div>

          {/* Bottom stripe */}
          <div className="h-1 bg-gradient-to-l from-emerald-500 to-teal-500" />
        </div>
      </div>
    </div>
  );
}