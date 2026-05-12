import "jsr:@supabase/functions-js/edge-runtime.d.ts";

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
    const body = await req.json();
    const {
      order_id,
      transaction_id,
      total_amount,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_city,
    } = body;

    // SSLCommerz sandbox credentials
    // In production, replace with live store_id and store_passwd secrets
    const store_id = Deno.env.get("SSLCOMMERZ_STORE_ID") ?? "testbox";
    const store_passwd = Deno.env.get("SSLCOMMERZ_STORE_PASSWD") ?? "qwerty";
    const is_sandbox = (Deno.env.get("SSLCOMMERZ_SANDBOX") ?? "true") === "true";

    const base_url = is_sandbox
      ? "https://sandbox.sslcommerz.com"
      : "https://securepay.sslcommerz.com";

    // The frontend URL where users are redirected after payment
    const frontend_url = Deno.env.get("FRONTEND_URL") ?? "http://localhost:5173";

    const sslData = new URLSearchParams({
      store_id,
      store_passwd,
      total_amount: String(total_amount),
      currency: "BDT",
      tran_id: transaction_id,
      success_url: `${frontend_url}/payment/success?tran_id=${transaction_id}&order_id=${order_id}`,
      fail_url: `${frontend_url}/payment/fail`,
      cancel_url: `${frontend_url}/payment/cancel`,
      ipn_url: `${Deno.env.get("SUPABASE_URL")}/functions/v1/sslcommerz-ipn`,
      product_name: "LA ESPERANZA Perfumes",
      product_category: "Luxury Perfumes",
      product_profile: "general",
      cus_name: customer_name,
      cus_email: customer_email,
      cus_phone: customer_phone,
      cus_add1: customer_address,
      cus_city: customer_city,
      cus_country: "Bangladesh",
      ship_name: customer_name,
      ship_add1: customer_address,
      ship_city: customer_city,
      ship_country: "Bangladesh",
      shipping_method: "Courier",
      num_of_item: "1",
      emi_option: "0",
    });

    const response = await fetch(`${base_url}/gwprocess/v4/api.php`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: sslData.toString(),
    });

    const result = await response.json();

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err), status: "FAILED" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
