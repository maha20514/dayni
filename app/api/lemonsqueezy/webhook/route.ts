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


async function downgrade(subId: string) {
  await User.findOneAndUpdate(
    { lemonSubscriptionId: subId },
    { plan: "free", maxCustomers: 10, isActive: false, subscriptionEnd: new Date() }
  );
}

// A cancelled subscription stays usable until the end of the period already paid for.
async function endOrScheduleEnd(subId: string, endsAt?: string | null) {
  const end = endsAt ? new Date(endsAt) : null;
  if (end && end.getTime() > Date.now()) {
    await User.findOneAndUpdate({ lemonSubscriptionId: subId }, { subscriptionEnd: end });
  } else {
    await downgrade(subId);
  }
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

  // custom_data keys come back exactly as sent by create-checkout (camelCase);
  // also accept snake_case for older checkouts.
  const userId = customData.userId || customData.user_id;
  const plan = customData.plan;

  console.log("📩 LemonSqueezy event:", eventName, "| userId:", userId, "| plan:", plan);

  // ── اشتراك جديد / طلب جديد (يشمل الفترة التجريبية on_trial) ─────────
  if (eventName === "order_created" || eventName === "subscription_created") {
    if (!userId || !["basic", "pro"].includes(plan)) {
      console.error("❌ Missing/invalid userId or plan in custom_data", customData);
      return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
    }

    const update: Record<string, unknown> = {
      plan,
      maxCustomers: getMaxCustomers(plan),
      isActive: true,
      subscriptionStart: new Date(),
      lemonCustomerId: attributes.customer_id || null,
    };
    if (eventName === "subscription_created") update.lemonSubscriptionId = payload.data.id;
    // Don't let a later order_created wipe the subscription id.
    const updated = await User.findByIdAndUpdate(userId, update, { new: true });

    if (!updated) {
      console.error("❌ User not found in DB:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    console.log(`✅ Subscription activated — userId: ${userId}, plan: ${plan}, event: ${eventName}`);
  }

  // ── تحديث الاشتراك (تجديد/تغيير) ─────────────────────────
  if (eventName === "subscription_updated") {
    const status = attributes.status; // active, on_trial, cancelled, expired, past_due, unpaid, paused...
    const subId = payload.data.id;

    if (["active", "on_trial"].includes(status)) {
      await User.findOneAndUpdate({ lemonSubscriptionId: subId }, { isActive: true });
    } else if (status === "cancelled") {
      await endOrScheduleEnd(subId, attributes.ends_at);
    } else if (["expired", "unpaid", "past_due"].includes(status)) {
      await downgrade(subId);
    }

    console.log(`ℹ️ Subscription updated — subId: ${subId}, status: ${status}`);
  }

  // ── إلغاء: يبقى مفعّلاً حتى نهاية الفترة المدفوعة / انتهاء ─────────
  if (eventName === "subscription_cancelled") {
    await endOrScheduleEnd(payload.data.id, attributes.ends_at);
    console.log("ℹ️ Subscription cancelled — subId:", payload.data.id);
  }
  if (eventName === "subscription_expired") {
    await downgrade(payload.data.id);
    console.log("❌ Subscription expired — subId:", payload.data.id);
  }

  return NextResponse.json({ received: true });
}

