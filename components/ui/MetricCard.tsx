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

const ICON_CHIP: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-[#64748b]",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
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
        "rounded-card border border-line bg-surface p-4 shadow-sm transition-shadow hover:shadow-card",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow pt-0.5">{label}</span>
        {icon ? (
          <span
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
              ICON_CHIP[tone],
            )}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
      </div>
      <div
        className={cn(
          "num mt-3 leading-none tracking-tight",
          emphasizeValue ? "text-[27px] font-bold" : "text-xl font-semibold",
          VALUE_TONE[tone],
        )}
      >
        {value}
      </div>
      {sub ? <div className="mt-2 text-[12px] text-muted">{sub}</div> : null}
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}
