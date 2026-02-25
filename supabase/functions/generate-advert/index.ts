import { createClient } from "https://esm.sh/@supabase/supabase-js@2.97.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface GenerateRequest {
  propertyId: string;
  address: string;
  city: string;
  price: number;
  squareMeters: number;
  rooms: number;
  bedrooms: number;
  bathrooms: number;
  buildYear: number;
  energyLabel: string;
  platform?: string;
  images?: string[];
}

const REQUIRED_FIELDS: (keyof GenerateRequest)[] = [
  "propertyId",
  "address",
  "city",
  "price",
  "squareMeters",
  "rooms",
  "bedrooms",
  "bathrooms",
  "buildYear",
  "energyLabel",
];

function buildPrompt(input: GenerateRequest): string {
  return `Je bent een ervaren Nederlandse makelaar. Schrijf een professionele woningadvertentie in het Nederlands.

Woninggegevens:
- Adres: ${input.address}, ${input.city}
- Prijs: EUR ${input.price}
- Woonoppervlak: ${input.squareMeters} m2
- Kamers: ${input.rooms} (waarvan ${input.bedrooms} slaapkamers, ${input.bathrooms} badkamers)
- Bouwjaar: ${input.buildYear}
- Energielabel: ${input.energyLabel}
- Platform: ${input.platform ?? "funda"}

Genereer een JSON-object met:
- "title": Een pakkende titel (max 80 tekens)
- "description": Een uitgebreide beschrijving (150-250 woorden)
- "features": Een array van 5-7 kenmerken als korte zinnen

Schrijf professioneel, enthousiast en specifiek. Gebruik geen generieke zinnen.
Geef ALLEEN het JSON-object terug, geen andere tekst.`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    // Auth validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "U bent niet ingelogd. Log opnieuw in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "U bent niet ingelogd. Log opnieuw in." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Input validation
    const body: GenerateRequest = await req.json();

    const missingFields = REQUIRED_FIELDS.filter(
      (field) => body[field] === undefined || body[field] === null || body[field] === ""
    );

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: "Onvolledige woninggegevens. Controleer alle velden.",
          missingFields,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check Gemini API key
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      console.error("GEMINI_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Generatie mislukt, probeer het opnieuw." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Gemini API
    const prompt = buildPrompt(body);
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`;

    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              description: { type: "STRING" },
              features: { type: "ARRAY", items: { type: "STRING" } },
            },
            required: ["title", "description", "features"],
          },
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error("Gemini API error:", geminiResponse.status, errorText);
      return new Response(
        JSON.stringify({ error: "Generatie mislukt, probeer het opnieuw." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiResponse.json();

    // Parse response
    const textContent =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textContent) {
      console.error("No text content in Gemini response:", JSON.stringify(geminiData));
      return new Response(
        JSON.stringify({ error: "Generatie mislukt, probeer het opnieuw." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let parsed: { title: string; description: string; features: string[] };
    try {
      parsed = JSON.parse(textContent);
    } catch {
      console.error("Failed to parse Gemini JSON output:", textContent);
      return new Response(
        JSON.stringify({ error: "Generatie mislukt, probeer het opnieuw." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!parsed.title || !parsed.description || !Array.isArray(parsed.features)) {
      console.error("Invalid Gemini response structure:", parsed);
      return new Response(
        JSON.stringify({ error: "Generatie mislukt, probeer het opnieuw." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const platform = body.platform ?? "funda";

    return new Response(
      JSON.stringify({
        title: parsed.title,
        description: parsed.description,
        features: parsed.features,
        platform,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Generatie mislukt, probeer het opnieuw." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
