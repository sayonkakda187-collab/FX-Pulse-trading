"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, SectionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { StatusBadge } from "@/components/ea/StatusBadge";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { AllocationDonut, ALLOCATION_COLORS } from "./AllocationDonut";
import {
  IconCheck,
  IconAlert,
  IconClose,
  IconPlus,
  IconShield,
  IconPortfolio,
} from "@/components/ui/icons";
import { cn, formatPercent } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { EAS, getEAsByIds, portfolioVerdict } from "@/lib/mockData";
import type { EA } from "@/lib/types";

function Rule({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-[13px]">
      {ok ? (
        <IconCheck size={16} className="mt-0.5 shrink-0 text-success" />
      ) : (
        <IconAlert size={16} className="mt-0.5 shrink-0 text-danger" />
      )}
      <span className={ok ? "text-ink" : "font-medium text-danger"}>
        {children}
      </span>
    </li>
  );
}

export function PortfolioDraft() {
  const {
    portfolioDraftEAIds,
    portfolioAllocations,
    setAllocation,
    removeFromPortfolioDraft,
    addToPortfolioDraft,
  } = useFXPulse();

  const [cap, setCap] = useState(15);
  const [pendingOverride, setPendingOverride] = useState<EA | null>(null);

  const holdings = getEAsByIds(portfolioDraftEAIds);
  const available = EAS.filter((e) => !portfolioDraftEAIds.includes(e.id));

  const totalWeight = portfolioDraftEAIds.reduce(
    (s, id) => s + (portfolioAllocations[id] ?? 0),
    0,
  );

  const { blendedDD, blendedQuality } = useMemo(() => {
    if (holdings.length === 0 || totalWeight === 0)
      return { blendedDD: 0, blendedQuality: 0 };
    let dd = 0;
    let q = 0;
    for (const ea of holdings) {
      const w = (portfolioAllocations[ea.id] ?? 0) / totalWeight;
      dd += w * ea.maxDrawdown;
      q += w * ea.qualityScore;
    }
    return { blendedDD: dd, blendedQuality: q };
  }, [holdings, portfolioAllocations, totalWeight]);

  const hasBehaviorRisk = holdings.some((e) => e.grid || e.martingale);
  const missingStopLoss = holdings.some((e) => !e.stopLoss);
  const ddWithinCap = blendedDD <= cap;
  const rulesPass = !hasBehaviorRisk && !missingStopLoss && ddWithinCap;

  const riskLabel = !rulesPass
    ? { text: "High risk", tone: "danger" as const }
    : blendedQuality >= 75 && blendedDD < 10
      ? { text: "Conservative", tone: "success" as const }
      : { text: "Moderate", tone: "warning" as const };

  // Correlation: shared pairs / strategies among holdings.
  const correlationWarnings = useMemo(() => {
    const warnings: string[] = [];
    const pairMap = new Map<string, string[]>();
    const stratMap = new Map<string, string[]>();
    for (const ea of holdings) {
      for (const p of ea.pairList) {
        if (p === "Multi-pair") continue;
        pairMap.set(p, [...(pairMap.get(p) ?? []), ea.name]);
      }
      stratMap.set(ea.strategy, [...(stratMap.get(ea.strategy) ?? []), ea.name]);
    }
    for (const [pair, names] of pairMap) {
      if (names.length > 1)
        warnings.push(`${names.join(" & ")} both trade ${pair}.`);
    }
    for (const [strat, names] of stratMap) {
      if (names.length > 1)
        warnings.push(`${names.join(" & ")} share a ${strat} strategy.`);
    }
    return warnings;
  }, [holdings]);

  const donutSegments = holdings.map((ea, i) => ({
    id: ea.id,
    label: ea.name,
    value: portfolioAllocations[ea.id] ?? 0,
    color: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
  }));

  const balanceTo100 = () => {
    const n = portfolioDraftEAIds.length;
    if (n === 0) return;
    const base = Math.floor(100 / n);
    portfolioDraftEAIds.forEach((id, i) =>
      setAllocation(id, i === n - 1 ? 100 - base * (n - 1) : base),
    );
  };

  const tryAdd = (ea: EA) => {
    if (ea.status === "Rejected" || ea.status === "Quarantine") {
      setPendingOverride(ea);
      return;
    }
    addToPortfolioDraft(ea.id);
  };

  const confirmOverride = () => {
    if (pendingOverride) addToPortfolioDraft(pendingOverride.id);
    setPendingOverride(null);
  };

  if (holdings.length === 0) {
    return (
      <div className="space-y-5">
        <EmptyState
          icon={<IconPortfolio size={22} />}
          title="Your portfolio draft is empty"
          description="Add approved EAs from the EA Library or send safe EAs from the Compare view to start planning a draft allocation."
          action={
            <Link href="/library">
              <Button variant="primary" leftIcon={<IconPlus size={16} />}>
                Browse EA Library
              </Button>
            </Link>
          }
        />
        <AddPicker available={available} onAdd={tryAdd} />
        {pendingOverride ? (
          <OverridePanel
            ea={pendingOverride}
            onCancel={() => setPendingOverride(null)}
            onConfirm={confirmOverride}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
      {/* Main column */}
      <div className="space-y-5">
        <SectionCard
          title="Draft holdings"
          description="Set each EA's share of the planned portfolio."
          action={
            <Button size="sm" variant="secondary" onClick={balanceTo100}>
              Balance to 100%
            </Button>
          }
        >
          <ul className="space-y-3">
            {holdings.map((ea, i) => {
              const weight = portfolioAllocations[ea.id] ?? 0;
              return (
                <li
                  key={ea.id}
                  className="rounded-xl border border-line bg-surface-soft p-3.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-3 w-3 shrink-0 rounded-full"
                        style={{
                          background:
                            ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                        }}
                        aria-hidden
                      />
                      <div>
                        <Link
                          href={`/ea/${ea.id}`}
                          className="text-[14px] font-semibold text-ink hover:text-primary-dark hover:underline"
                        >
                          {ea.name}
                        </Link>
                        <div className="mt-0.5 flex items-center gap-2">
                          <StatusBadge status={ea.status} size="sm" />
                          <span className="num text-[12px] text-muted">
                            DD {formatPercent(ea.maxDrawdown)} · Q{" "}
                            {ea.qualityScore}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="num w-12 text-right text-base font-semibold text-ink">
                        {weight}%
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFromPortfolioDraft(ea.id)}
                        aria-label={`Remove ${ea.name} from draft`}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-line text-muted hover:bg-surface hover:text-danger"
                      >
                        <IconClose size={14} />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={weight}
                    onChange={(e) =>
                      setAllocation(ea.id, Number(e.target.value))
                    }
                    aria-label={`${ea.name} allocation percentage`}
                    className="range-allocation mt-3"
                  />
                </li>
              );
            })}
          </ul>

          <div
            className={cn(
              "mt-3 flex items-center justify-between rounded-lg border px-3 py-2 text-[13px] font-semibold",
              totalWeight === 100
                ? "border-[#cdebd9] bg-success-soft text-success"
                : "border-[#f1e3c0] bg-warning-soft text-warning",
            )}
          >
            <span>Total allocation</span>
            <span className="num">
              {totalWeight}%{" "}
              {totalWeight === 100 ? "· balanced" : "· must sum to 100%"}
            </span>
          </div>
        </SectionCard>

        <AddPicker available={available} onAdd={tryAdd} />

        {pendingOverride ? (
          <OverridePanel
            ea={pendingOverride}
            onCancel={() => setPendingOverride(null)}
            onConfirm={confirmOverride}
          />
        ) : null}

        {correlationWarnings.length > 0 ? (
          <div className="rounded-card border border-[#f1e3c0] bg-warning-soft p-4">
            <div className="flex items-center gap-2 text-[13px] font-semibold text-warning">
              <IconAlert size={16} />
              Correlation warning
            </div>
            <ul className="mt-2 space-y-1 text-[13px] text-ink">
              {correlationWarnings.map((w, i) => (
                <li key={i}>• {w}</li>
              ))}
            </ul>
            <p className="mt-2 text-[12px] text-muted">
              Correlated EAs can draw down together. Consider diversifying pairs
              and strategies.
            </p>
          </div>
        ) : null}

        <SectionCard title="AI portfolio notes">
          <AIVerdictCard
            verdict={{ title: "Portfolio review", ...portfolioVerdict(portfolioDraftEAIds) }}
            hideHeader
          />
        </SectionCard>
      </div>

      {/* Aside */}
      <div className="space-y-5">
        <Card className="flex flex-col items-center">
          <AllocationDonut
            segments={donutSegments}
            centerValue={`${totalWeight}%`}
            centerLabel="Allocated"
          />
          <ul className="mt-4 w-full space-y-1.5">
            {holdings.map((ea, i) => (
              <li
                key={ea.id}
                className="flex items-center justify-between text-[13px]"
              >
                <span className="flex items-center gap-2 text-ink">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{
                      background: ALLOCATION_COLORS[i % ALLOCATION_COLORS.length],
                    }}
                    aria-hidden
                  />
                  {ea.name}
                </span>
                <span className="num text-muted">
                  {portfolioAllocations[ea.id] ?? 0}%
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <SectionCard title="Portfolio risk estimate">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-line bg-surface-soft px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-wide text-faint">
                Blended Max DD
              </div>
              <div
                className={cn(
                  "num text-xl font-semibold",
                  blendedDD < 10
                    ? "text-success"
                    : blendedDD < 20
                      ? "text-warning"
                      : "text-danger",
                )}
              >
                {formatPercent(blendedDD)}
              </div>
            </div>
            <div className="rounded-lg border border-line bg-surface-soft px-3 py-2.5">
              <div className="text-[11px] uppercase tracking-wide text-faint">
                Blended Quality
              </div>
              <div className="num text-xl font-semibold text-ink">
                {Math.round(blendedQuality)}
              </div>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between rounded-lg border border-line bg-surface-soft px-3 py-2.5">
            <span className="text-[13px] text-muted">Risk label</span>
            <Badge tone={riskLabel.tone} dot>
              {riskLabel.text}
            </Badge>
          </div>
        </SectionCard>

        <SectionCard title="Risk rules" icon={<IconShield size={16} />}>
          <ul className="space-y-2">
            <Rule ok={!hasBehaviorRisk}>No grid / martingale allowed</Rule>
            <Rule ok={!missingStopLoss}>Stop loss required on every holding</Rule>
            <Rule ok={ddWithinCap}>
              Blended drawdown within cap ({formatPercent(blendedDD)} of {cap}%)
            </Rule>
          </ul>
          <div className="mt-3">
            <label
              htmlFor="dd-cap"
              className="flex items-center justify-between text-[12px] font-medium text-muted"
            >
              <span>Max portfolio drawdown cap</span>
              <span className="num text-ink">{cap}%</span>
            </label>
            <input
              id="dd-cap"
              type="range"
              min={5}
              max={40}
              step={1}
              value={cap}
              onChange={(e) => setCap(Number(e.target.value))}
              className="range-allocation mt-2"
            />
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

function AddPicker({
  available,
  onAdd,
}: {
  available: EA[];
  onAdd: (ea: EA) => void;
}) {
  if (available.length === 0) return null;
  return (
    <SectionCard
      title="Add an EA to the draft"
      description="Approved EAs add directly. Quarantine and Rejected EAs require an override."
    >
      <div className="flex flex-wrap gap-2">
        {available.map((ea) => {
          const blocked = ea.status === "Rejected" || ea.status === "Quarantine";
          return (
            <button
              key={ea.id}
              type="button"
              onClick={() => onAdd(ea)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                blocked
                  ? "border-[#f6d3d3] bg-danger-soft text-danger hover:bg-[#fbe0e0]"
                  : "border-line bg-surface text-ink hover:border-primary hover:text-primary-dark",
              )}
            >
              <IconPlus size={14} />
              {ea.name}
              <StatusBadge status={ea.status} size="sm" />
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}

function OverridePanel({
  ea,
  onCancel,
  onConfirm,
}: {
  ea: EA;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const rejected = ea.status === "Rejected";
  return (
    <div
      className={cn(
        "rounded-card border p-4",
        rejected ? "border-[#f6d3d3] bg-danger-soft" : "border-[#f1e3c0] bg-warning-soft",
      )}
      role="alertdialog"
      aria-label={`Override required to add ${ea.name}`}
    >
      <div
        className={cn(
          "flex items-center gap-2 text-[14px] font-semibold",
          rejected ? "text-danger" : "text-warning",
        )}
      >
        <IconAlert size={17} />
        {rejected ? "Risk-rule override required" : "Quarantine warning"}
      </div>
      <p className="mt-1.5 text-[13px] text-ink">
        <span className="font-semibold">{ea.name}</span> is{" "}
        <span className="font-semibold">{ea.status}</span>.{" "}
        {ea.aiVerdict.summary}
      </p>
      <p className="mt-1 text-[12.5px] text-muted">{ea.aiVerdict.risk}</p>
      <div className="mt-3 flex items-center gap-2">
        <Button
          variant={rejected ? "danger" : "primary"}
          size="sm"
          onClick={onConfirm}
        >
          Override &amp; add anyway
        </Button>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
