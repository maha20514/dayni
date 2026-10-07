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
Flow: `NativeBridge` registers the token -> `POST /api/devices` -> `createNotification()` also calls `sendPushToUser()`.

## Still to do before store submission
- **Google sign-in**: Google blocks OAuth inside WebViews. Add native Google sign-in (e.g. `@capgo/capacitor-social-login`) and a credentials endpoint, or restrict the app to email/password.
- **Payments**: Apple requires In-App Purchase for digital subscriptions; LemonSqueezy checkout inside the iOS app risks rejection. Options: hide upgrade UI on iOS, or add IAP (RevenueCat).
- **Apple guideline 4.2**: add a biometric lock (`@capgo/capacitor-native-biometric`) so the app is more than a website wrapper.
- Privacy policy URL + account deletion in-app (Apple requirement).
- Security fixes noted in review (unauthenticated/userId-trusting API routes, hardcoded ADMIN_SECRET fallback).
