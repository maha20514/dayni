// app/api/lemonsqueezy/create-checkout/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  lemonSqueezySetup,
  createCheckout,
} from "@lemonsqueezy/lemonsqueezy.js";

lemonSqueezySetup({
  apiKey: process.env.LEMON_SQUEEZY_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const { plan, userId } = await req.json();

    const variantMap: Record<string, number> = {
      basic: Number(process.env.LEMON_BASIC_VARIANT_ID),
      pro: Number(process.env.LEMON_PRO_VARIANT_ID),
    };

    const variantId = variantMap[plan];

    if (!variantId) {
      return NextResponse.json(
        { error: "Invalid plan" },
        { status: 400 }
      );
    }

    const checkout = await createCheckout(
      process.env.LEMON_STORE_ID!,
      variantId,
      {
        checkoutData: {
          custom: {
            userId,
            plan,
          },
        },

        productOptions: {
          redirectUrl:
            `${process.env.NEXT_PUBLIC_SITE_URL}/pricing/billing/success`,
        },
      }
    );

    const url =
      checkout.data?.data?.attributes?.url;

    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Checkout error" },
      { status: 500 }
    );
  }
}