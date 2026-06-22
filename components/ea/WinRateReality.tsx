import { cn, formatPercent, formatRatio } from "@/lib/utils";
import { winRateReality } from "@/lib/scoring";
import { IconAlert, IconShield, IconInfo } from "@/components/ui/icons";
import type { EA } from "@/lib/types";

type Tone = "success" | "warning" | "danger";

const TONE_TEXT: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};
const TONE_BANNER: Record<Tone, string> = {
  success: "bg-success-soft border-[#cdebd9] text-success",
  warning: "bg-warning-soft border-[#f1e3c0] text-warning",
  danger: "bg-danger-soft border-[#f6d3d3] text-danger",
};

function pfTone(pf: number): Tone {
  if (pf >= 1.5) return "success";
  if (pf >= 1.25) return "warning";
  return "danger";
}
function ddTone(dd: number): Tone {
  if (dd < 10) return "success";
  if (dd < 20) return "warning";
  return "danger";
}

function Stat({
  label,
  value,
  tone,
  hint,
  large,
}: {
  label: string;
  value: string;
  tone?: Tone;
  hint?: string;
  large?: boolean;
}) {
  return (
    <div className="rounded-lg border border-line bg-surface-soft px-3 py-2">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </div>
      <div
        className={cn(
          "num font-semibold leading-tight",
          large ? "text-xl" : "text-lg",
          tone ? TONE_TEXT[tone] : "text-ink",
        )}
      >
        {value}
      </div>
      {hint ? <div className="text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

interface WinRateRealityProps {
  ea: EA;
  variant?: "card" | "panel";
  className?: string;
}

export function WinRateReality({
  ea,
  variant = "panel",
  className,
}: WinRateRealityProps) {
  const { headline, tone } = winRateReality(ea);
  const Icon =
    tone === "danger" ? IconAlert : tone === "warning" ? IconInfo : IconShield;

  if (variant === "card") {
    return (
      <div className={className}>
        <div
          className={cn(
            "flex items-center gap-1.5 text-[12px] font-semibold",
            TONE_TEXT[tone],
          )}
        >
          <Icon size={13} />
          <span>{headline}</span>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          <Stat label="Win Rate" value={formatPercent(ea.winRate, 0)} />
          <Stat
            label="Profit Factor"
            value={formatRatio(ea.profitFactor)}
            tone={pfTone(ea.profitFactor)}
          />
          <Stat
            label="Max DD"
            value={formatPercent(ea.maxDrawdown)}
            tone={ddTone(ea.maxDrawdown)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        className={cn(
          "flex items-start gap-2 rounded-xl border px-3.5 py-2.5",
          TONE_BANNER[tone],
        )}
      >
        <Icon size={18} />
        <div>
          <p className="text-sm font-semibold">{headline}</p>
          <p className="mt-0.5 text-[12px] opacity-80">
            Win rate is never read alone — it is judged against profit factor
            and max drawdown.
          </p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2.5">
        <Stat
          label="Win Rate"
          value={formatPercent(ea.winRate, 0)}
          hint="Share of winning trades"
          large
        />
        <Stat
          label="Profit Factor"
          value={formatRatio(ea.profitFactor)}
          tone={pfTone(ea.profitFactor)}
          hint="Gross win ÷ gross loss"
          large
        />
        <Stat
          label="Max Drawdown"
          value={formatPercent(ea.maxDrawdown)}
          tone={ddTone(ea.maxDrawdown)}
          hint="Deepest equity fall"
          large
        />
      </div>
    </div>
  );
}
