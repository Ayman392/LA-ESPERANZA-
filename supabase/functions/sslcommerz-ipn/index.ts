import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // SSLCommerz sends IPN as form data
    const formData = await req.formData();
    const status = formData.get("status")?.toString() ?? "";
    const tran_id = formData.get("tran_id")?.toString() ?? "";
    const val_id = formData.get("val_id")?.toString() ?? "";
    const amount = formData.get("amount")?.toString() ?? "0";

    if (status === "VALID" && tran_id) {
      // Validate the transaction with SSLCommerz
      const store_id = Deno.env.get("SSLCOMMERZ_STORE_ID") ?? "testbox";
      const store_passwd = Deno.env.get("SSLCOMMERZ_STORE_PASSWD") ?? "qwerty";
      const is_sandbox = (Deno.env.get("SSLCOMMERZ_SANDBOX") ?? "true") === "true";

      const validate_url = is_sandbox
        ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php`
        : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php`;

      const valResp = await fetch(
        `${validate_url}?val_id=${val_id}&store_id=${store_id}&store_passwd=${store_passwd}&format=json`
      );
      const valData = await valResp.json();

      if (valData.status === "VALID" || valData.status === "VALIDATED") {
        // Update order payment status
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            val_id,
            updated_at: new Date().toISOString(),
          })
          .eq("transaction_id", tran_id);
      }
    } else if (status === "FAILED") {
      await supabase
        .from("orders")
        .update({ payment_status: "failed", updated_at: new Date().toISOString() })
        .eq("transaction_id", tran_id);
    } else if (status === "CANCELLED") {
      await supabase
        .from("orders")
        .update({ payment_status: "cancelled", updated_at: new Date().toISOString() })
        .eq("transaction_id", tran_id);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
