"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

// Opened in the system browser (Chrome Custom Tab / SFSafariViewController) by
// the native app, because Google blocks OAuth inside embedded WebViews.
export default function MobileAuthPage() {
  useEffect(() => {
    signIn("google", { callbackUrl: "/api/mobile-auth/complete" });
  }, []);

  return (
    <div className="flex min-h-[50vh] items-center justify-center text-slate-500">
      جارٍ التحويل إلى جوجل…
    </div>
  );
}
