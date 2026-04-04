import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { aiLimiter, rateLimitResponse } from "@/lib/rate-limit";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export const maxDuration = 30;

export async function POST(req: Request) {
  const session = await auth();

  if (!session) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (!(await aiLimiter.check(10, session.user?.id || "guest"))) {
    return rateLimitResponse();
  }

  if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
    return new Response("AI Assistant is currently unavailable on this server.", { status: 503 });
  }

  try {
    const { prompt, option, context, fileData, mimeType } = await req.json();

    let systemPrompt = "You are a helpful AI writing assistant specifically designed to help users with their notes in 'Lume Notes'. " +
      "IMPORTANT: Always return your response as plain text only. Do NOT use any Markdown formatting such as bolding (**), headers (#), or lists. " +
      "CRITICAL: Do NOT use dashes (-) or hyphens at all. Never place a dash between two words or letters (e.g., use 'high quality' instead of 'high-quality'). " +
      "Do not use dashes for bullet points. Just provide the text directly that should go into the note.";

    if (option === "summarize") {
      systemPrompt += " Provide a concise, high quality summary of the following text, focusing on the key takeaways and actionable points:";
    } else if (option === "rewrite") {
      systemPrompt += " Rewrite the following text to be more polished, clear, and professional, while strictly maintaining the same core meaning. Use a modern and elegant tone suitable for a note-taking application:";
    } else if (option === "brainstorm") {
      systemPrompt += " Generate creative, innovative brainstorm points and suggestions based on this topic. Structure your response with plain text lines, avoid markdown bullets:";
    } else if (option === "improve") {
      systemPrompt += " Optimize the grammar, tone, and flow of this text to make it sound exceptionally well written and engaging. Keep the core intent identical:";
    } else if (option === "tag") {
      systemPrompt += " Analyze the following text and suggest 3 to 5 extremely relevant, concise tags. Return ONLY the tags separated by commas, with no other text, headers, or dashes:";
    } else if (option === "simplify") {
      systemPrompt += " Rephrase the following text to use simpler language and shorter sentences, making it much easier to understand while keeping all key information:";
    } else if (option === "actions") {
      systemPrompt += " Extract a clear list of action items, tasks, or next steps from the following text. Present them as simple text lines without bullets or dashes:";
    } else if (option === "grammar") {
      systemPrompt += " Carefully check the following text for any grammatical errors, spelling mistakes, or punctuation issues. Provide the corrected text directly, maintaining the original style and tone:";
    } else if (option === "translate") {
      systemPrompt += " Translate the following text to English, ensuring a natural and professional tone while preserving the original meaning and intent:";
    } else {
      systemPrompt += " Answer the following prompt thoughtfully and concisely, incorporating any provided context where relevant.";
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    const userPrompt = `Note Context:\n${context || "No description or content yet."}\n\nExecution:\n${prompt}`;

    const contents: any[] = [userPrompt];
    if (fileData && mimeType) {
      contents.push({
        inlineData: {
          data: fileData,
          mimeType: mimeType
        }
      });
    }

    const result = await model.generateContentStream(contents);

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: any) {
    console.error("AI API Error:", error);
    if (error?.status === 429 || error?.message?.includes("429")) {
      return new Response("AI_RATE_LIMIT_REACHED", { status: 429 });
    }
    return new Response("INTERNAL_SERVER_ERROR", { status: 500 });
  }
}

