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
    console.log("Testing Evolution API connection...");

    // Get Evolution API configuration from environment
    const EVOLUTION_API_URL = Deno.env.get("EVOLUTION_API_URL");
    const EVOLUTION_API_KEY = Deno.env.get("EVOLUTION_API_KEY");

    console.log("Environment check:", {
      hasUrl: !!EVOLUTION_API_URL,
      hasKey: !!EVOLUTION_API_KEY,
      url: EVOLUTION_API_URL
        ? `${EVOLUTION_API_URL.substring(0, 30)}...`
        : "not set",
    });

    // Check if environment variables are configured
    if (!EVOLUTION_API_URL) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "❌ EVOLUTION_API_URL não configurada. Configure nas variáveis de ambiente do projeto.",
          details:
            "A URL da Evolution API é obrigatória para conectar com o WhatsApp.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    if (!EVOLUTION_API_KEY) {
      return new Response(
        JSON.stringify({
          success: false,
          message:
            "❌ EVOLUTION_API_KEY não configurada. Configure nas variáveis de ambiente do projeto.",
          details: "A chave da API é obrigatória para autenticação.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Clean and build the test URL
    const baseUrl = EVOLUTION_API_URL.endsWith("/")
      ? EVOLUTION_API_URL.slice(0, -1)
      : EVOLUTION_API_URL;
    const testUrl = `${baseUrl}/instance/fetchInstances`;

    console.log("Testing connection to:", testUrl);

    // Test connection to Evolution API
    const response = await fetch(testUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        apikey: EVOLUTION_API_KEY,
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries()),
    );

    const responseText = await response.text();
    console.log("Response body:", responseText);

    if (!response.ok) {
      let errorMessage = "Erro desconhecido";

      if (response.status === 401 || response.status === 403) {
        errorMessage =
          "❌ Erro de autenticação. Verifique se a EVOLUTION_API_KEY está correta.";
      } else if (response.status === 404) {
        errorMessage =
          "❌ Endpoint não encontrado. Verifique se a EVOLUTION_API_URL está correta.";
      } else if (response.status >= 500) {
        errorMessage =
          "❌ Erro interno da Evolution API. Verifique se o serviço está funcionando.";
      } else {
        errorMessage = `❌ Erro HTTP ${response.status}: ${response.statusText}`;
      }

      return new Response(
        JSON.stringify({
          success: false,
          message: errorMessage,
          details: `Status: ${response.status}, Response: ${responseText}`,
          status: response.status,
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    // Parse response
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (parseError) {
      console.warn("Failed to parse response as JSON:", parseError);
      responseData = { raw: responseText };
    }

    console.log("Successful connection test!");
    return new Response(
      JSON.stringify({
        success: true,
        message: "✅ Conexão com Evolution API estabelecida com sucesso!",
        details:
          "A API está respondendo corretamente. Você pode prosseguir com a criação da instância.",
        apiResponse: responseData,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Connection test error:", error);

    let errorMessage = "❌ Erro ao testar conexão com Evolution API";

    if (error.name === "TypeError" && error.message.includes("fetch")) {
      errorMessage =
        "❌ Não foi possível conectar com a Evolution API. Verifique se a URL está correta e se o serviço está online.";
    }

    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
        details: `${error.name}: ${error.message}`,
        stack: error.stack,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
