import { cn } from "@/lib/utils";
import { Badge, type Tone } from "@/components/ui/Badge";
import {
  IconAssistant,
  IconAlert,
  IconCheck,
  IconArrowRight,
} from "@/components/ui/icons";
import type { AIVerdict, Confidence } from "@/lib/types";

const CONFIDENCE_TONE: Record<Confidence, Tone> = {
  High: "success",
  Medium: "warning",
  Low: "neutral",
};

interface AIVerdictCardProps {
  verdict: AIVerdict & { title?: string };
  /** Denser styling for the narrow AI panel. */
  compact?: boolean;
  className?: string;
  /** Hide the "AI Verdict" header (e.g. when already inside a chat bubble). */
  hideHeader?: boolean;
}

export function AIVerdictCard({
  verdict,
  compact = false,
  className,
  hideHeader = false,
}: AIVerdictCardProps) {
  return (
    <article
      className={cn(
        "rounded-card border border-line bg-surface",
        compact ? "p-3.5" : "p-5",
        className,
      )}
    >
      {!hideHeader ? (
        <header className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary-soft text-primary">
              <IconAssistant size={15} />
            </span>
            <span className="text-[13px] font-semibold text-ink">
              {verdict.title ?? "AI Verdict"}
            </span>
          </div>
          <Badge tone={CONFIDENCE_TONE[verdict.confidence]} size="sm" dot>
            {verdict.confidence} confidence
          </Badge>
        </header>
      ) : null}

      <p
        className={cn(
          "font-semibold text-ink",
          hideHeader ? "" : "mt-3",
          compact ? "text-[13px]" : "text-[15px]",
        )}
      >
        {verdict.summary}
      </p>

      {/* Evidence chips */}
      <div className="mt-3.5">
        <p className="eyebrow">Evidence</p>
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {verdict.evidence.map((e, i) => (
            <li
              key={i}
              className="inline-flex items-start gap-1.5 rounded-lg border border-line bg-surface-soft px-2.5 py-1.5 text-[12px] leading-snug text-ink"
            >
              <IconCheck size={13} className="mt-0.5 shrink-0 text-primary" />
              <span>{e}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Risk */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#f1e3c0] bg-warning-soft px-3 py-2">
        <IconAlert size={15} className="mt-0.5 shrink-0 text-warning" />
        <div className="text-[12px] leading-snug">
          <span className="font-semibold text-warning">Risk · </span>
          <span className="text-ink">{verdict.risk}</span>
        </div>
      </div>

      {/* Reason */}
      {verdict.reason ? (
        <div className="mt-3">
          <p className="eyebrow">Reason</p>
          <p className="mt-1 text-[12px] leading-snug text-muted">
            {verdict.reason}
          </p>
        </div>
      ) : null}

      {/* Suggested action */}
      <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#e4dffb] bg-primary-soft px-3 py-2.5">
        <IconArrowRight size={15} className="mt-0.5 shrink-0 text-primary" />
        <div className="text-[12.5px] leading-snug">
          <span className="font-semibold text-primary-dark">
            Suggested action ·{" "}
          </span>
          <span className="text-ink">{verdict.suggestedAction}</span>
        </div>
      </div>

      <p className="mt-3 text-[11px] leading-snug text-faint">
        Analysis only, not financial advice. FX Pulse Phase 1 uses mock data and
        does not connect to a broker.
      </p>
    </article>
  );
}
