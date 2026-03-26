import { getCorsHeaders } from "../_shared/cors.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

    // Check if keys already exist
    const { data: existing } = await supabaseAdmin
      .from("app_config")
      .select("value_json")
      .eq("key", "vapid_public_key")
      .maybeSingle();

    if (existing?.value_json) {
      return new Response(
        JSON.stringify({ message: "VAPID keys already configured", publicKey: existing.value_json }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Generate VAPID keys
    const vapidKeys = webpush.generateVAPIDKeys();

    // Store public key in app_config for frontend access
    await supabaseAdmin.from("app_config").upsert({
      key: "vapid_public_key",
      value_json: vapidKeys.publicKey,
    });

    return new Response(
      JSON.stringify({
        publicKey: vapidKeys.publicKey,
        privateKey: vapidKeys.privateKey,
        message: "Store both keys as secrets: VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY",
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
