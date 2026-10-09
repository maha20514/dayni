/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/mongodb";
import { DeviceToken } from "@/models/DeviceToken";

// Needs FIREBASE_SERVICE_ACCOUNT (the service-account JSON, as one env string).
// iOS goes through FCM too once the APNs key is uploaded in Firebase console.
let messaging: any = null;
async function getMessaging() {
  if (messaging) return messaging;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) return null;
  const admin = (await import("firebase-admin")).default;
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(JSON.parse(raw)) });
  }
  messaging = admin.messaging();
  return messaging;
}

export async function sendPushToUser(userId: string, title: string, body: string) {
  try {
    const m = await getMessaging();
    if (!m) return;
    await connectDB();
    const devices = await DeviceToken.find({ userId });
    if (!devices.length) return;
    const res = await m.sendEachForMulticast({
      tokens: devices.map((d: any) => d.token),
      notification: { title, body },
    });
    // Drop tokens FCM says are dead.
    const dead = res.responses
      .map((r: any, i: number) =>
        !r.success && /registration-token-not-registered|invalid-argument/.test(r.error?.code ?? "")
          ? devices[i].token
          : null
      )
      .filter(Boolean);
    if (dead.length) await DeviceToken.deleteMany({ token: { $in: dead } });
  } catch (e) {
    console.error("push failed", e);
  }
}
