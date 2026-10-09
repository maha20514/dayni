import type { CapacitorConfig } from "@capacitor/cli";

// The app is a native shell around the live site: API routes, NextAuth and
// MongoDB all stay on the Next.js server, so the WebView just loads dayni.app.
const config: CapacitorConfig = {
  appId: "app.dayni.mobile",
  appName: "دَيني",
  webDir: "public", // required by Capacitor; unused while server.url is set
  /* server: {
    url: "https://dayni.app",
    cleartext: false,
    // Keep Google sign-in / checkout in the system browser, everything else in-app.
    allowNavigation: ["dayni.app", "*.dayni.app"],
  }, */
  server: {
  url: "https://preview.dayni.app",
  cleartext: false,
  allowNavigation: ["dayni.app", "*.dayni.app"],
},
  ios: { contentInset: "always" },
  android: { allowMixedContent: false },
  plugins: {
    SplashScreen: { launchShowDuration: 1500, backgroundColor: "#f8fafc" },
    PushNotifications: { presentationOptions: ["badge", "sound", "alert"] },
  },
};

export default config;
