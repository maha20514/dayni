// app/api/stripe/portal/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const user = await User.findOne({
      email: session.user.email,
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    console.log(user);
console.log(user.stripeCustomerId);

    // لازم يكون محفوظ عندك بعد checkout
    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: "No Stripe customer found" },
        { status: 400 }
      );
    }

    const portalSession =
      await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,

        return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/settings/billing`,
      });

    return NextResponse.json({
      url: portalSession.url,
    });
  } catch (error) {
    console.error("Portal Error:", error);

    return NextResponse.json(
      { error: "Failed to create portal session" },
      { status: 500 }
    );
  }
}