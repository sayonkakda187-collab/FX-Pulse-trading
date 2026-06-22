"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { SectionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EADetailHeader } from "@/components/ea/EADetailHeader";
import { ScoreBreakdown } from "@/components/ea/ScoreBreakdown";
import { RiskDetectionPanel } from "@/components/ea/RiskDetectionPanel";
import { WinRateReality } from "@/components/ea/WinRateReality";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { EquityDrawdownChartSvg } from "@/components/charts/EquityDrawdownChartSvg";
import {
  IconActivity,
  IconShieldAlert,
  IconLibrary,
  IconCheck,
  IconAlert,
} from "@/components/ui/icons";
import { cn, formatMoney, formatPercent, formatRatio } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { getEAById } from "@/lib/mockData";

function Metric({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: string;
  tone?: "success" | "warning" | "danger";
  hint?: string;
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
    <div className="rounded-xl border border-line bg-surface-soft px-3.5 py-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
        {label}
      </div>
      <div className={cn("num mt-1 text-lg font-semibold", toneClass)}>
        {value}
      </div>
      {hint ? <div className="text-[11px] text-muted">{hint}</div> : null}
    </div>
  );
}

export default function EADetailPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : params.id?.[0];
  const ea = getEAById(id);
  const { selectEA } = useFXPulse();

  useEffect(() => {
    if (ea) selectEA(ea.id);
  }, [ea, selectEA]);

  if (!ea) {
    return (
      <EmptyState
        icon={<IconLibrary size={22} />}
        title="EA not found"
        description="This EA is not in the workspace. It may have been removed."
        action={
          <Link href="/library">
            <Button variant="primary">Back to EA Library</Button>
          </Link>
        }
      />
    );
  }

  const pfTone = ea.profitFactor >= 1.5 ? "success" : ea.profitFactor >= 1.25 ? "warning" : "danger";
  const ddTone = ea.maxDrawdown < 10 ? "success" : ea.maxDrawdown < 20 ? "warning" : "danger";
  const forwardAgrees =
    ea.forwardTestResult != null &&
    ea.backtestResult != null &&
    Math.sign(ea.forwardTestResult) === Math.sign(ea.backtestResult) &&
    ea.forwardTestResult > 0;

  return (
    <div className="space-y-6">
      <EADetailHeader ea={ea} />

      {/* Reality check */}
      <SectionCard
        title="Win-rate reality"
        description="Win rate is always judged with profit factor and drawdown."
      >
        <WinRateReality ea={ea} variant="panel" />
      </SectionCard>

      {/* Equity & drawdown */}
      <SectionCard
        title="Equity & drawdown curve"
        icon={<IconActivity size={16} />}
        description="Illustrative mock performance — equity growth above, drawdown depth below."
      >
        <EquityDrawdownChartSvg
          equity={ea.equityCurve}
          drawdown={ea.drawdownCurve}
          maxDrawdown={ea.maxDrawdown}
        />
      </SectionCard>

      {/* Key metrics */}
      <SectionCard title="Key metrics">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Metric label="Win Rate" value={formatPercent(ea.winRate, 0)} hint="Not read alone" />
          <Metric label="Profit Factor" value={formatRatio(ea.profitFactor)} tone={pfTone} />
          <Metric label="Max Drawdown" value={formatPercent(ea.maxDrawdown)} tone={ddTone} />
          <Metric
            label="Recovery Factor"
            value={ea.recoveryFactor != null ? ea.recoveryFactor.toFixed(1) : "—"}
            tone={ea.recoveryFactor != null && ea.recoveryFactor >= 1.5 ? "success" : "warning"}
          />
          <Metric
            label="Average Win"
            value={ea.averageWin != null ? formatMoney(ea.averageWin, 2) : "—"}
            tone="success"
          />
          <Metric
            label="Average Loss"
            value={ea.averageLoss != null ? formatMoney(ea.averageLoss, 2) : "—"}
            tone="danger"
          />
        </div>
      </SectionCard>

      {/* Score breakdown + Risk detection */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Score breakdown"
          description="Why the Quality Score is what it is."
        >
          <ScoreBreakdown ea={ea} />
        </SectionCard>

        <SectionCard
          title="Risk & behaviour detection"
          icon={<IconShieldAlert size={16} />}
        >
          <RiskDetectionPanel ea={ea} />
        </SectionCard>
      </div>

      {/* Backtest vs forward + snapshot */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SectionCard
          title="Backtest vs forward test"
          description="Forward results should broadly agree with the backtest."
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line bg-surface-soft px-4 py-3.5">
              <div className="text-[11px] uppercase tracking-wide text-faint">
                Backtest
              </div>
              <div
                className={cn(
                  "num mt-1 text-xl font-semibold",
                  (ea.backtestResult ?? 0) >= 0 ? "text-success" : "text-danger",
                )}
              >
                {ea.backtestResult != null ? formatMoney(ea.backtestResult) : "—"}
              </div>
            </div>
            <div className="rounded-xl border border-line bg-surface-soft px-4 py-3.5">
              <div className="text-[11px] uppercase tracking-wide text-faint">
                Forward test
              </div>
              <div
                className={cn(
                  "num mt-1 text-xl font-semibold",
                  ea.forwardTestResult == null
                    ? "text-muted"
                    : ea.forwardTestResult >= 0
                      ? "text-success"
                      : "text-danger",
                )}
              >
                {ea.forwardTestResult != null
                  ? formatMoney(ea.forwardTestResult)
                  : "Pending"}
              </div>
            </div>
          </div>
          <div
            className={cn(
              "mt-3 flex items-start gap-2 rounded-lg border px-3 py-2 text-[12.5px]",
              ea.forwardTestResult == null
                ? "border-line bg-surface-soft text-muted"
                : forwardAgrees
                  ? "border-[#cdebd9] bg-success-soft text-success"
                  : "border-[#f6d3d3] bg-danger-soft text-danger",
            )}
          >
            {ea.forwardTestResult == null ? (
              <IconActivity size={15} className="mt-0.5 shrink-0" />
            ) : forwardAgrees ? (
              <IconCheck size={15} className="mt-0.5 shrink-0" />
            ) : (
              <IconAlert size={15} className="mt-0.5 shrink-0" />
            )}
            <span>
              {ea.forwardTestResult == null
                ? "Forward test still in progress — judge cautiously until results accumulate."
                : forwardAgrees
                  ? "Forward test agrees with the backtest direction — a good consistency signal."
                  : "Forward test diverges from the backtest — treat the edge as unproven."}
            </span>
          </div>
        </SectionCard>

        <SectionCard title="Snapshot">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Snapshot label="Platform" value={ea.platform} />
            <Snapshot label="Strategy" value={ea.strategy} />
            <Snapshot label="Pairs" value={ea.pairs} />
            <Snapshot label="Timeframe" value={ea.timeframe} />
            <Snapshot label="Risk type" value={`${ea.riskType}`} />
            <Snapshot
              label="Added"
              value={new Date(ea.addedOn).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          </dl>
        </SectionCard>
      </div>

      {/* AI verdict */}
      <div>
        <h2 className="mb-3 text-[15px] font-semibold text-ink">AI verdict</h2>
        <AIVerdictCard verdict={{ title: `Analysis — ${ea.name}`, ...ea.aiVerdict }} />
      </div>
    </div>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[11px] uppercase tracking-wide text-faint">{label}</dt>
      <dd className="mt-0.5 font-medium text-ink">{value}</dd>
    </div>
  );
}
