import { cn, formatPercent, formatRatio } from "@/lib/utils";
import { isWinRateMisleading } from "@/lib/scoring";
import { RiskBadge } from "./RiskBadge";
import { BehaviorFlags } from "./BehaviorFlags";
import { IconAlert, IconCheck, IconShieldAlert, IconShield } from "@/components/ui/icons";
import type { EA } from "@/lib/types";

interface Detection {
  text: string;
  tone: "success" | "warning" | "danger";
}

function detectRisks(ea: EA): Detection[] {
  const out: Detection[] = [];
  if (ea.grid) out.push({ text: "Grid averaging detected — positions added into losses.", tone: "danger" });
  if (ea.martingale) out.push({ text: "Martingale sizing detected — stake grows after losses.", tone: "danger" });
  if (!ea.stopLoss) out.push({ text: "No stop loss configured — open risk is uncapped.", tone: "danger" });
  if (ea.maxDrawdown >= 25) out.push({ text: `High max drawdown at ${formatPercent(ea.maxDrawdown)}.`, tone: "danger" });
  else if (ea.maxDrawdown >= 15) out.push({ text: `Elevated max drawdown at ${formatPercent(ea.maxDrawdown)}.`, tone: "warning" });
  if (ea.profitFactor < 1.2) out.push({ text: `Thin profit factor of ${formatRatio(ea.profitFactor)} — barely above break-even.`, tone: "danger" });
  else if (ea.profitFactor < 1.5) out.push({ text: `Modest profit factor of ${formatRatio(ea.profitFactor)}.`, tone: "warning" });
  if (isWinRateMisleading(ea)) out.push({ text: `Win rate of ${formatPercent(ea.winRate, 0)} may overstate the real edge.`, tone: "warning" });
  if (ea.spreadSensitive === "High") out.push({ text: "High spread sensitivity — costs can erode the edge.", tone: "warning" });
  if (ea.newsSensitive === "High") out.push({ text: "High news sensitivity — exposed to event-driven gaps.", tone: "warning" });

  if (out.length === 0) {
    out.push(
      { text: "No grid or martingale behaviour detected.", tone: "success" },
      { text: "Stop loss enforced and drawdown within range.", tone: "success" },
    );
  }
  return out;
}

function Indicator({
  label,
  bad,
  yes,
}: {
  label: string;
  bad: boolean;
  yes: boolean;
}) {
  return (
    <div className="flex-1 rounded-lg border border-line bg-surface px-3 py-2 text-center">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </div>
      <div
        className={cn(
          "mt-1 text-sm font-bold",
          bad ? "text-danger" : "text-success",
        )}
      >
        {yes ? "Yes" : "No"}
      </div>
    </div>
  );
}

export function RiskDetectionPanel({ ea }: { ea: EA }) {
  const detections = detectRisks(ea);
  const behaviourDanger = ea.grid || ea.martingale || !ea.stopLoss;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <RiskBadge risk={ea.riskType} />
        <span className="text-[12px] text-muted">
          Automated behaviour & risk scan
        </span>
      </div>

      <BehaviorFlags ea={ea} full />

      {/* Grid / Martingale detection */}
      <div
        className={cn(
          "rounded-xl border p-3",
          behaviourDanger
            ? "border-[#f6d3d3] bg-danger-soft"
            : "border-[#cdebd9] bg-success-soft",
        )}
      >
        <div className="flex items-center gap-2">
          {behaviourDanger ? (
            <IconShieldAlert size={16} className="text-danger" />
          ) : (
            <IconShield size={16} className="text-success" />
          )}
          <span
            className={cn(
              "text-[13px] font-semibold",
              behaviourDanger ? "text-danger" : "text-success",
            )}
          >
            Grid / Martingale detection
          </span>
        </div>
        <div className="mt-2.5 flex gap-2">
          <Indicator label="Grid" bad={ea.grid} yes={ea.grid} />
          <Indicator label="Martingale" bad={ea.martingale} yes={ea.martingale} />
          <Indicator label="Stop Loss" bad={!ea.stopLoss} yes={ea.stopLoss} />
        </div>
        <p
          className={cn(
            "mt-2.5 text-[12px] leading-snug",
            behaviourDanger ? "text-danger" : "text-success",
          )}
        >
          {behaviourDanger
            ? "Hidden-risk behaviour present. These systems can show a high win rate while exposing the account to large, sudden drawdowns."
            : "No hidden-risk behaviour. Risk is capped by a stop loss with no grid or martingale averaging."}
        </p>
      </div>

      {/* Detections list */}
      <ul className="space-y-1.5">
        {detections.map((d, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[13px] leading-snug"
          >
            {d.tone === "success" ? (
              <IconCheck size={15} className="mt-0.5 shrink-0 text-success" />
            ) : (
              <IconAlert
                size={15}
                className={cn(
                  "mt-0.5 shrink-0",
                  d.tone === "danger" ? "text-danger" : "text-warning",
                )}
              />
            )}
            <span className="text-ink">{d.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
