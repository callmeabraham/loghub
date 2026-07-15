import Anthropic from "@anthropic-ai/sdk";
import { retrieve, toSourceRefs } from "@/lib/retrieval";
import { buildSystemPrompt } from "@/lib/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const client = new Anthropic();

export async function POST(req: Request) {
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) {
    return new Response("messages must be a non-empty array", { status: 400 });
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const recentContext = messages
    .slice(-4)
    .map((m) => m.content)
    .join(" ");
  const retrievalQuery = `${recentContext} ${lastUser?.content ?? ""}`.trim();

  const retrieved = retrieve(retrievalQuery, 6);
  const sources = toSourceRefs(retrieved);
  const systemPrompt = buildSystemPrompt(retrieved);
  const sourcesHeader = Buffer.from(JSON.stringify(sources)).toString("base64");

  const encoder = new TextEncoder();

  const readable = new ReadableStream<Uint8Array>({
    async start(controller) {
      const stream = client.messages.stream({
        model: "claude-sonnet-5",
        max_tokens: 1024,
        system: systemPrompt,
        messages: messages.map((m) => ({ role: m.role, content: m.content })),
      });

      stream.on("text", (text) => {
        controller.enqueue(encoder.encode(text));
      });

      try {
        await stream.finalMessage();
        controller.close();
      } catch (err) {
        controller.error(err);
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "X-Sources": sourcesHeader,
    },
  });
}
