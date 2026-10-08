/* eslint-disable @typescript-eslint/no-explicit-any */
import { signIn } from "next-auth/react";

export const isNativeApp = () =>
  typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();

// Google sign-in: in the native app it must run in the system browser
// (Google blocks embedded WebViews); on the web it's the normal redirect.
export async function googleSignIn() {
  if (isNativeApp()) {
    const { Browser } = await import("@capacitor/browser");
    await Browser.open({ url: `${window.location.origin}/mobile-auth` });
    return;
  }
  await signIn("google", { callbackUrl: "/dashboard" });
}
