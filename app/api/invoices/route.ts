/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest as InvoiceRequest, NextResponse as InvoiceResponse } from "next/server";
import { connectDB as connectInvoiceDB } from "@/lib/mongodb";
import {Invoice} from "@/models/Invoice";
import {Customer}  from "@/models/Customer";

export async function POST(req: InvoiceRequest) {
  try {
    await connectInvoiceDB();

    const body = await req.json();

    const invoice = await Invoice.create({
       userId: body.userId,
      customerId: body.customerId,
      amount: body.amount,
      description: body.description
    });

    await Customer.findByIdAndUpdate(body.customerId, {
      $inc: { totalDebt: body.amount }
    });

    return InvoiceResponse.json(invoice, { status: 201 });
  } catch (error) {
    return InvoiceResponse.json({ error: "Failed to create invoice" }, { status: 500 });
    }
}