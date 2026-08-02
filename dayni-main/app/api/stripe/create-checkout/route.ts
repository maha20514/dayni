/* eslint-disable @typescript-eslint/no-explicit-any */
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    await connectDB(); // ✅ مضاف

    const { plan, userId } = await req.json();

    if (!plan || !userId) {
      return NextResponse.json(
        { error: "Missing plan or userId" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId); // ✅ بعد connectDB

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const priceMap: Record<string, string | undefined> = {
      basic: process.env.STRIPE_BASIC_PRICE_ID,
      pro:   process.env.STRIPE_PRO_PRICE_ID,
    };

    const priceId = priceMap[plan];

    if (!priceId) {
      return NextResponse.json(
        { error: "Invalid plan or missing price ID" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/billing/success`,
      cancel_url:  `${process.env.NEXT_PUBLIC_SITE_URL}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        plan: plan, // ✅ مُصحَّح — متغير وليس ثابت
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe error:", error);
    return NextResponse.json(
      { error: error.message || "Stripe error" },
      { status: 500 }
    );
  }
}