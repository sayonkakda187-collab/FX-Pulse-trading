import { cn, scoreTone } from "@/lib/utils";
import { computeScoreBreakdown } from "@/lib/scoring";
import type { EA } from "@/lib/types";

const BAR_TONE = {
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

const TEXT_TONE = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

export function ScoreBreakdown({ ea }: { ea: EA }) {
  const { components } = computeScoreBreakdown(ea);

  return (
    <div>
      <p className="text-[13px] leading-snug text-muted">
        The Quality Score is risk-first. Win rate is{" "}
        <span className="font-semibold text-ink">not</span> a direct input —
        profit factor, drawdown and behaviour safety carry the most weight.
      </p>

      <ul className="mt-4 space-y-3.5">
        {components.map((c) => {
          const tone = scoreTone(c.score);
          return (
            <li key={c.key}>
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[13px] font-semibold text-ink">
                    {c.label}
                  </span>
                  <span className="num rounded-md bg-neutral-soft px-1.5 py-0.5 text-[11px] font-medium text-muted">
                    {Math.round(c.weight * 100)}% weight
                  </span>
                </div>
                <span className={cn("num text-sm font-semibold", TEXT_TONE[tone])}>
                  {c.score}
                </span>
              </div>
              <div
                className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-neutral-soft"
                role="progressbar"
                aria-valuenow={c.score}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${c.label} sub-score`}
              >
                <div
                  className={cn("h-full rounded-full", BAR_TONE[tone])}
                  style={{ width: `${c.score}%` }}
                />
              </div>
              <p className="mt-1 text-[12px] text-muted">{c.note}</p>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-[11px] text-faint">
        Weighted model estimate reconciled to the published score of{" "}
        <span className="num font-semibold text-muted">{ea.qualityScore}</span>.
        Factors are illustrative of FX Pulse&apos;s risk-first scoring.
      </p>
    </div>
  );
}
