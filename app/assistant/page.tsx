"use client";

import { useEffect, useRef, useState } from "react";
import { PageScope } from "@/components/shell/PageScope";
import { Card } from "@/components/ui/Card";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import {
  IconAssistant,
  IconSend,
  IconSparkChat,
  IconDashboard,
  IconFlask,
  IconTag,
  IconScale,
  IconPortfolio,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { SUGGESTED_QUESTIONS } from "@/lib/mockData";
import type { AIScope } from "@/lib/types";

const CONTEXT_CARDS: Array<{
  label: string;
  scope: AIScope;
  icon: (p: { size?: number }) => React.ReactNode;
}> = [
  { label: "Vault Overview", scope: "Vault Overview", icon: IconDashboard },
  { label: "Free EA Analyst", scope: "Free EA Safety Review", icon: IconFlask },
  { label: "Paid EA Analyst", scope: "Paid EA Value Review", icon: IconTag },
  { label: "Free vs Paid", scope: "Free vs Paid Comparison", icon: IconScale },
  { label: "Portfolio Review", scope: "Portfolio Draft Review", icon: IconPortfolio },
];

export default function AssistantPage() {
  const { messages, sendMessage, activeAIContext, setAIContext } = useFXPulse();
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement | null>(null);

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
    <div className="space-y-6">
      <PageScope scope="AI Workspace" />

      {/* Inner section title */}
      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink">AI Workspace</h2>
        <p className="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-muted">
          Ask evidence-based questions about EA quality, hidden risk, paid value,
          free safety and portfolio readiness. Mock analysis only — not financial
          advice.
        </p>
      </div>

      {/* Context selector */}
      <div>
        <div className="eyebrow mb-2">Context</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CONTEXT_CARDS.map((c) => {
            const active = activeAIContext === c.scope;
            const Icon = c.icon;
            return (
              <button
                key={c.scope}
                type="button"
                onClick={() => setAIContext(c.scope)}
                aria-pressed={active}
                className={cn(
                  "flex flex-col items-start gap-2 rounded-card border p-3.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary-soft text-primary-dark shadow-card"
                    : "border-line bg-surface text-muted hover:border-primary/40 hover:text-ink",
                )}
              >
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg",
                    active ? "bg-primary text-white" : "bg-neutral-soft text-muted",
                  )}
                >
                  <Icon size={16} />
                </span>
                <span className="text-[13px] font-semibold leading-tight text-ink">
                  {c.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Suggested questions */}
      <div>
        <div className="eyebrow mb-2">Suggested questions</div>
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
      </div>

      {/* Conversation */}
      <Card>
        <ul className="space-y-4">
          {messages.map((m) =>
            m.role === "user" ? (
              <li key={m.id} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm font-medium text-white">
                  {m.text}
                </div>
              </li>
            ) : (
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
            ),
          )}
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
          placeholder="Ask about risk, evidence, paid value, free safety, portfolio fit…"
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
