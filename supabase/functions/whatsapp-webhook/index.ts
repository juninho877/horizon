import { corsHeaders } from "@shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.30.0";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const webhookData = await req.json();
    console.log("Webhook received:", JSON.stringify(webhookData, null, 2));

    // Handle different types of webhook events
    if (webhookData.event === "messages.upsert") {
      await handleIncomingMessage(supabase, webhookData);
    } else if (webhookData.event === "connection.update") {
      await handleConnectionUpdate(supabase, webhookData);
    } else {
      console.log("Unhandled webhook event:", webhookData.event);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});

async function handleIncomingMessage(supabase: any, webhookData: any) {
  try {
    const { data } = webhookData;
    const message = data.messages?.[0];

    if (!message || message.fromMe) {
      return; // Skip messages sent by the bot
    }

    const instanceName = webhookData.instance;
    const phoneNumber = message.key.remoteJid.replace("@s.whatsapp.net", "");
    const messageContent =
      message.message?.conversation ||
      message.message?.extendedTextMessage?.text ||
      "[Media message]";

    console.log("Processing incoming message:", {
      instanceName,
      phoneNumber,
      messageContent,
    });

    // Find the bot instance
    const { data: botInstance } = await supabase
      .from("bot_instances")
      .select("bot_id, user_id")
      .eq("instance_name", instanceName)
      .single();

    if (!botInstance) {
      console.log("Bot instance not found:", instanceName);
      return;
    }

    // Find or create conversation
    let { data: conversation } = await supabase
      .from("conversations")
      .select("id")
      .eq("bot_id", botInstance.bot_id)
      .eq("phone_number", phoneNumber)
      .single();

    if (!conversation) {
      const { data: newConversation } = await supabase
        .from("conversations")
        .insert({
          bot_id: botInstance.bot_id,
          user_id: botInstance.user_id,
          phone_number: phoneNumber,
          contact_name: message.pushName || phoneNumber,
          last_message: messageContent,
          message_count: 1,
        })
        .select("id")
        .single();

      conversation = newConversation;
    } else {
      // Update existing conversation
      await supabase
        .from("conversations")
        .update({
          last_message: messageContent,
          last_message_at: new Date().toISOString(),
          message_count: supabase.rpc("increment_message_count", {
            conversation_id: conversation.id,
          }),
        })
        .eq("id", conversation.id);
    }

    // Save the incoming message
    await supabase.from("messages").insert({
      conversation_id: conversation.id,
      bot_id: botInstance.bot_id,
      user_id: botInstance.user_id,
      message_type: "incoming",
      content: messageContent,
      phone_number: phoneNumber,
    });

    // Check for auto-responses
    await processAutoResponse(
      supabase,
      botInstance,
      phoneNumber,
      messageContent,
      conversation.id,
    );
  } catch (error) {
    console.error("Error handling incoming message:", error);
  }
}

async function processAutoResponse(
  supabase: any,
  botInstance: any,
  phoneNumber: string,
  messageContent: string,
  conversationId: string,
) {
  try {
    // Get active bot responses
    const { data: responses } = await supabase
      .from("bot_responses")
      .select("*")
      .eq("bot_id", botInstance.bot_id)
      .eq("active", true);

    if (!responses || responses.length === 0) {
      return;
    }

    const messageWords = messageContent.toLowerCase().split(/\s+/);

    for (const response of responses) {
      const triggers = response.trigger
        .toLowerCase()
        .split(",")
        .map((t: string) => t.trim());

      // Check if any trigger matches
      const hasMatch = triggers.some((trigger: string) =>
        messageWords.some(
          (word) => word.includes(trigger) || trigger.includes(word),
        ),
      );

      if (hasMatch) {
        console.log("Auto-response triggered:", {
          trigger: response.trigger,
          response: response.response,
        });

        // Send response via Evolution API
        await sendWhatsAppMessage(
          phoneNumber,
          response.response,
          botInstance.instance_name,
        );

        // Save the outgoing message
        await supabase.from("messages").insert({
          conversation_id: conversationId,
          bot_id: botInstance.bot_id,
          user_id: botInstance.user_id,
          message_type: "outgoing",
          content: response.response,
          phone_number: phoneNumber,
          is_bot_response: true,
          response_trigger: response.trigger,
        });

        // Update bot response count
        await supabase
          .from("bots")
          .update({
            responses: supabase.rpc("increment_responses", {
              bot_id: botInstance.bot_id,
            }),
          })
          .eq("id", botInstance.bot_id);

        break; // Only send first matching response
      }
    }
  } catch (error) {
    console.error("Error processing auto-response:", error);
  }
}

async function sendWhatsAppMessage(
  phoneNumber: string,
  message: string,
  instanceName: string,
) {
  try {
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    if (!EVOLUTION_API_URL) {
      console.error("EVOLUTION_API_URL not configured");
      return;
    }

    const response = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${instanceName}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: EVOLUTION_API_KEY || "",
        },
        body: JSON.stringify({
          number: `${phoneNumber}@s.whatsapp.net`,
          text: message,
        }),
      },
    );

    if (!response.ok) {
      console.error("Failed to send WhatsApp message:", await response.text());
    } else {
      console.log("WhatsApp message sent successfully");
    }
  } catch (error) {
    console.error("Error sending WhatsApp message:", error);
  }
}

async function handleConnectionUpdate(supabase: any, webhookData: any) {
  try {
    const { instance, data } = webhookData;
    const connectionState = data.state;

    console.log("Connection update:", { instance, state: connectionState });

    // Update bot instance status
    await supabase
      .from("bot_instances")
      .update({
        status: connectionState === "open" ? "connected" : "disconnected",
        last_connected_at:
          connectionState === "open" ? new Date().toISOString() : null,
        phone_number: data.number || null,
      })
      .eq("instance_name", instance);
  } catch (error) {
    console.error("Error handling connection update:", error);
  }
}
