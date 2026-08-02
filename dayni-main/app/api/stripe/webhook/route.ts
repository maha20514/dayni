/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { headers } from "next/headers";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-04-22.dahlia",
});

export async function POST(req: NextRequest) {
  const body      = await req.text();
  const signature = (await headers()).get("stripe-signature")!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error("Webhook signature error:", err.message);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  await connectDB();

  // ── اشتراك جديد ──────────────────────────────
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const userId = session.metadata?.userId;
    const plan   = session.metadata?.plan;

    if (!userId || !plan) {
      console.error("❌ Missing userId or plan in metadata", session.metadata);
      return NextResponse.json(
        { error: "Missing metadata" },
        { status: 400 }
      );
    }

    const maxCustomers =
      plan === "pro"   ? 999999 :
      plan === "basic" ? 100    : 10; // ✅ مُصحَّح

    const updated = await User.findByIdAndUpdate(
      userId,
      {
        plan,
        isActive:             true,
        subscriptionStart:    new Date(),
        stripeCustomerId:     session.customer,
        stripeSubscriptionId: session.subscription,
        maxCustomers,
      },
      { new: true } // ✅ يرجع المستخدم بعد التحديث للتحقق
    );

    if (!updated) {
      console.error("❌ User not found in DB:", userId);
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    console.log(`✅ Subscription activated — userId: ${userId}, plan: ${plan}`);
  }

  // ── إلغاء اشتراك ─────────────────────────────
  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId   = subscription.customer as string;

    await User.findOneAndUpdate(
      { stripeCustomerId: customerId },
      {
        plan:         "free",
        maxCustomers: 10,
        isActive:     false,
        subscriptionEnd: new Date(), // ✅ سجّل وقت الإلغاء
      }
    );

    console.log("❌ Subscription cancelled — customerId:", customerId);
  }

  return NextResponse.json({ received: true });
}