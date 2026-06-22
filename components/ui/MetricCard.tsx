import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Tone } from "./Badge";

const VALUE_TONE: Record<Tone, string> = {
  neutral: "text-ink",
  primary: "text-primary-dark",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

interface MetricCardProps {
  label: string;
  value: ReactNode;
  sub?: ReactNode;
  tone?: Tone;
  icon?: ReactNode;
  /** Optional visual (e.g. a sparkline) shown beneath the value. */
  children?: ReactNode;
  className?: string;
  emphasizeValue?: boolean;
}

export function MetricCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon,
  children,
  className,
  emphasizeValue = true,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[12px] font-medium uppercase tracking-wide text-faint">
          {label}
        </span>
        {icon ? (
          <span className={cn("shrink-0", VALUE_TONE[tone])} aria-hidden>
            {icon}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "num mt-2 leading-none",
          emphasizeValue ? "text-[26px] font-semibold" : "text-xl font-semibold",
          VALUE_TONE[tone],
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-[12px] text-muted">{sub}</div> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
