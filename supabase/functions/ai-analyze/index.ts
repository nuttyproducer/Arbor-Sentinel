// AI Analyze — Edge Function
// Uses DeepSeek API to classify, summarize, and extract entities from content.
// API key is stored as a Supabase secret: DEEPSEEK_API_KEY

const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

// ── Types ──────────────────────────────────────────────────────────────────

type AnalysisTask = "classify" | "summarize" | "extract_entities" | "analyze";

interface AnalyzeRequest {
  task: AnalysisTask;
  title: string;
  body: string;
  language?: string;
  context?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface AnalyzeResponse {
  success: boolean;
  task: AnalysisTask;
  result?: Record<string, unknown>;
  error?: string;
  model?: string;
}

// ── Prompts ────────────────────────────────────────────────────────────────

const PROMPTS: Record<AnalysisTask, (title: string, body: string, extra?: string) => string> = {
  classify: (title, body) =>
    `Classify this content for a human rights accountability platform. Return JSON with:
- primary_category: one of [war_crimes, crimes_against_humanity, genocide, human_rights_violation, legal_development, political_development, humanitarian, civil_society, academic_research, other]
- secondary_categories: array of up to 3 from the same list
- urgency: one of [critical, high, medium, low, informational]
- geographic_focus: array of country/region names
- confidence: 0.0 to 1.0
- reasoning: one-sentence explanation

Title: ${title}
Body: ${body.slice(0, 2000)}`,

  summarize: (title, body) =>
    `Summarize this content in 2-3 sentences for a human rights researcher. Return JSON with:
- summary: the summary text
- key_claim: the main claim or finding
- actors: array of key actors mentioned
- confidence: 0.0 to 1.0

Title: ${title}
Body: ${body.slice(0, 2000)}`,

  extract_entities: (title, body) =>
    `Extract named entities from this content. Return JSON with:
- persons: array of {name, role?, affiliation?}
- organizations: array of {name, type?}
- locations: array of {name, country?}
- dates: array of {date, event?}
- legal_instruments: array of {name, type?} (e.g. treaties, resolutions, court rulings)

Title: ${title}
Body: ${body.slice(0, 2000)}`,

  analyze: (title, body, extra) =>
    `Analyze this content for a genocide and mass atrocity accountability platform. Return JSON with:
- summary: 2-3 sentence summary
- classification: primary and secondary categories
- urgency_level: critical/high/medium/low/informational
- entities: key persons, organizations, locations
- legal_relevance: legal instruments, courts, or proceedings referenced
- credibility_assessment: assessment of source credibility and factual basis
- action_items: concrete actions that could be taken based on this information
- confidence: 0.0 to 1.0
${extra ? `\nAdditional context: ${extra}` : ""}

Title: ${title}
Body: ${body.slice(0, 2000)}`,
};

// ── DeepSeek API Call ──────────────────────────────────────────────────────

async function callDeepSeek(
  prompt: string,
  apiKey: string,
): Promise<Record<string, unknown>> {
  const response = await fetch(DEEPSEEK_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for a human rights accountability platform called Arbor Sentinel. You analyze content related to international law, human rights, war crimes, crimes against humanity, and genocide. Always return valid JSON. Be precise, factual, and objective.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 1024,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Empty response from DeepSeek API");
  }

  return JSON.parse(content);
}

// ── Main Handler ────────────────────────────────────────────────────────────

Deno.serve(async (req: Request) => {
  const headers = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "POST required" }),
      { headers, status: 405 },
    );
  }

  const apiKey = Deno.env.get("DEEPSEEK_API_KEY");
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "DEEPSEEK_API_KEY not configured. Run: supabase secrets set DEEPSEEK_API_KEY",
      }),
      { headers, status: 500 },
    );
  }

  try {
    const body: AnalyzeRequest = await req.json();

    if (!body.task || !body.title || !body.body) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Missing required fields: task, title, body",
        }),
        { headers, status: 400 },
      );
    }

    const promptFn = PROMPTS[body.task];
    if (!promptFn) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `Unknown task: ${body.task}. Valid tasks: ${Object.keys(PROMPTS).join(", ")}`,
        }),
        { headers, status: 400 },
      );
    }

    const prompt = promptFn(body.title, body.body, body.context);
    const result = await callDeepSeek(prompt, apiKey);

    return new Response(
      JSON.stringify({
        success: true,
        task: body.task,
        result,
        model: "deepseek-chat",
      }),
      { headers },
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { headers, status: 500 },
    );
  }
});
