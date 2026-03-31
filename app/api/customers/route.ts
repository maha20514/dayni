/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import {Customer} from "@/models/Customer";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const customer = await Customer.create({
      userId: body.userId,
      name: body.name,
      phone: body.phone
    });

    return NextResponse.json(customer, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create customer" }, { status: 500 });
  }
}


export async function GET() {
  try {
    await connectDB();
    const customers = await Customer.find().sort({ createdAt: -1 });
    return NextResponse.json(customers);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch customers" }, { status: 500 });
  }
}