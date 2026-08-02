/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { runReminders } from "@/lib/reminder";

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    // 🔐 حماية بسيطة (اختياري لكن مهم)
    const authHeader = req.headers.get("authorization");
    const secret = process.env.CRON_SECRET;

    if (secret && authHeader !== `Bearer ${secret}`) {
      return NextResponse.json(
        { error: "Unauthorized cron request" },
        { status: 401 }
      );
    }

    // 🚀 تشغيل نظام التذكيرات
    const result = await runReminders();

    return NextResponse.json({
      success: true,
      message: "Reminders executed successfully",
      result, // اختياري: يرجع كم رسالة انرسلت
    });
  } catch (error: any) {
    console.error("❌ Reminder Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal Server Error",
      },
      { status: 500 }
    );
  }
}