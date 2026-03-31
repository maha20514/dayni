/* eslint-disable @typescript-eslint/no-unused-vars */


import { NextRequest as PaymentRequest, NextResponse as PaymentResponse } from "next/server";
import { connectDB as connectPaymentDB } from "@/lib/mongodb";
import {Payment} from "@/models/Payment";
import {Customer} from "@/models/Customer";

export async function POST(req: PaymentRequest) {
  try {
    await connectPaymentDB();

    const body = await req.json();

    const payment = await Payment.create({
      userId: body.userId,
      customerId: body.customerId,
      amount: body.amount
    });

    await Customer.findByIdAndUpdate(body.customerId, {
      $inc: { totalDebt: -body.amount }
    });

    return PaymentResponse.json(payment, { status: 201 });
  } catch (error) {
    return PaymentResponse.json({ error: "Failed to create payment" }, { status: 500 });
  }
}