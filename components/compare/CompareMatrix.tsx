"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ea/StatusBadge";
import { RiskBadge } from "@/components/ea/RiskBadge";
import { QualityScoreRing } from "@/components/ea/QualityScoreRing";
import { IconClose, IconShield, IconAlert, IconPortfolio } from "@/components/ui/icons";
import { cn, formatPercent, formatRatio } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA, RiskType } from "@/lib/types";

type CellTone = "success" | "danger" | undefined;

const CELL: Record<"success" | "danger", string> = {
  success: "bg-success-soft text-success font-semibold",
  danger: "bg-danger-soft text-danger font-semibold",
};

const RISK_RANK: Record<RiskType, number> = {
  Low: 1,
  Normal: 2,
  Medium: 3,
  High: 4,
  Extreme: 5,
};
const STATUS_RANK: Record<EA["status"], number> = {
  Approved: 5,
  Testing: 3,
  Watchlist: 3,
  New: 2,
  Quarantine: 1,
  Rejected: 0,
};

function extremaTone(
  value: number | undefined,
  values: number[],
  higherIsBetter: boolean,
): CellTone {
  if (value == null || values.length < 2) return undefined;
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) return undefined;
  const best = higherIsBetter ? max : min;
  const worst = higherIsBetter ? min : max;
  if (value === best) return "success";
  if (value === worst) return "danger";
  return undefined;
}

function Cell({ tone, children }: { tone: CellTone; children: React.ReactNode }) {
  return (
    <td className="border-b border-line px-3 py-2.5 text-center align-middle">
      <span
        className={cn(
          "num inline-flex min-w-[3.5rem] justify-center rounded-md px-2 py-1 text-[13px]",
          tone ? CELL[tone] : "text-ink",
        )}
      >
        {children}
      </span>
    </td>
  );
}

export function CompareMatrix({ eas }: { eas: EA[] }) {
  const { removeFromCompare, addToPortfolioDraft } = useFXPulse();

  const scores = eas.map((e) => e.qualityScore);
  const winRates = eas.map((e) => e.winRate);
  const pfs = eas.map((e) => e.profitFactor);
  const dds = eas.map((e) => e.maxDrawdown);
  const recoveries = eas
    .map((e) => e.recoveryFactor)
    .filter((v): v is number => v != null);
  const riskRanks = eas.map((e) => RISK_RANK[e.riskType]);
  const statusRanks = eas.map((e) => STATUS_RANK[e.status]);

  const safest = [...eas].sort((a, b) => b.qualityScore - a.qualityScore)[0];
  const avoid = [...eas].sort(
    (a, b) =>
      RISK_RANK[b.riskType] - RISK_RANK[a.riskType] ||
      a.qualityScore - b.qualityScore,
  )[0];

  const eligible = eas.filter(
    (e) =>
      e.status === "Approved" && !e.grid && !e.martingale && e.stopLoss,
  );

  const sendSafe = () => {
    if (eligible.length === 0) {
      window.alert(
        "No EAs in this comparison meet the portfolio draft rules (Approved, no grid/martingale, stop loss required).",
      );
      return;
    }
    eligible.forEach((e) => addToPortfolioDraft(e.id));
    window.alert(
      `Sent ${eligible.length} safe EA${eligible.length > 1 ? "s" : ""} to the Portfolio Draft: ${eligible
        .map((e) => e.name)
        .join(", ")}.`,
    );
  };

  const labelCol =
    "sticky left-0 z-10 bg-surface border-b border-line px-4 py-2.5 text-left text-[12px] font-semibold uppercase tracking-wide text-faint";

  return (
    <div className="overflow-hidden rounded-card border border-line bg-surface shadow-card">
      <div className="scroll-area overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className={cn(labelCol, "align-bottom")}>EA</th>
              {eas.map((ea) => (
                <th
                  key={ea.id}
                  className="border-b border-line px-3 py-3 text-center align-bottom"
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <QualityScoreRing score={ea.qualityScore} size={40} />
                      <button
                        type="button"
                        onClick={() => removeFromCompare(ea.id)}
                        aria-label={`Remove ${ea.name} from comparison`}
                        className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-line text-muted hover:bg-surface-soft hover:text-danger"
                      >
                        <IconClose size={13} />
                      </button>
                    </div>
                    <Link
                      href={`/ea/${ea.id}`}
                      className="max-w-[9rem] text-[13px] font-semibold leading-tight text-ink hover:text-primary-dark hover:underline"
                    >
                      {ea.name}
                    </Link>
                    <span className="text-[11px] text-muted">{ea.platform}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope="row" className={labelCol}>Status</th>
              {eas.map((ea, i) => (
                <td key={ea.id} className="border-b border-line px-3 py-2.5 text-center">
                  <span
                    className={cn(
                      "inline-block rounded-md px-1.5 py-1",
                      extremaTone(statusRanks[i], statusRanks, true) === "success"
                        ? "bg-success-soft"
                        : extremaTone(statusRanks[i], statusRanks, true) === "danger"
                          ? "bg-danger-soft"
                          : "",
                    )}
                  >
                    <StatusBadge status={ea.status} size="sm" />
                  </span>
                </td>
              ))}
            </tr>

            <tr>
              <th scope="row" className={labelCol}>Quality Score</th>
              {eas.map((ea) => (
                <Cell key={ea.id} tone={extremaTone(ea.qualityScore, scores, true)}>
                  {ea.qualityScore}
                </Cell>
              ))}
            </tr>

            <tr>
              <th scope="row" className={labelCol}>
                Win Rate
              </th>
              {eas.map((ea) => (
                <Cell key={ea.id} tone={extremaTone(ea.winRate, winRates, true)}>
                  {formatPercent(ea.winRate, 0)}
                </Cell>
              ))}
            </tr>

            <tr>
              <th scope="row" className={labelCol}>Profit Factor</th>
              {eas.map((ea) => (
                <Cell key={ea.id} tone={extremaTone(ea.profitFactor, pfs, true)}>
                  {formatRatio(ea.profitFactor)}
                </Cell>
              ))}
            </tr>

            <tr>
              <th scope="row" className={labelCol}>Max Drawdown</th>
              {eas.map((ea) => (
                <Cell key={ea.id} tone={extremaTone(ea.maxDrawdown, dds, false)}>
                  {formatPercent(ea.maxDrawdown)}
                </Cell>
              ))}
            </tr>

            <tr>
              <th scope="row" className={labelCol}>Recovery Factor</th>
              {eas.map((ea) => (
                <Cell
                  key={ea.id}
                  tone={extremaTone(ea.recoveryFactor, recoveries, true)}
                >
                  {ea.recoveryFactor != null ? ea.recoveryFactor.toFixed(1) : "—"}
                </Cell>
              ))}
            </tr>

            <tr>
              <th scope="row" className={labelCol}>Risk Type</th>
              {eas.map((ea, i) => (
                <td key={ea.id} className="border-b border-line px-3 py-2.5 text-center">
                  <span
                    className={cn(
                      "inline-block rounded-md px-1.5 py-1",
                      extremaTone(riskRanks[i], riskRanks, false) === "success"
                        ? "bg-success-soft"
                        : extremaTone(riskRanks[i], riskRanks, false) === "danger"
                          ? "bg-danger-soft"
                          : "",
                    )}
                  >
                    <RiskBadge risk={ea.riskType} size="sm" />
                  </span>
                </td>
              ))}
            </tr>

            {(
              [
                ["Grid", (e: EA) => e.grid, false],
                ["Martingale", (e: EA) => e.martingale, false],
                ["Stop Loss", (e: EA) => e.stopLoss, true],
              ] as const
            ).map(([label, get, goodTrue]) => (
              <tr key={label}>
                <th scope="row" className={labelCol}>{label}</th>
                {eas.map((ea) => {
                  const v = get(ea);
                  const tone: CellTone = v === goodTrue ? "success" : "danger";
                  return (
                    <Cell key={ea.id} tone={tone}>
                      {v ? "Yes" : "No"}
                    </Cell>
                  );
                })}
              </tr>
            ))}

            <tr>
              <th scope="row" className={cn(labelCol, "align-top")}>AI Verdict</th>
              {eas.map((ea) => {
                const tone =
                  ea.status === "Approved"
                    ? "success"
                    : ea.status === "Rejected" || ea.status === "Quarantine"
                      ? "danger"
                      : "warning";
                return (
                  <td
                    key={ea.id}
                    className="border-b border-line px-3 py-2.5 text-center align-top"
                  >
                    <span
                      className={cn(
                        "inline-block rounded-md px-2 py-1 text-[12px] leading-snug",
                        tone === "success"
                          ? "bg-success-soft text-success"
                          : tone === "danger"
                            ? "bg-danger-soft text-danger"
                            : "bg-warning-soft text-warning",
                      )}
                    >
                      {ea.aiVerdictLine ?? "—"}
                    </span>
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer verdict */}
      <div className="flex flex-col gap-3 border-t border-line bg-surface-soft px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-success">
            <IconShield size={15} />
            Safest: {safest?.name ?? "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-danger">
            <IconAlert size={15} />
            Avoid: {avoid?.name ?? "—"}
          </span>
        </div>
        <Button
          variant="primary"
          size="sm"
          leftIcon={<IconPortfolio size={15} />}
          onClick={sendSafe}
        >
          Send safe EAs to Portfolio Draft
        </Button>
      </div>
    </div>
  );
}
