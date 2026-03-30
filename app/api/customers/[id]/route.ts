import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Customer } from "@/models/Customer";
import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }   // ← Change here
) {
  try {
    await connectDB();

    const { id } = await params;   // ← Await params

    if (!id) {
      return NextResponse.json({ error: "Customer ID missing" }, { status: 400 });
    }

    const customer = await Customer.findById(id).lean();
    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    const invoices = await Invoice.find({ customerId: id }).lean();
    const payments = await Payment.find({ customerId: id }).lean();

    const transactions = [
      ...invoices.map((i) => ({ ...i, type: "فاتورة" })),
      ...payments.map((p) => ({ ...p, type: "سند" })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return NextResponse.json({ ...customer, transactions });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}