/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { Invoice } from "@/models/Invoice";
import { Customer } from "@/models/Customer";
import { User } from "@/models/User";
import { createNotification } from "@/lib/createNotification";
import { sendWhatsApp, waParam, WHATSAPP_ENABLED } from "@/lib/whatsapp";
import { hasFeature } from "@/lib/permissions";
import { getToken } from "next-auth/jwt";
import { getApiOwner } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const auth = await getApiOwner(req);
    if (!auth) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }
    // Never trust a client-supplied userId — always the signed-in owner.
    const userId = auth.ownerId;

    const body = await req.json();

    const { customerId, amount, description } = body;

    if (!customerId || !amount || amount <= 0 || !description) {
      return NextResponse.json({ error: "MISSING_DATA" }, { status: 400 });
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const customer = await Customer.findById(customerId);
    if (!customer || String(customer.userId) !== String(userId)) {
      return NextResponse.json({ error: "CUSTOMER_NOT_FOUND" }, { status: 404 });
    }

    const invoice = await Invoice.create({
      userId,
      customerId,
      amount: Number(amount),
      description: description.trim(),
      date: new Date(),
    });

    const invoiceLink = `${process.env.NEXT_PUBLIC_SITE_URL}/invoices/${invoice._id}`;

    await Customer.findByIdAndUpdate(
      customerId,
      { $inc: { totalDebt: Number(amount) } },
      { new: true }
    );

    // In-app (and push) notification for the shop owner — always.
    await createNotification({
      userId,
      customerId,
      title: "تم إضافة فاتورة جديدة",
      message: `تم تسجيل دين بقيمة ${amount} ريال`,
      type: "invoice",
    });

    // 📱 WhatsApp to the customer — Pro plan only (it is sent from Dayni's number
    // and costs per message), and only if the customer has a phone.
    if (WHATSAPP_ENABLED && customer.phone && hasFeature(user.plan, "notifications")) {
      const waResult = await sendWhatsApp({
        to: customer.phone,
        kind: "invoice",
        params: [
          waParam(customer.name),
          waParam(user.shopName),
          waParam(amount),
          waParam(description),
          invoiceLink,
        ],
        message: `مرحباً ${customer.name} 👋

📢 إشعار من ${user.shopName} عبر دَيني

تم تسجيل فاتورة جديدة عليك:

💰 المبلغ: ${amount} ريال
📝 التفاصيل: ${description}

🔗 رابط الفاتورة:
${invoiceLink}

نرجو السداد في أقرب وقت 🙏

— دَيني 💙`,
      });

      if (!waResult.success) {
        console.warn("⚠️ WhatsApp failed for invoice", invoice._id, "| Reason:", waResult.error);
      }
    }

    return NextResponse.json(invoice, { status: 201 });
  } catch (error: any) {
    console.error("❌ Create Invoice Error:", error.message);
    return NextResponse.json({ error: "GENERIC_ERROR" }, { status: 500 });
  }
}

// ── GET: return only the authenticated user's invoices ──
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
    });

    if (!token?.email) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    const user = await User.findOne({ email: token.email }).select("_id");
    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const invoices = await Invoice.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(invoices, { status: 200 });
  } catch (error: any) {
    console.error("❌ Fetch Invoices Error:", error.message);
    return NextResponse.json({ error: "FETCH_FAILED" }, { status: 500 });
  }
}
