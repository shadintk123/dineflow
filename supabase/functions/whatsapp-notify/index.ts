import { createClient } from "npm:@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface NotificationRequest {
  reservation_id: string;
  restaurant_id: string;
  event_type: "created" | "confirmed" | "cancelled" | "modified" | "reminder";
  customer_name: string;
  customer_phone: string;
  restaurant_name: string;
  date: string;
  time: string;
  guests: number;
  table_code: string;
  reservation_code: string;
  special_request?: string;
  reservation_status: string;
}

function buildOwnerMessage(data: NotificationRequest): string {
  const emoji = data.event_type === "cancelled" ? "\u274C" : data.event_type === "modified" ? "\u270F\uFE0F" : "\uD83D\uDD14";
  const title = data.event_type === "cancelled" ? "Reservation Cancelled" :
    data.event_type === "modified" ? "Reservation Modified" :
    data.event_type === "confirmed" ? "Reservation Confirmed" :
    data.event_type === "reminder" ? "Reservation Reminder" :
    "New Dinevia Reservation";

  let msg = `${emoji} ${title}\n\n`;
  msg += `Restaurant: ${data.restaurant_name}\n\n`;
  msg += `Customer: ${data.customer_name}\n`;
  msg += `Guests: ${data.guests}\n\n`;
  msg += `Date: ${data.date}\n`;
  msg += `Time: ${data.time}\n\n`;
  msg += `Table: ${data.table_code}\n`;
  msg += `Reservation ID: ${data.reservation_code}\n`;

  if (data.special_request) {
    msg += `\nSpecial request:\n${data.special_request}\n`;
  }

  msg += `\nStatus: ${data.reservation_status.toUpperCase()}`;

  return msg;
}

function buildCustomerMessage(data: NotificationRequest): string {
  if (data.event_type === "cancelled") {
    return `\u274C Dinevia Reservation Cancelled\n\nRestaurant: ${data.restaurant_name}\nReservation ID: ${data.reservation_code}\nDate: ${data.date}\nTime: ${data.time}\n\nYour table has been released. We hope to serve you another time.`;
  }

  return `\u2705 Dinevia Reservation Confirmed\n\nRestaurant: ${data.restaurant_name}\nDate: ${data.date}\nTime: ${data.time}\nGuests: ${data.guests}\nTable: ${data.table_code}\n\nReservation ID: ${data.reservation_code}\n\nPlease arrive on time.`;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const data: NotificationRequest = await req.json();

    // Validate required fields
    if (!data.reservation_id || !data.restaurant_id || !data.event_type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch WhatsApp settings for this restaurant
    const { data: settings, error: settingsError } = await supabase
      .from("whatsapp_settings")
      .select("*")
      .eq("restaurant_id", data.restaurant_id)
      .maybeSingle();

    if (settingsError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch WhatsApp settings" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const results: { owner: string; customer: string } = {
      owner: "skipped",
      customer: "skipped",
    };

    // Check if owner notifications are enabled
    if (settings && settings.notifications_enabled && settings.phone_number) {
      const ownerPhone = `${settings.country_code}${settings.phone_number}`;
      const idempotencyKey = `${data.reservation_id}_${data.event_type}_owner`;

      // Check for existing notification (idempotency)
      const { data: existing } = await supabase
        .from("whatsapp_notifications")
        .select("id, status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existing && existing.status === "sent") {
        results.owner = "duplicate_skipped";
      } else {
        const messageBody = buildOwnerMessage(data);

        // Insert notification record
        const { data: notifRecord, error: insertError } = await supabase
          .from("whatsapp_notifications")
          .upsert({
            reservation_id: data.reservation_id,
            restaurant_id: data.restaurant_id,
            event_type: data.event_type,
            recipient_type: "owner",
            recipient_phone: ownerPhone,
            message_body: messageBody,
            status: "pending",
            idempotency_key: idempotencyKey,
          }, { onConflict: "idempotency_key" })
          .select()
          .maybeSingle();

        if (insertError) {
          results.owner = "failed_insert";
        } else {
          // Attempt to send via WhatsApp Cloud API
          const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
          const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

          if (token && phoneNumberId) {
            try {
              const waResponse = await fetch(
                `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: ownerPhone.replace("+", ""),
                    type: "text",
                    text: { body: messageBody },
                  }),
                }
              );

              if (waResponse.ok) {
                const waData = await waResponse.json();
                const messageId = waData.messages?.[0]?.id || "";
                await supabase
                  .from("whatsapp_notifications")
                  .update({
                    status: "sent",
                    provider_message_id: messageId,
                    sent_at: new Date().toISOString(),
                  })
                  .eq("id", notifRecord.id);
                results.owner = "sent";
              } else {
                const errBody = await waResponse.text();
                await supabase
                  .from("whatsapp_notifications")
                  .update({
                    status: "failed",
                    failure_reason: `WhatsApp API error: ${waResponse.status}`,
                  })
                  .eq("id", notifRecord.id);
                results.owner = "failed";
              }
            } catch (err) {
              await supabase
                .from("whatsapp_notifications")
                .update({
                  status: "failed",
                  failure_reason: String(err),
                })
                .eq("id", notifRecord.id);
              results.owner = "failed";
            }
          } else {
            // No API credentials configured — mark as pending (can be retried later)
            await supabase
              .from("whatsapp_notifications")
              .update({
                status: "pending",
                failure_reason: "WhatsApp API credentials not configured",
              })
              .eq("id", notifRecord.id);
            results.owner = "pending_no_credentials";
          }
        }
      }
    }

    // Check if customer notifications are enabled and customer phone exists
    if (settings && settings.customer_notifications_enabled && data.customer_phone) {
      const customerPhone = data.customer_phone;
      const idempotencyKey = `${data.reservation_id}_${data.event_type}_customer`;

      const { data: existing } = await supabase
        .from("whatsapp_notifications")
        .select("id, status")
        .eq("idempotency_key", idempotencyKey)
        .maybeSingle();

      if (existing && existing.status === "sent") {
        results.customer = "duplicate_skipped";
      } else {
        const messageBody = buildCustomerMessage(data);

        const { data: notifRecord, error: insertError } = await supabase
          .from("whatsapp_notifications")
          .upsert({
            reservation_id: data.reservation_id,
            restaurant_id: data.restaurant_id,
            event_type: data.event_type,
            recipient_type: "customer",
            recipient_phone: customerPhone,
            message_body: messageBody,
            status: "pending",
            idempotency_key: idempotencyKey,
          }, { onConflict: "idempotency_key" })
          .select()
          .maybeSingle();

        if (insertError) {
          results.customer = "failed_insert";
        } else {
          const token = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
          const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

          if (token && phoneNumberId) {
            try {
              const waResponse = await fetch(
                `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
                {
                  method: "POST",
                  headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: customerPhone.replace("+", ""),
                    type: "text",
                    text: { body: messageBody },
                  }),
                }
              );

              if (waResponse.ok) {
                const waData = await waResponse.json();
                const messageId = waData.messages?.[0]?.id || "";
                await supabase
                  .from("whatsapp_notifications")
                  .update({
                    status: "sent",
                    provider_message_id: messageId,
                    sent_at: new Date().toISOString(),
                  })
                  .eq("id", notifRecord.id);
                results.customer = "sent";
              } else {
                await supabase
                  .from("whatsapp_notifications")
                  .update({
                    status: "failed",
                    failure_reason: `WhatsApp API error: ${waResponse.status}`,
                  })
                  .eq("id", notifRecord.id);
                results.customer = "failed";
              }
            } catch (err) {
              await supabase
                .from("whatsapp_notifications")
                .update({
                  status: "failed",
                  failure_reason: String(err),
                })
                .eq("id", notifRecord.id);
              results.customer = "failed";
            }
          } else {
            await supabase
              .from("whatsapp_notifications")
              .update({
                status: "pending",
                failure_reason: "WhatsApp API credentials not configured",
              })
              .eq("id", notifRecord.id);
            results.customer = "pending_no_credentials";
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, results }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
