"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Citation = { number: string; name: string };

type ChatMessage = {
  id: number;
  role: "user" | "assistant" | "error";
  content: string;
  citation?: Citation | null;
};

const SUGGESTIONS = [
  "How long do refunds take?",
  "Can I cancel after the courier picked up my order?",
  "My promo code isn't working.",
];

/** Matches the server's history cap. */
const MAX_HISTORY_MESSAGES = 12;

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPending, setIsPending] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);

  // Close on Escape while the panel is open.
  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Keep the newest message in view.
  useEffect(() => {
    const scroller = scrollRef.current;
    if (scroller) scroller.scrollTop = scroller.scrollHeight;
  }, [messages, isPending]);

  const send = useCallback(
    async (rawQuestion: string) => {
      const question = rawQuestion.trim();
      if (!question || isPending) return;

      // Only real conversation turns go back to the model — not error notices.
      const history = messages
        .filter((message) => message.role !== "error")
        .slice(-MAX_HISTORY_MESSAGES)
        .map((message) => ({
          role: message.role as "user" | "assistant",
          content: message.content,
        }));

      setMessages((current) => [
        ...current,
        { id: nextId.current++, role: "user", content: question },
      ]);
      setInput("");
      setIsPending(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: question, history }),
        });

        const data: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          const error =
            data && typeof data === "object" && "error" in data
              ? String((data as { error: unknown }).error)
              : "Sorry, something went wrong. Please try again.";
          setMessages((current) => [
            ...current,
            { id: nextId.current++, role: "error", content: error },
          ]);
          return;
        }

        const { reply, citation } = data as { reply: string; citation: Citation | null };
        setMessages((current) => [
          ...current,
          { id: nextId.current++, role: "assistant", content: reply, citation },
        ]);
      } catch {
        setMessages((current) => [
          ...current,
          {
            id: nextId.current++,
            role: "error",
            content: "We couldn't reach support chat. Please check your connection and try again.",
          },
        ]);
      } finally {
        setIsPending(false);
        inputRef.current?.focus();
      }
    },
    [isPending, messages],
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 print:hidden">
      {isOpen && (
        <div
          role="dialog"
          aria-label="Foodly support chat"
          className="flex h-[30rem] max-h-[calc(100vh-7.5rem)] w-[22rem] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-3xl bg-background shadow-2xl shadow-black/10 ring-1 ring-black/5"
        >
          {/* Header */}
          <div className="flex items-center gap-3 bg-brand px-5 py-4 text-white">
            <span
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 text-lg"
              aria-hidden
            >
              🍔
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">Foodly Support</p>
              <p className="truncate text-xs text-white/80">
                Answers from our customer policies
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close support chat"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-lg leading-none text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            >
              <span aria-hidden>×</span>
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-4"
          >
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <p className="text-sm leading-relaxed text-foreground/70">
                  Hi! Ask me anything about ordering, delivery, refunds, or your
                  Foodly account.
                </p>
                <div className="flex flex-wrap gap-2">
                  {SUGGESTIONS.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void send(suggestion)}
                      className="rounded-full border border-foreground/10 bg-cream px-3 py-1.5 text-left text-xs font-medium transition-colors hover:border-brand/40 hover:bg-brand/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div aria-live="polite" className="flex flex-col gap-3">
              {messages.map((message) =>
                message.role === "user" ? (
                  <p
                    key={message.id}
                    className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-brand px-4 py-2.5 text-sm leading-relaxed text-white"
                  >
                    {message.content}
                  </p>
                ) : message.role === "assistant" ? (
                  <div key={message.id} className="max-w-[85%] self-start">
                    <p className="rounded-2xl rounded-bl-md bg-cream px-4 py-2.5 text-sm leading-relaxed">
                      {message.content}
                    </p>
                    {message.citation && (
                      <p className="mt-1.5 pl-1 text-xs font-medium text-foreground/50">
                        Section {message.citation.number} — {message.citation.name}
                      </p>
                    )}
                  </div>
                ) : (
                  <p
                    key={message.id}
                    className="max-w-[85%] self-start rounded-2xl rounded-bl-md bg-foreground/5 px-4 py-2.5 text-sm leading-relaxed text-foreground/70"
                  >
                    {message.content}
                  </p>
                ),
              )}
            </div>

            {isPending && (
              <p className="self-start rounded-2xl rounded-bl-md bg-cream px-4 py-3" aria-label="Typing">
                <span className="flex gap-1" aria-hidden>
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                  <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" />
                </span>
              </p>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void send(input);
            }}
            className="flex items-center gap-2 border-t border-black/5 px-4 py-3"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(event) => setInput(event.target.value)}
              maxLength={1000}
              placeholder="Ask about a Foodly policy…"
              aria-label="Your question"
              className="min-w-0 flex-1 rounded-full border border-foreground/15 bg-background px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-foreground/40 focus:border-brand/50"
            />
            <button
              type="submit"
              disabled={isPending || input.trim().length === 0}
              aria-label="Send question"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand text-base text-white shadow-sm shadow-brand/30 transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span aria-hidden>↑</span>
            </button>
          </form>
        </div>
      )}

      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close support chat" : "Open support chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-brand text-2xl text-white shadow-lg shadow-brand/30 transition-transform hover:-translate-y-0.5 hover:bg-brand-dark"
      >
        <span aria-hidden>{isOpen ? "×" : "💬"}</span>
      </button>
    </div>
  );
}
