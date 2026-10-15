/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { sendVerifyReminderEmail } from "@/lib/emailTemplates";

const DAY = 24 * 60 * 60 * 1000;

// Daily cron: remind people who signed up with email+password but never verified.
//  - reminder 1: ~1 day after signup
//  - reminder 2 (last): ~2 days after reminder 1
//  - nothing after that, and nothing for accounts older than 14 days
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  // Fail closed: without CRON_SECRET anyone could trigger this.
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized cron request" }, { status: 401 });
  }

  try {
    await connectDB();
    const now = Date.now();

    const candidates = await User.find({
      isVerified: false,
      password: { $ne: null },
      provider: { $ne: "google" },
      createdAt: { $gte: new Date(now - 14 * DAY) },
      $or: [
        { verifyReminderCount: { $in: [0, null] }, createdAt: { $lte: new Date(now - 1 * DAY) } },
        { verifyReminderCount: 1, lastVerifyReminderAt: { $lte: new Date(now - 2 * DAY) } },
      ],
    }).limit(200);

    let sent = 0;
    for (const u of candidates) {
      const attempt = ((u.verifyReminderCount || 0) + 1) as 1 | 2;
      // Claim first so a retry/overlap can't double-send.
      const claimed = await User.findOneAndUpdate(
        { _id: u._id, verifyReminderCount: u.verifyReminderCount ?? 0, isVerified: false },
        { verifyReminderCount: attempt, lastVerifyReminderAt: new Date() }
      );
      if (!claimed) continue;
      try {
        await sendVerifyReminderEmail({
          to: u.email,
          shopName: u.shopName,
          attempt,
          preferredLanguage: u.preferredLanguage || "ar",
        });
        sent++;
      } catch (e) {
        console.error("Verify reminder failed for", u.email, e);
      }
    }

    return NextResponse.json({ success: true, candidates: candidates.length, sent });
  } catch (error: any) {
    console.error("❌ verify-reminders error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
