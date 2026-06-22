"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { IconAssistant, IconSend, IconSparkChat } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { SUGGESTED_QUESTIONS, getEAById } from "@/lib/mockData";
import type { AIScope } from "@/lib/types";

const SCOPES: AIScope[] = ["Vault Overview", "EA", "Compare", "Portfolio Draft"];

export default function AssistantPage() {
  const {
    messages,
    sendMessage,
    activeAIContext,
    setAIContext,
    selectedEAId,
  } = useFXPulse();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

  const ea = getEAById(selectedEAId);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  return (
    <div className="space-y-4">
      <p className="max-w-2xl text-[13.5px] text-muted">
        Ask the assistant about your vault, a specific EA, a comparison, or your
        portfolio draft. Answers are structured and risk-first — and are mock
        analysis only, not financial advice.
      </p>

      {/* Context selector */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div
          className="no-scrollbar inline-flex gap-1 overflow-x-auto rounded-xl border border-line bg-surface p-1"
          role="group"
          aria-label="Assistant context"
        >
          {SCOPES.map((s) => {
            const active = activeAIContext === s;
            const label = s === "EA" && ea ? `EA · ${ea.name}` : s;
            return (
              <button
                key={s}
                type="button"
                onClick={() => setAIContext(s)}
                aria-pressed={active}
                className={cn(
                  "shrink-0 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                  active
                    ? "bg-primary text-white"
                    : "text-muted hover:bg-surface-soft hover:text-ink",
                )}
              >
                {label}
              </button>
            );
          })}
        </div>
        {activeAIContext === "EA" && !ea ? (
          <span className="text-[12.5px] text-muted">
            No EA selected —{" "}
            <Link href="/library" className="text-primary hover:underline">
              pick one from the Library
            </Link>
            .
          </span>
        ) : null}
      </div>

      {/* Suggested questions */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => sendMessage(q)}
            className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1.5 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:text-primary-dark"
          >
            <IconSparkChat size={14} className="text-primary" />
            {q}
          </button>
        ))}
      </div>

      {/* Conversation */}
      <Card className="space-y-4" >
        <ul className="space-y-4">
          {messages.map((m) => {
            if (m.role === "user") {
              return (
                <li key={m.id} className="flex justify-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-sm text-white">
                    {m.text}
                  </div>
                </li>
              );
            }
            return (
              <li key={m.id} className="flex gap-2.5">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                  <IconAssistant size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  {m.verdict ? (
                    <AIVerdictCard verdict={m.verdict} />
                  ) : (
                    <div className="rounded-2xl rounded-tl-md border border-line bg-surface-soft px-4 py-2.5 text-sm leading-relaxed text-ink">
                      {m.text}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
        <div ref={endRef} />
      </Card>

      {/* Input */}
      <form
        onSubmit={submit}
        className="sticky bottom-4 flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-card"
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about risk, evidence, portfolio fit…"
          aria-label="Message the AI assistant"
          className="h-11 flex-1 rounded-xl bg-transparent px-3 text-sm text-ink outline-none placeholder:text-faint"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          aria-label="Send message"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
        >
          <IconSend size={17} />
        </button>
      </form>
    </div>
  );
}
