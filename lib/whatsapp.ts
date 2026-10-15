/* eslint-disable @typescript-eslint/no-explicit-any */
 
// Business-initiated WhatsApp messages (invoice / payment / reminder to a customer who
// has not messaged us in the last 24h) are only delivered if they use a Meta-APPROVED
// TEMPLATE. Free-form text is rejected (error 131047). Template names come from env;
// if one is not set we fall back to free-form text (works only inside the 24h window).
// Master switch. WhatsApp sending is hidden/disabled until WHATSAPP_ENABLED=true is set
// (Vercel env) — the code below stays intact and is re-activated just by flipping it.
export const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === "true";

export type WaKind = "invoice" | "payment" | "reminder";

const TEMPLATE_ENV: Record<WaKind, string | undefined> = {
  invoice: process.env.WA_TEMPLATE_INVOICE,
  payment: process.env.WA_TEMPLATE_PAYMENT,
  reminder: process.env.WA_TEMPLATE_REMINDER,
};

// Template variables cannot contain newlines/tabs or long runs of spaces.
export function waParam(v: unknown, max = 120): string {
  return String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max) || "-";
}

export async function sendWhatsApp({
  to,
  message,
  kind,
  params,
}: {
  to: string;
  message: string;
  kind?: WaKind;
  params?: string[];
}): Promise<{ success: boolean; error?: string }> {
  if (!WHATSAPP_ENABLED) return { success: false, error: "WhatsApp disabled" };
  try {
    const token   = process.env.WHATSAPP_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
 
    if (!token || !phoneId) {
      console.error("❌ WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in .env");
      return { success: false, error: "Missing WhatsApp credentials" };
    }
 
    // ── Format phone number ──
    let phone = to.trim().replace(/\s+/g, "").replace(/[^\d]/g, "");
 
    if (phone.startsWith("05") && phone.length === 10) {
      phone = `966${phone.slice(1)}`;          // 05X → 9665X
    } else if (phone.startsWith("5") && phone.length === 9) {
      phone = `966${phone}`;                   // 5X → 9665X
    }
    // if already 966XXXXXXXXX leave as-is
 
    console.log("📱 Sending WhatsApp to:", phone);

    
 
    const res = await fetch(
      `https://graph.facebook.com/v25.0/${phoneId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          kind && TEMPLATE_ENV[kind] && params
            ? {
                messaging_product: "whatsapp",
                to: phone,
                type: "template",
                template: {
                  name: TEMPLATE_ENV[kind],
                  language: { code: process.env.WA_TEMPLATE_LANG || "ar" },
                  components: [
                    { type: "body", parameters: params.map((text) => ({ type: "text", text })) },
                  ],
                },
              }
            : {
                messaging_product: "whatsapp",
                to: phone,
                type: "text",
                text: { body: message },
              }
        ),
      }
    );
 
    const data = await res.json();
 
    if (!res.ok) {
      console.error("❌ WhatsApp API error:", JSON.stringify(data));
      if ([131047, 131026, 132000, 132001].includes(data?.error?.code)) {
        console.error("ℹ️ Use an approved template (WA_TEMPLATE_* env) / check the template name & language");
      }
      return { success: false, error: data?.error?.message || "WhatsApp API error" };
    }
 
    console.log("✅ WhatsApp sent | ID:", data?.messages?.[0]?.id);
    return { success: true };
  } catch (error: any) {
    console.error("❌ WhatsApp fetch error:", error.message);
    return { success: false, error: error.message };
  }
}
 