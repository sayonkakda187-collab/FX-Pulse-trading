"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageScope } from "@/components/shell/PageScope";
import { Card, SectionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ea/StatusBadge";
import { SourceBadge } from "@/components/ea/SourceBadge";
import { RiskBadge } from "@/components/ea/RiskBadge";
import { QualityScoreRing } from "@/components/ea/QualityScoreRing";
import { WinRateReality } from "@/components/ea/WinRateReality";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { IconEye, IconCheck, IconScale, IconAssistant } from "@/components/ui/icons";
import { cn, formatMoney, formatPercent, formatRatio } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import {
  freeEAs,
  paidEAs,
  getEAById,
  BEST_FREE_EA_ID,
  BEST_PAID_EA_ID,
} from "@/lib/mockData";
import type { EA } from "@/lib/types";

type Tone = "success" | "danger" | undefined;

function extrema(a: number, b: number, higherBetter: boolean): [Tone, Tone] {
  if (a === b) return [undefined, undefined];
  const better = higherBetter ? Math.max(a, b) : Math.min(a, b);
  return [a === better ? "success" : "danger", b === better ? "success" : "danger"];
}

function CellText({ tone, children }: { tone: Tone; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "num inline-flex min-w-[3.5rem] justify-center rounded-md px-2.5 py-1 text-[13.5px] font-semibold",
        tone === "success"
          ? "bg-success-soft text-success"
          : tone === "danger"
            ? "bg-danger-soft text-danger"
            : "text-ink",
      )}
    >
      {children}
    </span>
  );
}

function Candidate({ ea, kind }: { ea: EA; kind: "Free" | "Paid" }) {
  const router = useRouter();
  const { selectEA, askAI } = useFXPulse();
  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className="eyebrow">{kind} candidate</span>
        <StatusBadge status={ea.status} size="sm" />
      </div>
      <div className="flex items-center gap-3.5">
        <QualityScoreRing score={ea.qualityScore} size={64} showOutOf />
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <SourceBadge source={ea.sourceType} size="sm" />
            <RiskBadge risk={ea.riskType} size="sm" />
          </div>
          <h3 className="truncate text-base font-semibold text-ink">{ea.name}</h3>
          <p className="truncate text-[12.5px] text-muted">
            {ea.strategy} · {ea.pairs} · {ea.timeframe}
          </p>
        </div>
      </div>
      <WinRateReality ea={ea} variant="card" />
      <div className="grid grid-cols-3 gap-2 text-[12.5px]">
        <div className="rounded-lg border border-line bg-surface-soft px-3 py-2">
          <div className="text-faint">Value</div>
          <div className="num text-base font-semibold text-ink">{ea.valueScore}</div>
        </div>
        <div className="rounded-lg border border-line bg-surface-soft px-3 py-2">
          <div className="text-faint">Cost</div>
          <div className="num text-base font-semibold text-ink">
            {ea.sourceType === "Free" ? "Free" : formatMoney(ea.price ?? 0)}
          </div>
        </div>
        <div className="rounded-lg border border-line bg-surface-soft px-3 py-2">
          <div className="text-faint">Portfolio fit</div>
          <div
            className={cn(
              "text-base font-semibold",
              ea.status === "Approved"
                ? "text-success"
                : ea.status === "Rejected" || ea.status === "Quarantine"
                  ? "text-danger"
                  : "text-warning",
            )}
          >
            {ea.status === "Approved"
              ? "Eligible"
              : ea.status === "Rejected" || ea.status === "Quarantine"
                ? "Blocked"
                : "Review"}
          </div>
        </div>
      </div>
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3.5">
        <Button size="sm" variant="secondary" leftIcon={<IconEye size={15} />} onClick={() => { selectEA(ea.id); router.push(`/ea/${ea.id}`); }}>
          View
        </Button>
        <Button size="sm" variant="subtle" onClick={() => askAI(ea.id)}>Ask AI</Button>
      </div>
    </Card>
  );
}

function SumStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "warning" | "blue";
}) {
  return (
    <div className="rounded-xl border border-line bg-surface px-3 py-2.5">
      <div className="eyebrow">{label}</div>
      <div
        className={cn(
          "mt-0.5 text-[14px] font-bold",
          tone === "success" ? "text-success" : tone === "blue" ? "text-blue" : "text-warning",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const free = freeEAs();
  const paid = paidEAs();
  const [freeId, setFreeId] = useState(BEST_FREE_EA_ID);
  const [paidId, setPaidId] = useState(BEST_PAID_EA_ID);
  const f = getEAById(freeId) ?? free[0];
  const p = getEAById(paidId) ?? paid[0];

  const [qF, qP] = extrema(f.qualityScore, p.qualityScore, true);
  const [vF, vP] = extrema(f.valueScore, p.valueScore, true);
  const [pfF, pfP] = extrema(f.profitFactor, p.profitFactor, true);
  const [ddF, ddP] = extrema(f.maxDrawdown, p.maxDrawdown, false);

  const bool = (v: boolean, goodWhenYes: boolean): Tone =>
    v === goodWhenYes ? "success" : "danger";
  const fwd = (v?: number): Tone => (v == null ? undefined : v > 0 ? "success" : "danger");

  const rows: Array<{ label: string; free: React.ReactNode; paid: React.ReactNode }> = [
    {
      label: "Source",
      free: <SourceBadge source="Free" size="sm" />,
      paid: <SourceBadge source="Paid" size="sm" />,
    },
    {
      label: "Price",
      free: <CellText tone={undefined}>Free</CellText>,
      paid: <CellText tone={undefined}>{formatMoney(p.price ?? 0)}</CellText>,
    },
    {
      label: "Transparency",
      free: <span className="text-[12.5px] text-ink">{f.openSource ? "Open source" : "Closed"}</span>,
      paid: <span className="text-[12.5px] text-ink">Vendor trust: {p.vendorTrust}</span>,
    },
    { label: "Quality Score", free: <CellText tone={qF}>{f.qualityScore}</CellText>, paid: <CellText tone={qP}>{p.qualityScore}</CellText> },
    { label: "Value Score", free: <CellText tone={vF}>{f.valueScore}</CellText>, paid: <CellText tone={vP}>{p.valueScore}</CellText> },
    { label: "Win Rate", free: <CellText tone={undefined}>{formatPercent(f.winRate, 0)}</CellText>, paid: <CellText tone={undefined}>{formatPercent(p.winRate, 0)}</CellText> },
    { label: "Profit Factor", free: <CellText tone={pfF}>{formatRatio(f.profitFactor)}</CellText>, paid: <CellText tone={pfP}>{formatRatio(p.profitFactor)}</CellText> },
    { label: "Max Drawdown", free: <CellText tone={ddF}>{formatPercent(f.maxDrawdown)}</CellText>, paid: <CellText tone={ddP}>{formatPercent(p.maxDrawdown)}</CellText> },
    { label: "Grid / Martingale", free: <CellText tone={bool(f.grid || f.martingale, false)}>{f.grid || f.martingale ? "Yes" : "No"}</CellText>, paid: <CellText tone={bool(p.grid || p.martingale, false)}>{p.grid || p.martingale ? "Yes" : "No"}</CellText> },
    { label: "Stop Loss", free: <CellText tone={bool(f.stopLoss, true)}>{f.stopLoss ? "Yes" : "No"}</CellText>, paid: <CellText tone={bool(p.stopLoss, true)}>{p.stopLoss ? "Yes" : "No"}</CellText> },
    { label: "Forward Test", free: <CellText tone={fwd(f.forwardTestResult)}>{f.forwardTestResult != null ? formatMoney(f.forwardTestResult) : "—"}</CellText>, paid: <CellText tone={fwd(p.forwardTestResult)}>{p.forwardTestResult != null ? formatMoney(p.forwardTestResult) : "—"}</CellText> },
    { label: "Status", free: <StatusBadge status={f.status} size="sm" />, paid: <StatusBadge status={p.status} size="sm" /> },
  ];

  return (
    <div className="space-y-6">
      <PageScope scope="Free vs Paid Comparison" />

      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Put a free EA next to a paid one. Best values are green, worst are red —
        a cheaper or higher win-rate EA is not automatically the safer choice.
      </p>

      {/* Pickers */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <div className="eyebrow mb-1.5">Free candidate</div>
          <div className="flex flex-wrap gap-1.5">
            {free.map((ea) => (
              <button key={ea.id} type="button" onClick={() => setFreeId(ea.id)} aria-pressed={ea.id === freeId}
                className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px] font-medium transition-colors",
                  ea.id === freeId ? "border-blue bg-blue-soft text-blue" : "border-line bg-surface text-muted hover:text-ink")}>
                {ea.id === freeId ? <IconCheck size={13} /> : null}
                {ea.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="eyebrow mb-1.5">Paid candidate</div>
          <div className="flex flex-wrap gap-1.5">
            {paid.map((ea) => (
              <button key={ea.id} type="button" onClick={() => setPaidId(ea.id)} aria-pressed={ea.id === paidId}
                className={cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[12.5px] font-medium transition-colors",
                  ea.id === paidId ? "border-primary bg-primary-soft text-primary-dark" : "border-line bg-surface text-muted hover:text-ink")}>
                {ea.id === paidId ? <IconCheck size={13} /> : null}
                {ea.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* AI decision summary */}
      <div className="rounded-card border border-[#ddd6fe] bg-primary-soft/60 p-5 shadow-card">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-white">
            <IconAssistant size={15} />
          </span>
          <h2 className="text-[15px] font-bold text-ink">AI Decision Summary</h2>
        </div>
        <p className="mt-2 max-w-3xl text-[13.5px] leading-relaxed text-ink">
          {p.qualityScore >= f.qualityScore ? "The paid EA" : "The free EA"} has the
          stronger quality score, while{" "}
          {f.valueScore >= p.valueScore ? "the free EA" : "the paid EA"} offers better
          value and transparency. Both should remain in review until forward-test
          evidence improves.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
          <SumStat label="Best Quality" value={p.qualityScore >= f.qualityScore ? "Paid EA" : "Free EA"} tone="success" />
          <SumStat label="Best Value" value={f.valueScore >= p.valueScore ? "Free EA" : "Paid EA"} tone="success" />
          <SumStat label="Lowest Transparency Risk" value={f.openSource ? "Free EA" : "Paid EA"} tone="blue" />
          <SumStat label="Portfolio Status" value="Wait" tone="warning" />
        </div>
      </div>

      {/* Candidate cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Candidate ea={f} kind="Free" />
        <Candidate ea={p} kind="Paid" />
      </div>

      {/* Decision matrix */}
      <SectionCard title="Decision Matrix" icon={<IconScale size={16} />} bodyClassName="px-0 pb-0 pt-2">
        <div className="scroll-area overflow-x-auto">
          <table className="w-full min-w-[520px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line bg-surface-soft text-[12px] font-semibold uppercase tracking-[0.04em] text-muted">
                <th className="px-6 py-3.5 text-left">Metric</th>
                <th className="px-3 py-3.5 text-center">{f.name}</th>
                <th className="px-3 py-3.5 text-center">{p.name}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b border-line last:border-0 hover:bg-surface-soft">
                  <th scope="row" className="px-6 py-3.5 text-left text-[13px] font-medium text-muted">{r.label}</th>
                  <td className="px-3 py-3.5 text-center">{r.free}</td>
                  <td className="px-3 py-3.5 text-center">{r.paid}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* AI explanation */}
      <SectionCard title="AI verdict" icon={<IconScale size={16} />}>
        <AIVerdictCard
          hideHeader
          verdict={{
            title: "Free vs Paid",
            summary: "Choose on risk control and evidence — not on price or win rate.",
            evidence: [
              `${f.name} (Free): quality ${f.qualityScore}, PF ${formatRatio(f.profitFactor)}, drawdown ${formatPercent(f.maxDrawdown)}`,
              `${p.name} (Paid): quality ${p.qualityScore}, PF ${formatRatio(p.profitFactor)}, drawdown ${formatPercent(p.maxDrawdown)}`,
              "Grid / martingale and a missing stop loss outweigh a cheap price or high win rate",
            ],
            risk: "Picking the cheaper or higher win-rate EA can import hidden risk.",
            reason: "Free is not automatically safe; paid is not automatically better. Both must prove risk control.",
            suggestedAction: "Prefer the EA with stronger profit factor, lower drawdown and no grid/martingale — regardless of price.",
            confidence: "High",
          }}
        />
      </SectionCard>
    </div>
  );
}
