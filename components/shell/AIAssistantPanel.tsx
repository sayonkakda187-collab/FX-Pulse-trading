"use client";

import { useState } from "react";
import Link from "next/link";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { QualityScoreRing } from "@/components/ea/QualityScoreRing";
import { StatusBadge } from "@/components/ea/StatusBadge";
import {
  IconAssistant,
  IconClose,
  IconSend,
  IconSparkChat,
} from "@/components/ui/icons";
import { cn, formatPercent, formatRatio } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import {
  VAULT_VERDICT,
  compareVerdict,
  portfolioVerdict,
  getEAById,
  SUGGESTED_QUESTIONS,
} from "@/lib/mockData";
import type { AIVerdict } from "@/lib/types";

function PanelContent() {
  const {
    activeAIContext,
    selectedEAId,
    compareEAIds,
    portfolioDraftEAIds,
    messages,
    sendMessage,
    setAIPanelOpen,
  } = useFXPulse();
  const [text, setText] = useState("");

  const ea = getEAById(selectedEAId);

  let scopeLabel = "Vault Overview";
  let contextVerdict: AIVerdict & { title?: string } = {
    title: "Vault overview",
    ...VAULT_VERDICT,
  };

  if (activeAIContext === "EA" && ea) {
    scopeLabel = `Analyzing: ${ea.name}`;
    contextVerdict = { title: `Analysis — ${ea.name}`, ...ea.aiVerdict };
  } else if (activeAIContext === "Compare") {
    scopeLabel = "Comparing selected EAs";
    contextVerdict = { title: "Comparison", ...compareVerdict(compareEAIds) };
  } else if (activeAIContext === "Portfolio Draft") {
    scopeLabel = "Portfolio Draft Review";
    contextVerdict = {
      title: "Portfolio review",
      ...portfolioVerdict(portfolioDraftEAIds),
    };
  }

  // Once the analyst asks something, show the latest answer instead.
  const hasAsked = messages.some((m) => m.role === "user");
  const lastVerdict = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && m.verdict)?.verdict;
  const bodyVerdict = hasAsked && lastVerdict ? lastVerdict : contextVerdict;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="border-b border-line px-4 py-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
              <IconAssistant size={16} />
            </span>
            <span className="text-[14px] font-bold text-ink">AI Assistant</span>
          </div>
          <button
            type="button"
            onClick={() => setAIPanelOpen(false)}
            aria-label="Hide AI Assistant panel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-surface-soft hover:text-ink"
          >
            <IconClose size={16} />
          </button>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 rounded-lg bg-primary-soft px-2.5 py-1.5 text-[12px] font-medium text-primary-dark">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          {scopeLabel}
        </div>
      </div>

      {/* Body */}
      <div className="scroll-area flex-1 space-y-3.5 overflow-y-auto px-4 py-4">
        {activeAIContext === "EA" && ea ? (
          <div className="rounded-card border border-line bg-surface-soft p-3">
            <div className="flex items-center justify-between gap-2">
              <Link
                href={`/ea/${ea.id}`}
                className="text-[14px] font-semibold text-ink hover:text-primary-dark hover:underline"
              >
                {ea.name}
              </Link>
              <StatusBadge status={ea.status} size="sm" />
            </div>
            <div className="mt-2.5 flex items-center gap-3">
              <QualityScoreRing score={ea.qualityScore} size={50} />
              <dl className="grid flex-1 grid-cols-3 gap-1.5 text-center">
                <div>
                  <dt className="text-[10px] uppercase text-faint">Win</dt>
                  <dd className="num text-[13px] font-semibold text-ink">
                    {formatPercent(ea.winRate, 0)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-faint">PF</dt>
                  <dd
                    className={cn(
                      "num text-[13px] font-semibold",
                      ea.profitFactor >= 1.5
                        ? "text-success"
                        : ea.profitFactor >= 1.25
                          ? "text-warning"
                          : "text-danger",
                    )}
                  >
                    {formatRatio(ea.profitFactor)}
                  </dd>
                </div>
                <div>
                  <dt className="text-[10px] uppercase text-faint">Max DD</dt>
                  <dd
                    className={cn(
                      "num text-[13px] font-semibold",
                      ea.maxDrawdown < 10
                        ? "text-success"
                        : ea.maxDrawdown < 20
                          ? "text-warning"
                          : "text-danger",
                    )}
                  >
                    {formatPercent(ea.maxDrawdown)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        ) : null}

        <AIVerdictCard verdict={bodyVerdict} compact />
      </div>

      {/* Footer: suggested questions + input */}
      <div className="border-t border-line px-4 py-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-faint">
          <IconSparkChat size={13} />
          Suggested questions
        </div>
        <div className="no-scrollbar mb-3 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => sendMessage(q)}
              className="rounded-full border border-line bg-surface-soft px-2.5 py-1 text-left text-[12px] text-ink transition-colors hover:border-primary hover:text-primary-dark"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask about risk, evidence, fit…"
            aria-label="Ask the AI assistant"
            className="h-10 flex-1 rounded-xl border border-line bg-surface-soft px-3 text-sm text-ink outline-none placeholder:text-faint focus:border-primary focus:bg-surface"
          />
          <button
            type="submit"
            aria-label="Send message"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-dark disabled:opacity-50"
            disabled={!text.trim()}
          >
            <IconSend size={16} />
          </button>
        </form>
        <p className="mt-2 text-center text-[11px] text-faint">
          Analysis only, not financial advice ·{" "}
          <Link href="/assistant" className="underline hover:text-muted">
            Open full assistant
          </Link>
        </p>
      </div>
    </div>
  );
}

export function AIAssistantPanel() {
  const { aiPanelOpen, setAIPanelOpen } = useFXPulse();

  return (
    <>
      {/* Desktop fixed column (xl and up) */}
      {aiPanelOpen ? (
        <aside className="sticky top-0 hidden h-screen w-[360px] shrink-0 border-l border-line xl:block">
          <PanelContent />
        </aside>
      ) : null}

      {/* Drawer for < xl */}
      <div
        className={cn(
          "fixed inset-0 z-50 xl:hidden",
          aiPanelOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!aiPanelOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            aiPanelOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={() => setAIPanelOpen(false)}
        />
        <div
          className={cn(
            "absolute right-0 top-0 h-full w-[360px] max-w-[88vw] border-l border-line transition-transform duration-200",
            aiPanelOpen ? "translate-x-0" : "translate-x-full",
          )}
          role="dialog"
          aria-label="AI Assistant"
        >
          <PanelContent />
        </div>
      </div>
    </>
  );
}
