// app/api/lemonsqueezy/webhook/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

function verifySignature(rawBody: string, signature: string | null, secret: string) {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const sig = Buffer.from(signature, "utf8");

  if (digest.length !== sig.length) return false;
  return crypto.timingSafeEqual(digest, sig);
}

function getMaxCustomers(plan: string) {
  if (plan === "pro") return 999999;
  if (plan === "basic") return 100;
  return 10;
}

export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-signature");

  const secret = process.env.LEMON_WEBHOOK_SECRET!;
  const isValid = verifySignature(rawBody, signature, secret);

  if (!isValid) {
    console.error("❌ LemonSqueezy webhook signature mismatch");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let payload: any;
  try {
    payload = JSON.parse(rawBody);
  } catch (err) {
    console.error("❌ Failed to parse webhook body:", err);
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  await connectDB();

  const eventName = payload?.meta?.event_name as string;
  const customData = payload?.meta?.custom_data || {};
  const attributes = payload?.data?.attributes || {};

  // ✅ LemonSqueezy ترجع المفاتيح بصيغة snake_case دائماً
  const userId = customData.user_id;
  const plan = customData.plan;

  console.log("📩 LemonSqueezy event:", eventName, "| userId:", userId, "| plan:", plan);

  // ── اشتراك جديد / طلب جديد ──────────────────────────────
  if (eventName === "order_created" || eventName === "subscription_created") {
    if (!userId || !plan) {
      console.error("❌ Missing userId or plan in custom_data", customData);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const maxCustomers = getMaxCustomers(plan);

    const updated = await User.findByIdAndUpdate(
  userId,
  {
    plan,
    isActive: true,
    subscriptionStart: new Date(),
    lemonCustomerId: attributes.customer_id || null,
    lemonSubscriptionId:
      eventName === "subscription_created" ? payload.data.id : undefined,
  },
  { new: true }
);

if (!updated) {
  console.error("❌ User not found in DB:", userId);
  return NextResponse.json({ error: "User not found" }, { status: 404 });
}

// 🔍 DEBUG: اطبع المستند الفعلي المُرجَع من MongoDB
console.log("🔍 Returned doc from DB:", JSON.stringify({
  _id: updated._id,
  plan: updated.plan,
  isActive: updated.isActive,
  lemonSubscriptionId: updated.lemonSubscriptionId,
}));

console.log(`✅ Subscription activated — userId: ${userId}, plan: ${plan}`);

    if (!updated) {
      console.error("❌ User not found in DB:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`✅ Subscription activated — userId: ${userId}, plan: ${plan}`);
  }

  // ── تحديث الاشتراك (تجديد/تغيير) ─────────────────────────
  if (eventName === "subscription_updated") {
    const status = attributes.status; // active, on_trial, cancelled, expired, past_due, unpaid, paused...
    const subId = payload.data.id;

    // ✅ on_trial يُعتبر فعّالاً مثل active — المستخدم في فترة تجريبية لكنه يستخدم الميزات
    if (["active", "on_trial"].includes(status)) {
      await User.findOneAndUpdate(
        { lemonSubscriptionId: subId },
        { isActive: true }
      );
    } else if (["cancelled", "expired", "unpaid", "past_due"].includes(status)) {
      await User.findOneAndUpdate(
        { lemonSubscriptionId: subId },
        {
          plan: "free",
          maxCustomers: 10,
          isActive: false,
          subscriptionEnd: new Date(),
        }
      );
    }

    console.log(`ℹ️ Subscription updated — subId: ${subId}, status: ${status}`);
  }

  // ── إلغاء / انتهاء الاشتراك ──────────────────────────────
  if (eventName === "subscription_cancelled" || eventName === "subscription_expired") {
    const subId = payload.data.id;

    await User.findOneAndUpdate(
      { lemonSubscriptionId: subId },
      {
        plan: "free",
        maxCustomers: 10,
        isActive: false,
        subscriptionEnd: new Date(),
      }
    );

    console.log("❌ Subscription cancelled/expired — subId:", subId);
  }

  return NextResponse.json({ received: true });
}

