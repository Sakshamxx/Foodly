import {
  ApiError,
  FinishReason,
  GoogleGenAI,
  ThinkingLevel,
  Type,
  type Schema,
} from "@google/genai";
import * as z from "zod/v4";

import {
  buildSystemPrompt,
  ESCALATION_REPLY,
  loadPolicyDocument,
  NOT_COVERED_REPLY,
} from "@/lib/foodly-policies";

/**
 * Server-side chat endpoint. The Gemini API is only ever called from here —
 * the browser talks to this route, never to the model. The API key is read from
 * the GEMINI_API_KEY environment variable on the server and is never sent to
 * the client.
 */

/**
 * Pinned to an exact stable model rather than a `-latest` alias, so the
 * behaviour can't change under the widget without a code change. The flash-lite
 * tier is the right fit here (short grounded lookup over a 2.3k-token
 * document) and has far more free-tier request headroom than the full flash
 * models, which are capped very low.
 */
const MODEL = "gemini-3.5-flash-lite";
const MAX_MESSAGE_LENGTH = 1_000;
const MAX_HISTORY_MESSAGES = 12;

/** The shape the model must return, enforced by Gemini's structured output. */
const REPLY_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    kind: {
      type: Type.STRING,
      enum: ["answer", "not_covered", "escalate"],
      description: "Which kind of reply applies, tested in the documented order.",
    },
    answer: {
      type: Type.STRING,
      description:
        'The answer, using only the policy document. Empty string unless kind is "answer".',
    },
    section_number: {
      type: Type.STRING,
      description:
        'The number of the single section the answer came from, e.g. "5". Empty string unless kind is "answer".',
    },
    section_name: {
      type: Type.STRING,
      description:
        'The heading of that section, exactly as written in the document. Empty string unless kind is "answer".',
    },
  },
  required: ["kind", "answer", "section_number", "section_name"],
  propertyOrdering: ["kind", "answer", "section_number", "section_name"],
};

/** Re-validated after parsing, because a schema is a request, not a guarantee. */
const ModelReplySchema = z.object({
  kind: z.enum(["answer", "not_covered", "escalate"]),
  answer: z.string(),
  section_number: z.string(),
  section_name: z.string(),
});

const ChatRequestSchema = z.object({
  message: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().trim().min(1).max(MAX_MESSAGE_LENGTH),
      }),
    )
    .max(MAX_HISTORY_MESSAGES)
    .optional(),
});

type ChatResponse = {
  reply: string;
  /** Shown directly under the answer. Null for the two fixed replies. */
  citation: { number: string; name: string } | null;
};

/** Finish reasons that mean the model declined rather than answered. */
const DECLINED_FINISH_REASONS: readonly FinishReason[] = [
  FinishReason.SAFETY,
  FinishReason.PROHIBITED_CONTENT,
  FinishReason.BLOCKLIST,
  FinishReason.SPII,
  FinishReason.RECITATION,
];

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

/** Upstream statuses that are worth another attempt. */
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [400, 1_200];

/**
 * Gemini returns a transient 503 under load. Retry a couple of times with
 * backoff so a busy moment doesn't become a dead end for the customer.
 */
async function withRetries<T>(call: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await call();
    } catch (error) {
      const retryable = error instanceof ApiError && RETRYABLE_STATUSES.has(error.status);
      if (!retryable || attempt >= RETRY_DELAYS_MS.length) throw error;

      const jitter = Math.random() * 200;
      await new Promise((resolve) =>
        setTimeout(resolve, RETRY_DELAYS_MS[attempt] + jitter),
      );
    }
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "GEMINI_API_KEY is not set. Copy .env.example to .env.local and add your key.",
    );
    return errorResponse("The support chat is not configured right now.", 503);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return errorResponse("Expected a JSON body.", 400);
  }

  const parsedRequest = ChatRequestSchema.safeParse(body);
  if (!parsedRequest.success) {
    return errorResponse("Please send a single question of up to 1000 characters.", 400);
  }
  const { message, history = [] } = parsedRequest.data;
  // A conversation must start with a user turn, and the client may have
  // trimmed older messages away.
  const firstUserTurn = history.findIndex((turn) => turn.role === "user");
  const conversation = firstUserTurn === -1 ? [] : history.slice(firstUserTurn);

  let systemPrompt: string;
  let sections: Map<string, string>;
  try {
    const document = await loadPolicyDocument();
    systemPrompt = buildSystemPrompt(document, {
      isFirstTurn: conversation.length === 0,
    });
    sections = document.sections;
  } catch (error) {
    console.error("Could not load the Foodly policy document:", error);
    return errorResponse("The support chat is unavailable right now.", 503);
  }

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await withRetries(() =>
      ai.models.generateContent({
        model: MODEL,
        contents: [
          ...conversation.map((turn) => ({
            // Gemini names the assistant role "model".
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.content }],
          })),
          { role: "user", parts: [{ text: message }] },
        ],
        config: {
          // The full policy document is embedded here on every call.
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: REPLY_SCHEMA,
          // Grounded lookup over a short document — keep chat latency low.
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          maxOutputTokens: 2_048,
          temperature: 0,
        },
      }),
    );
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.status === 429) {
        // Logged because on the free tier this is usually an exhausted daily
        // quota, not a brief traffic spike.
        console.error(`Gemini rate limit or quota hit for ${MODEL}:`, error.message);
        return errorResponse("The support chat is busy. Please try again shortly.", 429);
      }
      if (error.status === 401 || error.status === 403) {
        console.error("GEMINI_API_KEY was rejected by the Gemini API.");
        return errorResponse("The support chat is not configured right now.", 503);
      }
      console.error(`Gemini API error ${error.status}:`, error.message);
      return errorResponse("Sorry, something went wrong. Please try again.", 502);
    }
    console.error("Unexpected error calling the Gemini API:", error);
    return errorResponse("Sorry, something went wrong. Please try again.", 500);
  }

  // Check why generation stopped before trusting the content.
  const finishReason = response.candidates?.[0]?.finishReason;
  const blockReason = response.promptFeedback?.blockReason;

  if (blockReason || (finishReason && DECLINED_FINISH_REASONS.includes(finishReason))) {
    // The model declined to handle it, so a person should.
    return Response.json({ reply: ESCALATION_REPLY, citation: null } satisfies ChatResponse);
  }

  if (finishReason === FinishReason.MAX_TOKENS) {
    console.error("The model's reply was truncated before it could be parsed.");
    return errorResponse("Sorry, something went wrong. Please try again.", 502);
  }

  let modelReply: z.infer<typeof ModelReplySchema>;
  try {
    modelReply = ModelReplySchema.parse(JSON.parse(response.text ?? ""));
  } catch (error) {
    console.error("The model did not return a reply matching the expected schema:", error);
    return errorResponse("Sorry, something went wrong. Please try again.", 502);
  }

  if (modelReply.kind === "escalate") {
    return Response.json({ reply: ESCALATION_REPLY, citation: null } satisfies ChatResponse);
  }

  const answer = modelReply.answer.trim();
  // A cited section must actually exist in the document, and its name is taken
  // from the document rather than from the model, so every citation shown is
  // real. Anything we cannot ground is reported as not covered.
  const sectionName = sections.get(modelReply.section_number.trim());

  if (modelReply.kind !== "answer" || !answer || !sectionName) {
    return Response.json({ reply: NOT_COVERED_REPLY, citation: null } satisfies ChatResponse);
  }

  return Response.json({
    reply: answer,
    citation: { number: modelReply.section_number.trim(), name: sectionName },
  } satisfies ChatResponse);
}
