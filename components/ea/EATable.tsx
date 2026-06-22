"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { BehaviorFlags } from "./BehaviorFlags";
import { Badge } from "@/components/ui/Badge";
import {
  IconEye,
  IconSparkChat,
  IconCompare,
  IconCheck,
} from "@/components/ui/icons";
import { cn, formatPercent, formatRatio, scoreTone } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA } from "@/lib/types";

const SCORE_TEXT = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

function pfTone(pf: number) {
  return pf >= 1.5 ? "success" : pf >= 1.25 ? "warning" : "danger";
}
function ddTone(dd: number) {
  return dd < 10 ? "success" : dd < 20 ? "warning" : "danger";
}

function IconAction({
  label,
  onClick,
  active,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors disabled:opacity-40",
        active
          ? "border-transparent bg-primary text-white"
          : "border-line bg-surface text-muted hover:bg-surface-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}

export function EATable({ eas }: { eas: EA[] }) {
  const router = useRouter();
  const { askAI, toggleCompare, isComparing, compareEAIds, selectEA } =
    useFXPulse();

  return (
    <div className="scroll-area overflow-x-auto rounded-card border border-line bg-surface shadow-card">
      <table className="w-full min-w-[940px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-wide text-faint">
            <th scope="col" className="px-4 py-3 font-semibold">Status</th>
            <th scope="col" className="px-4 py-3 font-semibold">Name</th>
            <th scope="col" className="px-4 py-3 font-semibold">Platform</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Score</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Win&nbsp;%</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Profit&nbsp;Factor</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Max&nbsp;DD</th>
            <th scope="col" className="px-4 py-3 font-semibold">Risk</th>
            <th scope="col" className="px-4 py-3 font-semibold">Flags</th>
            <th scope="col" className="px-4 py-3 text-right font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {eas.map((ea) => {
            const comparing = isComparing(ea.id);
            const compareFull = compareEAIds.length >= 4 && !comparing;
            return (
              <tr
                key={ea.id}
                className="border-b border-line last:border-0 hover:bg-surface-soft"
              >
                <td className="px-4 py-3">
                  <StatusBadge status={ea.status} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/ea/${ea.id}`}
                    onClick={() => selectEA(ea.id)}
                    className="font-semibold text-ink hover:text-primary-dark hover:underline"
                  >
                    {ea.name}
                  </Link>
                  <div className="text-[12px] text-muted">
                    {ea.strategy} · {ea.timeframe}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge tone="neutral" size="sm">
                    {ea.platform}
                  </Badge>
                </td>
                <td
                  className={cn(
                    "num px-4 py-3 text-right font-semibold",
                    SCORE_TEXT[scoreTone(ea.qualityScore)],
                  )}
                >
                  {ea.qualityScore}
                </td>
                <td className="num px-4 py-3 text-right text-ink">
                  {formatPercent(ea.winRate, 0)}
                </td>
                <td
                  className={cn(
                    "num px-4 py-3 text-right font-semibold",
                    SCORE_TEXT[pfTone(ea.profitFactor)],
                  )}
                >
                  {formatRatio(ea.profitFactor)}
                </td>
                <td
                  className={cn(
                    "num px-4 py-3 text-right font-semibold",
                    SCORE_TEXT[ddTone(ea.maxDrawdown)],
                  )}
                >
                  {formatPercent(ea.maxDrawdown)}
                </td>
                <td className="px-4 py-3">
                  <RiskBadge risk={ea.riskType} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <BehaviorFlags ea={ea} size="sm" />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1.5">
                    <IconAction
                      label={`View ${ea.name}`}
                      onClick={() => {
                        selectEA(ea.id);
                        router.push(`/ea/${ea.id}`);
                      }}
                    >
                      <IconEye size={15} />
                    </IconAction>
                    <IconAction
                      label={`Ask AI about ${ea.name}`}
                      onClick={() => askAI(ea.id)}
                    >
                      <IconSparkChat size={15} />
                    </IconAction>
                    <IconAction
                      label={
                        comparing
                          ? `Remove ${ea.name} from compare`
                          : `Add ${ea.name} to compare`
                      }
                      onClick={() => toggleCompare(ea.id)}
                      active={comparing}
                      disabled={compareFull}
                    >
                      {comparing ? <IconCheck size={15} /> : <IconCompare size={15} />}
                    </IconAction>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
