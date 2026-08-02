/* eslint-disable @typescript-eslint/no-explicit-any */
 
export async function sendWhatsApp({
  to,
  message,
}: {
  to: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
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
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: phone,
          type: "text",
          text: { body: message },
        }),
      }
    );
 
    const data = await res.json();
 
    if (!res.ok) {
      console.error("❌ WhatsApp API error:", JSON.stringify(data));
      return { success: false, error: data?.error?.message || "WhatsApp API error" };
    }
 
    console.log("✅ WhatsApp sent | ID:", data?.messages?.[0]?.id);
    return { success: true };
  } catch (error: any) {
    console.error("❌ WhatsApp fetch error:", error.message);
    return { success: false, error: error.message };
  }
}
 