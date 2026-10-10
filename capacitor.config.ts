import type { CapacitorConfig } from "@capacitor/cli";

// The app is a native shell around the live site: API routes, NextAuth and
// MongoDB all stay on the Next.js server, so the WebView just loads dayni.app.
const config: CapacitorConfig = {
  appId: "app.dayni.mobile",
  appName: "دَيني",
  webDir: "public", // required by Capacitor; unused while server.url is set
  server: {
    url: "https://dayni.app",
    cleartext: false,
    // Keep Google sign-in / checkout in the system browser, everything else in-app.
    allowNavigation: ["dayni.app", "*.dayni.app"],
  }, 

  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
  plugins: {
    // Native splash stays until the web app mounts and hides it (see NativeBridge);
    // 6 s is only a safety net if the page can't load.
    SplashScreen: { launchShowDuration: 6000, launchAutoHide: true, launchFadeOutDuration: 200, backgroundColor: "#f8fafc" },
    // Dark status-bar icons on the light header (like other apps).
    StatusBar: { style: "DARK", backgroundColor: "#0033D7", overlaysWebView: false },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};

export default config;
