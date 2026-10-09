# Dayni mobile (Capacitor)

The native app is a shell that loads https://dayni.app (see `capacitor.config.ts`).

## One-time setup (on your machine)
```bash
npm install
npx cap add android
npx cap add ios          # Mac only
npm run cap:assets       # needs resources/icon.png (1024²) + resources/splash.png (2732²)
npx cap sync
npm run cap:android      # opens Android Studio
npm run cap:ios          # opens Xcode
```

## Push notifications
1. Create a Firebase project; add Android app `app.dayni.mobile` -> put `google-services.json` in `android/app/`.
2. iOS: add iOS app, put `GoogleService-Info.plist` in Xcode, upload an APNs key in Firebase, enable Push Notifications + Background Modes capabilities.
3. Server: set `FIREBASE_SERVICE_ACCOUNT` (service-account JSON as one string) in Vercel.
4. Only then set `NEXT_PUBLIC_PUSH_ENABLED=true` (Vercel + rebuild). Without it the app skips push registration; calling it with no Firebase config crashes Android.
Flow: `NativeBridge` registers the token -> `POST /api/devices` -> `createNotification()` also calls `sendPushToUser()`.

## Still to do before store submission
- **Google sign-in**: Google blocks OAuth inside WebViews. Add native Google sign-in (e.g. `@capgo/capacitor-social-login`) and a credentials endpoint, or restrict the app to email/password.
- **Payments**: Apple requires In-App Purchase for digital subscriptions; LemonSqueezy checkout inside the iOS app risks rejection. Options: hide upgrade UI on iOS, or add IAP (RevenueCat).
- **Apple guideline 4.2**: add a biometric lock (`@capgo/capacitor-native-biometric`) so the app is more than a website wrapper.
- Privacy policy URL + account deletion in-app (Apple requirement).
- Security fixes noted in review (unauthenticated/userId-trusting API routes, hardcoded ADMIN_SECRET fallback).

## Google sign-in in the app (system browser + one-time code)
Flow: app opens `/mobile-auth` in the system browser -> Google -> `/api/mobile-auth/complete`
issues a 60 s single-use code -> redirects to `app.dayni.mobile://auth?code=…` -> `NativeBridge`
catches it and calls `signIn("mobile-code")` inside the WebView.

Native one-time setup (the scheme must be registered or the app won't reopen):
- **Android** `android/app/src/main/AndroidManifest.xml`, inside the main `<activity>`:
  ```xml
  <intent-filter>
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="app.dayni.mobile" />
  </intent-filter>
  ```
- **iOS** `ios/App/App/Info.plist`: add `CFBundleURLTypes` with `CFBundleURLSchemes` = `app.dayni.mobile`.
Then `npx cap sync`. This only works once the site changes are deployed to dayni.app.
