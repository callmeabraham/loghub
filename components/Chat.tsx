"use client";

import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourceBadges from "./SourceBadges";
import MoveRequestCard from "./MoveRequestCard";
import type { SourceRef } from "@/lib/retrieval";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: SourceRef[];
}

const EXAMPLE_PROMPTS = [
  "Can you move a piano from Hamburg to Berlin?",
  "I'm moving from Hamburg to Munich next month",
  "Was passiert, wenn beim Umzug etwas kaputt geht?",
];

const MOVE_REQUEST_RE = /```move-request\n([\s\S]*?)```/;

function splitMoveRequest(content: string): { text: string; moveRequest: string | null } {
  const match = content.match(MOVE_REQUEST_RE);
  if (!match || match.index === undefined) return { text: content, moveRequest: null };
  const text = (content.slice(0, match.index) + content.slice(match.index + match[0].length)).trim();
  return { text, moveRequest: match[1].trim() };
}

function uid(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder("utf-8").decode(bytes);
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string) {
    if (!text.trim() || isStreaming) return;

    const userMessage: Message = { id: uid(), role: "user", content: text };
    const assistantId = uid();
    const history = [...messages, userMessage];

    setMessages([...history, { id: assistantId, role: "assistant", content: "" }]);
    setInput("");
    setIsStreaming(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok || !res.body) {
        throw new Error(`Request failed: ${res.status}`);
      }

      const sourcesHeader = res.headers.get("X-Sources");
      const sources: SourceRef[] = sourcesHeader ? JSON.parse(base64ToUtf8(sourcesHeader)) : [];

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        const snapshot = accumulated;
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot, sources } : m))
        );
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Sorry, something went wrong reaching the assistant. Please try again." }
            : m
        )
      );
    } finally {
      setIsStreaming(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto flex max-w-2xl flex-col gap-5">
          {messages.length === 0 && (
            <div className="flex flex-col gap-2 pt-4">
              <p className="text-sm text-black/50 dark:text-white/40">Try asking:</p>
              <div className="flex flex-col items-start gap-2">
                {EXAMPLE_PROMPTS.map((p) => (
                  <button
                    key={p}
                    onClick={() => sendMessage(p)}
                    className="rounded-full border border-black/10 px-3 py-1.5 text-left text-sm hover:bg-black/[0.03] dark:border-white/15 dark:hover:bg-white/[0.05]"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => {
            const { text, moveRequest } =
              m.role === "assistant" ? splitMoveRequest(m.content) : { text: m.content, moveRequest: null };

            return (
              <div key={m.id} className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div
                  className={`max-w-xl rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    m.role === "user" ? "bg-blue-600 text-white" : "bg-black/[0.04] dark:bg-white/[0.06]"
                  }`}
                >
                  {m.role === "assistant" ? (
                    <div className="markdown-body">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{text || "…"}</ReactMarkdown>
                    </div>
                  ) : (
                    text
                  )}
                </div>
                {moveRequest && <MoveRequestCard raw={moveRequest} />}
                {m.role === "assistant" && m.sources && <SourceBadges sources={m.sources} />}
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border-t border-black/10 px-4 py-3 dark:border-white/10">
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about pricing, insurance, a move you're planning…"
            className="flex-1 rounded-full border border-black/10 bg-transparent px-4 py-2 text-sm outline-none focus:border-blue-500 dark:border-white/15"
            disabled={isStreaming}
          />
          <button
            type="submit"
            disabled={isStreaming || !input.trim()}
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
