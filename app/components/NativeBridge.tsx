"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import NativeSplash from "./NativeSplash";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Runs only inside the Capacitor shell (iOS/Android); a no-op on the web.
export default function NativeBridge() {
  const { status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  // Native app: no purchasing/subscription screens (store payment policies).
  // Hides upgrade links via the .native-app CSS class and bounces direct visits.
  useEffect(() => {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    document.documentElement.classList.add("native-app");
    if (pathname?.startsWith("/pricing") || pathname?.startsWith("/settings/billing")) {
      router.replace("/dashboard");
    }
  }, [pathname, router]);
  const [splash, setSplash] = useState<"gone" | "show" | "fade">("gone");

  // Status bar: brand-blue bar with light icons (always visible, like other apps).
  useEffect(() => {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    (async () => {
      const { StatusBar, Style } = await import("@capacitor/status-bar");
      await StatusBar.setStyle({ style: Style.Dark });
      if (cap.getPlatform() === "android") {
        await StatusBar.setBackgroundColor({ color: "#0033D7" });
        await StatusBar.setOverlaysWebView({ overlay: false });
      }
    })().catch(() => {});
  }, []);

  // Animated splash: the static native splash hands over to this overlay once
  // it has painted, then the overlay fades out.
  useEffect(() => {
    const cap = (window as any).Capacitor;
    if (!cap?.isNativePlatform?.()) return;
    // Play once per app launch, not on every full page load (sign-in redirects etc.).
    let played = false;
    try { played = sessionStorage.getItem("dayni-splash") === "1"; sessionStorage.setItem("dayni-splash", "1"); } catch {}
    if (played) {
      import("@capacitor/splash-screen").then(({ SplashScreen }) => SplashScreen.hide()).catch(() => {});
      return;
    }
    setSplash("show");
    (async () => {
      const { SplashScreen } = await import("@capacitor/splash-screen");
      requestAnimationFrame(() =>
        requestAnimationFrame(() => SplashScreen.hide({ fadeOutDuration: 200 }))
      );
    })().catch(() => {});
    const t1 = setTimeout(() => setSplash("fade"), 3000);
    const t2 = setTimeout(() => setSplash("gone"), 3500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

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

  if (splash === "gone") return null;
  return <NativeSplash fading={splash === "fade"} />;
}
