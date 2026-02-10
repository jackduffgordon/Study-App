import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface EssayFeedbackRequest {
  essayText: string;
  promptId: string;
}

interface EssayFeedback {
  structure_analysis: string;
  argumentation_analysis: string;
  strengths: string[];
  weaknesses: string[];
  improvement_suggestions: string[];
  grade_estimate: "First" | "2:1" | "2:2" | "Third";
  overall_feedback: string;
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

async function handleOptions() {
  return new Response("ok", { headers: corsHeaders });
}

async function validateAuth(authHeader: string): Promise<string | null> {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return null;
    }

    return user.id;
  } catch {
    return null;
  }
}

async function fetchEssayPrompt(
  supabase: any,
  promptId: string,
  userId: string
): Promise<any> {
  const { data, error } = await supabase
    .from("essay_prompts")
    .select("*")
    .eq("id", promptId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch essay prompt: ${error.message}`);
  }

  return data;
}

async function generateEssayFeedback(
  essayText: string,
  essayPrompt: any
): Promise<EssayFeedback> {
  const framework = typeof essayPrompt.argument_framework === 'string'
    ? JSON.parse(essayPrompt.argument_framework)
    : essayPrompt.argument_framework || {};

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 3000,
      system:
        "You are an expert academic essay evaluator. Provide detailed feedback on essays with constructive criticism and specific improvement suggestions. Always respond with valid JSON only, no markdown.",
      messages: [
        {
          role: "user",
          content: `Please analyze this student essay and provide detailed feedback in the following JSON format (with no markdown, just raw JSON):

{
  "structure_analysis": "detailed analysis of essay structure and organization",
  "argumentation_analysis": "analysis of arguments, logic, and reasoning",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "weaknesses": ["weakness 1", "weakness 2", "weakness 3"],
  "improvement_suggestions": ["suggestion 1", "suggestion 2", "suggestion 3", "suggestion 4"],
  "grade_estimate": "First|2:1|2:2|Third",
  "overall_feedback": "comprehensive overall feedback summary"
}

Essay Prompt:
${essayPrompt.prompt}

${framework.thesis_suggestion ? `Thesis Suggestion: ${framework.thesis_suggestion}` : ""}

${framework.key_arguments ? `Key Arguments to Consider: ${framework.key_arguments.join(", ")}` : ""}

${framework.counter_arguments ? `Counter-Arguments to Address: ${framework.counter_arguments.join(", ")}` : ""}

${framework.evidence_points ? `Evidence Points Available: ${framework.evidence_points.join(", ")}` : ""}

Student Essay:
${essayText}

Provide constructive, detailed feedback that helps the student improve their writing. Grade on UK university grading scale (First = 70-100%, 2:1 = 60-69%, 2:2 = 50-59%, Third = 40-49%).`,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(
      `Claude API error: ${response.status} - ${error}`
    );
  }

  const data = await response.json();
  const content = data.content[0].text;

  const feedback = JSON.parse(content) as EssayFeedback;
  return feedback;
}

async function logActivity(
  supabase: any,
  userId: string,
  promptId: string
): Promise<void> {
  const { error } = await supabase.from("activity_feed").insert({
    user_id: userId,
    activity_type: "study_session",
    metadata: JSON.stringify({
      prompt_id: promptId,
      action: "submit_essay",
    }),
  });

  if (error) {
    console.error("Failed to log activity:", error);
  }
}

async function handleEssayFeedback(req: Request): Promise<Response> {
  try {
    const authHeader = req.headers.get("Authorization");
    const userId = await validateAuth(authHeader || "");

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = (await req.json()) as EssayFeedbackRequest;
    const { essayText, promptId } = body;

    if (!essayText || !promptId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (essayText.trim().length < 100) {
      return new Response(
        JSON.stringify({ error: "Essay must be at least 100 characters long" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch essay prompt
    const essayPrompt = await fetchEssayPrompt(supabase, promptId, userId);

    // Generate feedback with Claude
    const feedback = await generateEssayFeedback(essayText, essayPrompt);

    // Log activity
    await logActivity(supabase, userId, promptId);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Essay feedback generated successfully",
        data: {
          feedback: feedback,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Essay feedback error:", errorMessage);

    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return handleOptions();
  }

  if (req.method === "POST") {
    return handleEssayFeedback(req);
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
