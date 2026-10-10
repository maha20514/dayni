/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/mongodb";
import { getApiOwner } from "@/lib/apiAuth";
import { User } from "@/models/User";
import { Customer } from "@/models/Customer";
import { Invoice } from "@/models/Invoice";
import { Payment } from "@/models/Payment";
import { Supplier } from "@/models/Supplier";
import { PurchaseDebt } from "@/models/PurchaseDebt";
import { PurchasePayment } from "@/models/PurchasePayment";
import { Notification } from "@/models/Notification";
import { PaymentRequest } from "@/models/PaymentRequest";
import { DeviceToken } from "@/models/DeviceToken";
import { MobileAuthCode } from "@/models/MobileAuthCode";
import { TeamMember } from "@/models/Teammember";
import { EmailVerificationToken } from "@/models/EmailVerificationToken";
import { PasswordResetToken } from "@/models/PasswordResetToken";

// Tells the page which confirmation to ask for.
export async function GET(req: NextRequest) {
  const auth = await getApiOwner(req);
  if (!auth || auth.isMember) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }
  await connectDB();
  const user = await User.findById(auth.ownerId).select("password");
  if (!user) return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  return NextResponse.json({ requires: user.password ? "password" : "email" });
}

// Permanently deletes the signed-in owner's account and everything under it.
// Required by Google Play / App Store: in-app account deletion.
export async function DELETE(req: NextRequest) {
  try {
    const auth = await getApiOwner(req);
    if (!auth || auth.isMember) {
      return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(auth.ownerId);
    if (!user) {
      return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
    }

    const { password, confirmEmail } = await req.json().catch(() => ({}));

    // Re-authenticate: password for email accounts, typed email for Google accounts.
    if (user.password) {
      if (!password || !(await bcrypt.compare(String(password), user.password))) {
        return NextResponse.json({ error: "WRONG_PASSWORD" }, { status: 403 });
      }
    } else if (String(confirmEmail || "").trim().toLowerCase() !== user.email) {
      return NextResponse.json({ error: "EMAIL_MISMATCH" }, { status: 403 });
    }

    const userId = user._id;
    await Promise.all([
      Customer.deleteMany({ userId }),
      Invoice.deleteMany({ userId }),
      Payment.deleteMany({ userId }),
      Supplier.deleteMany({ userId }),
      PurchaseDebt.deleteMany({ userId }),
      PurchasePayment.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      PaymentRequest.deleteMany({ userId }),
      DeviceToken.deleteMany({ userId }),
      MobileAuthCode.deleteMany({ userId }),
      EmailVerificationToken.deleteMany({ userId }),
      PasswordResetToken.deleteMany({ userId }),
      TeamMember.deleteMany({ ownerId: userId }),
    ]);
    await User.deleteOne({ _id: userId });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Delete account error:", err);
    return NextResponse.json({ error: "DELETE_FAILED" }, { status: 500 });
  }
}
