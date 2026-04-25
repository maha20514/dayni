"use client";

import CheckoutContent from "@/app/components/CheckoutContent";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}