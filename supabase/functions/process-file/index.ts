import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

interface ProcessFileRequest {
  fileId: string;
}

interface FileRecord {
  id: string;
  user_id: string;
  module_id: string;
  file_type: string;
  storage_path: string;
  file_name: string;
  processing_status: string;
}

interface GeneratedMaterials {
  flashcards: Array<{
    question: string;
    answer: string;
    source_reference: string;
  }>;
  mcq_questions: Array<{
    question: string;
    options: string[];
    correct_option: number;
    explanation: string;
    source_reference: string;
  }>;
  essay_prompts: Array<{
    prompt: string;
    thesis_suggestion: string;
    key_arguments: string[];
    counter_arguments: string[];
    evidence_points: string[];
    source_reference: string;
  }>;
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

async function fetchFileRecord(
  supabase: any,
  fileId: string,
  userId: string
): Promise<FileRecord | null> {
  const { data, error } = await supabase
    .from("files")
    .select("*")
    .eq("id", fileId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("Error fetching file record:", error);
    return null;
  }

  return data as FileRecord;
}

async function downloadFileContent(
  supabase: any,
  filePath: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from("uploads")
    .download(filePath);

  if (error) {
    throw new Error(`Failed to download file: ${error.message}`);
  }

  const text = await data.text();
  return text;
}

async function generateMaterialsWithClaude(
  extractedContent: string
): Promise<GeneratedMaterials> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": ANTHROPIC_API_KEY!,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4000,
      system:
        "You are a study material generator. Given educational content, generate study materials in valid JSON format. Always respond with valid JSON only, no markdown.",
      messages: [
        {
          role: "user",
          content: `Given this educational content, generate study materials in the following JSON format (with no markdown, just raw JSON):

{
  "flashcards": [
    {
      "question": "string",
      "answer": "string",
      "source_reference": "page/slide number"
    }
  ],
  "mcq_questions": [
    {
      "question": "string",
      "options": ["option1", "option2", "option3", "option4"],
      "correct_option": 0,
      "explanation": "string",
      "source_reference": "page/slide number"
    }
  ],
  "essay_prompts": [
    {
      "prompt": "string",
      "thesis_suggestion": "string",
      "key_arguments": ["arg1", "arg2", "arg3"],
      "counter_arguments": ["counter1", "counter2"],
      "evidence_points": ["evidence1", "evidence2"],
      "source_reference": "page/slide number"
    }
  ]
}

Generate:
- 10 flashcards with questions and answers
- 5 multiple choice questions with 4 options each, one correct
- 3 essay prompts with detailed frameworks

Content to analyze:
${extractedContent.slice(0, 15000)}`,
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

  const materials = JSON.parse(content) as GeneratedMaterials;
  return materials;
}

async function insertFlashcards(
  supabase: any,
  flashcards: GeneratedMaterials["flashcards"],
  fileId: string,
  userId: string,
  moduleId: string
): Promise<void> {
  const records = flashcards.map((card) => ({
    file_id: fileId,
    user_id: userId,
    module_id: moduleId,
    question: card.question,
    answer: card.answer,
    source_type: "page" as const,
    source_reference: card.source_reference,
    difficulty: "medium" as const,
  }));

  const { error } = await supabase.from("flashcards").insert(records);

  if (error) {
    throw new Error(`Failed to insert flashcards: ${error.message}`);
  }
}

async function insertMCQQuestions(
  supabase: any,
  questions: GeneratedMaterials["mcq_questions"],
  fileId: string,
  userId: string,
  moduleId: string
): Promise<void> {
  const records = questions.map((q) => ({
    file_id: fileId,
    user_id: userId,
    module_id: moduleId,
    question: q.question,
    options: JSON.stringify({
      choices: q.options,
      correct_index: q.correct_option,
      explanation: q.explanation,
    }),
    source_type: "page" as const,
    source_reference: q.source_reference,
    difficulty: "medium" as const,
  }));

  const { error } = await supabase
    .from("mcq_questions")
    .insert(records);

  if (error) {
    throw new Error(`Failed to insert MCQ questions: ${error.message}`);
  }
}

async function insertEssayPrompts(
  supabase: any,
  prompts: GeneratedMaterials["essay_prompts"],
  fileId: string,
  userId: string,
  moduleId: string
): Promise<void> {
  const records = prompts.map((p) => ({
    file_id: fileId,
    user_id: userId,
    module_id: moduleId,
    prompt: p.prompt,
    argument_framework: JSON.stringify({
      thesis_suggestion: p.thesis_suggestion,
      key_arguments: p.key_arguments,
      counter_arguments: p.counter_arguments,
      evidence_points: p.evidence_points,
    }),
    source_type: "page" as const,
    source_reference: p.source_reference,
  }));

  const { error } = await supabase
    .from("essay_prompts")
    .insert(records);

  if (error) {
    throw new Error(`Failed to insert essay prompts: ${error.message}`);
  }
}

async function updateFileStatus(
  supabase: any,
  fileId: string,
  status: string
): Promise<void> {
  const { error } = await supabase
    .from("files")
    .update({ processing_status: status })
    .eq("id", fileId);

  if (error) {
    throw new Error(`Failed to update file status: ${error.message}`);
  }
}

async function updateGenerationsUsed(
  supabase: any,
  userId: string
): Promise<void> {
  const { data: profile, error: fetchError } = await supabase
    .from("profiles")
    .select("monthly_generations_used")
    .eq("id", userId)
    .single();

  if (fetchError) {
    console.error("Failed to fetch profile for generation count:", fetchError);
    return;
  }

  const newCount = (profile.monthly_generations_used || 0) + 1;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ monthly_generations_used: newCount })
    .eq("id", userId);

  if (updateError) {
    console.error("Failed to update generations used:", updateError);
  }
}

async function logActivity(
  supabase: any,
  userId: string,
  fileId: string,
  status: string
): Promise<void> {
  const { error } = await supabase.from("activity_feed").insert({
    user_id: userId,
    activity_type: "file_uploaded",
    metadata: JSON.stringify({
      file_id: fileId,
      action: "generate_materials",
      status: status,
    }),
  });

  if (error) {
    console.error("Failed to log activity:", error);
  }
}

async function handleProcessFile(req: Request): Promise<Response> {
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

    const body = (await req.json()) as ProcessFileRequest;
    const { fileId } = body;

    if (!fileId) {
      return new Response(
        JSON.stringify({ error: "Missing fileId" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch file record (gets moduleId from the file)
    const fileRecord = await fetchFileRecord(supabase, fileId, userId);
    if (!fileRecord) {
      return new Response(
        JSON.stringify({ error: "File not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const moduleId = fileRecord.module_id;

    // Update status to processing
    await updateFileStatus(supabase, fileId, "processing");

    // Download file content
    const rawContent = await downloadFileContent(supabase, fileRecord.storage_path);

    // Generate materials with Claude
    const materials = await generateMaterialsWithClaude(rawContent);

    // Insert generated materials
    await insertFlashcards(supabase, materials.flashcards, fileId, userId, moduleId);
    await insertMCQQuestions(supabase, materials.mcq_questions, fileId, userId, moduleId);
    await insertEssayPrompts(supabase, materials.essay_prompts, fileId, userId, moduleId);

    // Update file status to completed
    await updateFileStatus(supabase, fileId, "completed");

    // Update generations used
    await updateGenerationsUsed(supabase, userId);

    // Log activity
    await logActivity(supabase, userId, fileId, "completed");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Materials generated successfully",
        data: {
          flashcards_count: materials.flashcards.length,
          mcq_count: materials.mcq_questions.length,
          essays_count: materials.essay_prompts.length,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Process file error:", errorMessage);

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
    return handleProcessFile(req);
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
