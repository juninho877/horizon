import { corsHeaders } from "@shared/cors.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
      status: 200,
    });
  }

  try {
    const requestBody = await req.text();
    console.log("Raw request body:", requestBody);

    let parsedBody;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const { endpoint, method = "POST", body = {} } = parsedBody;

    console.log("Evolution API Proxy - Request:", { endpoint, method, body });

    // Validate required parameters
    if (!endpoint) {
      return new Response(
        JSON.stringify({ error: "Missing endpoint parameter" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Get Evolution API base URL from environment
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    console.log("Environment check:", {
      hasUrl: !!EVOLUTION_API_URL,
      hasKey: !!EVOLUTION_API_KEY,
      url: EVOLUTION_API_URL
        ? `${EVOLUTION_API_URL.substring(0, 20)}...`
        : "not set",
    });

    if (!EVOLUTION_API_URL) {
      console.error("EVOLUTION_API_URL not configured");
      return new Response(
        JSON.stringify({
          error: "Evolution API URL not configured",
          details: "Please configure EVOLUTION_API_URL environment variable",
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Clean and build the full URL
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.substring(1)
      : endpoint;
    const baseUrl = EVOLUTION_API_URL.endsWith("/")
      ? EVOLUTION_API_URL.slice(0, -1)
      : EVOLUTION_API_URL;
    const fullUrl = `${baseUrl}/${cleanEndpoint}`;

    console.log("Making request to:", fullUrl);

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    // Add API key if available
    if (EVOLUTION_API_KEY) {
      headers["apikey"] = EVOLUTION_API_KEY;
    }

    console.log("Request headers:", {
      ...headers,
      apikey: headers.apikey ? "[REDACTED]" : "not set",
    });

    // Make request to Evolution API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    const evolutionResponse = await fetch(fullUrl, {
      method,
      headers,
      body: method !== "GET" ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    console.log("Evolution API Response Status:", evolutionResponse.status);
    console.log(
      "Evolution API Response Headers:",
      Object.fromEntries(evolutionResponse.headers.entries()),
    );

    const responseText = await evolutionResponse.text();
    console.log("Evolution API Response Body:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (jsonError) {
      console.warn("Failed to parse response as JSON:", jsonError);
      responseData = {
        message: responseText,
        raw: responseText,
        parseError: jsonError.message,
      };
    }

    if (!evolutionResponse.ok) {
      console.error("Evolution API Error:", {
        status: evolutionResponse.status,
        statusText: evolutionResponse.statusText,
        body: responseData,
        url: fullUrl,
      });

      return new Response(
        JSON.stringify({
          error: `Evolution API Error: ${evolutionResponse.status} - ${evolutionResponse.statusText}`,
          details: responseData,
          url: fullUrl,
          status: evolutionResponse.status,
        }),
        {
          status:
            evolutionResponse.status >= 400 && evolutionResponse.status < 500
              ? evolutionResponse.status
              : 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    console.log("Successful response from Evolution API");
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy function error:", error);
    console.error("Error stack:", error.stack);

    let errorMessage = "Internal server error";
    let statusCode = 500;

    if (error.name === "AbortError") {
      errorMessage =
        "Request timeout - Evolution API não respondeu em 30 segundos";
      statusCode = 408;
    } else if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage = "Não foi possível conectar com a Evolution API";
      statusCode = 502;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        message: error.message,
        stack: error.stack,
        type: error.constructor.name,
      }),
      {
        status: statusCode,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
