"use client";

import { useState } from "react";
import Link from "next/link";
import { comingSoon } from "@/components/ui/Button";
import {
  IconAssistant,
  IconExpand,
  IconMore,
  IconSend,
  IconThumbUp,
  IconThumbDown,
  IconEye,
  IconScale,
  IconShieldAlert,
  IconReports,
  IconAlert,
  IconArrowRight,
  IconChevronRight,
} from "@/components/ui/icons";
import { cn, formatPercent, formatRatio } from "@/lib/utils";
import { isWinRateMisleading } from "@/lib/scoring";
import { useFXPulse } from "@/context/FXPulseContext";
import { getEAById, MOST_DANGEROUS_EA_ID } from "@/lib/mockData";
import type { EA } from "@/lib/types";

function Reason({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
}) {
  const toneClass =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "danger"
          ? "text-danger"
          : "text-ink";
  return (
    <li className="flex items-center justify-between gap-2 text-[12.5px]">
      <span className="text-muted">{label}</span>
      <span className={cn("num font-semibold", toneClass)}>{value}</span>
    </li>
  );
}

function ActionButton({
  icon,
  label,
  href,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
}) {
  const cls =
    "flex w-full items-center gap-2.5 rounded-xl border border-line bg-surface px-3 py-2.5 text-[13px] font-medium text-ink transition-colors hover:border-primary hover:bg-primary-soft hover:text-primary-dark";
  const inner = (
    <>
      <span className="text-primary">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <IconChevronRight size={15} className="text-faint" />
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}

function PanelContent() {
  const { selectedEAId, messages, sendMessage, setAIPanelOpen } = useFXPulse();
  const [text, setText] = useState("");

  const ea: EA =
    getEAById(selectedEAId) ?? getEAById(MOST_DANGEROUS_EA_ID)!;

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const question = lastUser?.text ?? "Which EA should I review first?";

  const headline = isWinRateMisleading(ea)
    ? `${ea.name} should be reviewed first — high win rate, but weak risk control.`
    : ea.aiVerdict.summary;

  const pfTone =
    ea.profitFactor >= 1.5 ? "success" : ea.profitFactor >= 1.25 ? "warning" : "danger";
  const ddTone =
    ea.maxDrawdown < 10 ? "success" : ea.maxDrawdown < 20 ? "warning" : "danger";

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text);
    setText("");
  };

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_16px_rgba(109,93,252,0.4)]">
            <IconAssistant size={16} />
          </span>
          <div>
            <div className="text-[14px] font-bold leading-none text-ink">
              AI Assistant
            </div>
            <div className="mt-1 text-[11px] text-faint">Powered by FX Pulse AI</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => comingSoon("Expanding the assistant")}
            aria-label="Expand panel"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-neutral-soft hover:text-ink"
          >
            <IconExpand size={15} />
          </button>
          <button
            type="button"
            onClick={() => setAIPanelOpen(false)}
            aria-label="Panel options"
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-muted hover:bg-neutral-soft hover:text-ink"
          >
            <IconMore size={16} />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="scroll-area flex-1 space-y-4 overflow-y-auto px-5 py-4">
        {/* User question bubble */}
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-3.5 py-2.5 text-[13px] font-medium text-white shadow-[0_6px_16px_rgba(109,93,252,0.3)]">
            {question}
          </div>
        </div>

        {/* AI analysis card */}
        <div className="rounded-card border border-line bg-surface p-4 shadow-card">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary">
              <IconAssistant size={14} />
            </span>
            <span className="text-[13px] font-bold text-ink">
              AI EA Analysis Result
            </span>
          </div>

          <p className="mt-3 text-[13px] leading-relaxed text-ink">{headline}</p>

          <div className="mt-3">
            <p className="eyebrow mb-2">Key reasons</p>
            <ul className="space-y-1.5 rounded-xl border border-line bg-surface-soft px-3 py-2.5">
              <Reason label="Win Rate" value={formatPercent(ea.winRate, 0)} />
              <Reason
                label="Profit Factor"
                value={formatRatio(ea.profitFactor)}
                tone={pfTone}
              />
              <Reason
                label="Max Drawdown"
                value={formatPercent(ea.maxDrawdown)}
                tone={ddTone}
              />
              <Reason
                label="Grid"
                value={ea.grid ? "Yes" : "No"}
                tone={ea.grid ? "danger" : "success"}
              />
              <Reason
                label="Martingale"
                value={ea.martingale ? "Yes" : "No"}
                tone={ea.martingale ? "danger" : "success"}
              />
              <Reason
                label="Stop Loss"
                value={ea.stopLoss ? "Yes" : "No"}
                tone={ea.stopLoss ? "success" : "danger"}
              />
            </ul>
          </div>

          {/* Risk */}
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#f6caca] bg-danger-soft px-3 py-2.5">
            <IconAlert size={15} className="mt-0.5 shrink-0 text-danger" />
            <p className="text-[12.5px] leading-snug">
              <span className="font-semibold text-danger">Risk · </span>
              <span className="text-ink">{ea.aiVerdict.risk}</span>
            </p>
          </div>

          {/* Recommendation */}
          <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-[#ddd6fe] bg-primary-soft px-3 py-2.5">
            <IconArrowRight size={15} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-[12.5px] leading-snug">
              <span className="font-semibold text-primary-dark">
                Recommendation ·{" "}
              </span>
              <span className="text-ink">{ea.aiVerdict.suggestedAction}</span>
            </p>
          </div>

          <p className="mt-3 text-[11px] text-faint">
            Analysis only, not financial advice.
          </p>

          <div className="mt-2 flex items-center gap-1 border-t border-line pt-2">
            <button
              type="button"
              onClick={() => comingSoon("Marking the answer helpful")}
              aria-label="Helpful"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint hover:bg-neutral-soft hover:text-success"
            >
              <IconThumbUp size={14} />
            </button>
            <button
              type="button"
              onClick={() => comingSoon("Marking the answer unhelpful")}
              aria-label="Not helpful"
              className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-faint hover:bg-neutral-soft hover:text-danger"
            >
              <IconThumbDown size={14} />
            </button>
          </div>
        </div>

        {/* Suggested actions */}
        <div className="space-y-2">
          <ActionButton
            icon={<IconEye size={16} />}
            label="Review EA Detail"
            href={`/ea/${ea.id}`}
          />
          <ActionButton
            icon={<IconScale size={16} />}
            label="Compare Free vs Paid"
            href="/compare"
          />
          <ActionButton
            icon={<IconShieldAlert size={16} />}
            label="View Risk Flags"
            href={`/ea/${ea.id}`}
          />
          <ActionButton
            icon={<IconReports size={16} />}
            label="Generate Report"
            onClick={() => comingSoon("Generating a report")}
          />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-line px-5 py-3">
        <form onSubmit={submit} className="flex items-center gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask anything about your EAs..."
            aria-label="Ask the AI assistant"
            className="h-11 flex-1 rounded-xl border border-line bg-surface-soft px-3.5 text-sm text-ink outline-none placeholder:text-faint focus:border-primary focus:bg-surface"
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
    </div>
  );
}

export function AIAssistantPanel() {
  const { aiPanelOpen, setAIPanelOpen } = useFXPulse();

  return (
    <>
      {aiPanelOpen ? (
        <aside className="sticky top-0 hidden h-screen w-[372px] shrink-0 border-l border-line xl:block">
          <PanelContent />
        </aside>
      ) : null}

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
            "absolute right-0 top-0 h-full w-[372px] max-w-[90vw] border-l border-line bg-surface transition-transform duration-200",
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
