"use client";

import CheckoutContent from "@/app/components/CheckoutContent";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}