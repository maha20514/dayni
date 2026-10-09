"use client";

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Runs only inside the Capacitor shell (iOS/Android); a no-op on the web.
export default function NativeBridge() {
  const { status } = useSession();

  // Push registration once the user is signed in.
  useEffect(() => {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.() || status !== "authenticated") return;
    // Push needs Firebase (google-services.json / APNs) set up in the native
    // project; calling register() without it crashes the app on Android.
    // Set NEXT_PUBLIC_PUSH_ENABLED=true only once that setup is done.
    if (process.env.NEXT_PUBLIC_PUSH_ENABLED !== "true") return;
    let cleanup: (() => void) | undefined;

    (async () => {
      const { PushNotifications } = await import("@capacitor/push-notifications");
      const perm = await PushNotifications.requestPermissions();
      if (perm.receive !== "granted") return;
      const reg = await PushNotifications.addListener("registration", async ({ value }) => {
        await fetch("/api/devices", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: value, platform: cap.getPlatform() }),
        });
      });
      const tap = await PushNotifications.addListener("pushNotificationActionPerformed", () => {
        window.location.href = "/notifications";
      });
      await PushNotifications.register();
      cleanup = () => { reg.remove(); tap.remove(); };
    })().catch(console.error);

    return () => cleanup?.();
  }, [status]);

  // Android back button + external links (wa.me, tel:, mailto:, other hosts).
  useEffect(() => {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    let remove: (() => void) | undefined;

    (async () => {
      const { App } = await import("@capacitor/app");
      const h = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) window.history.back(); else App.exitApp();
      });
      // Google sign-in finished in the system browser -> app.dayni.mobile://auth?code=...
      const u = await App.addListener("appUrlOpen", async ({ url }) => {
        const parsed = new URL(url);
        const code = parsed.searchParams.get("code");
        if (parsed.protocol !== "app.dayni.mobile:" || !code) return;
        try { (await import("@capacitor/browser")).Browser.close(); } catch {}
        await signIn("mobile-code", { code, callbackUrl: "/dashboard" });
      });
      remove = () => { h.remove(); u.remove(); };
    })().catch(console.error);

    const onClick = async (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest("a") as HTMLAnchorElement | null;
      if (!a?.href || a.target === "_self") return;
      const url = new URL(a.href, location.href);
      const internal = url.origin === location.origin;
      if (internal) return;
      e.preventDefault();
      const { Browser } = await import("@capacitor/browser");
      await Browser.open({ url: url.href });
    };
    document.addEventListener("click", onClick, true);

    return () => { remove?.(); document.removeEventListener("click", onClick, true); };
  }, []);

  return null;
}
