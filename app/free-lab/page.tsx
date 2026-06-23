"use client";

import Link from "next/link";
import { PageScope } from "@/components/shell/PageScope";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SectionCard } from "@/components/ui/Card";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { LabSpotlight, Checklist } from "@/components/lab/LabCards";
import { cn } from "@/lib/utils";
import {
  IconFlask,
  IconActivity,
  IconCheck,
  IconShield,
  IconShieldAlert,
} from "@/components/ui/icons";
import { freeEAs } from "@/lib/mockData";
import type { EA } from "@/lib/types";

function Flag({ value, goodWhenYes }: { value: boolean; goodWhenYes: boolean }) {
  const good = value === goodWhenYes;
  return (
    <span
      className={cn(
        "inline-flex min-w-[2.6rem] justify-center rounded-md px-2 py-0.5 text-[11.5px] font-semibold",
        good ? "bg-success-soft text-success" : "bg-danger-soft text-danger",
      )}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

const SEC_TONE: Record<string, string> = {
  Approved: "text-success",
  Testing: "text-success",
  Watchlist: "text-warning",
  Quarantine: "text-danger",
  Rejected: "text-danger",
  New: "text-muted",
};

export default function FreeLabPage() {
  const list = freeEAs();
  const openSource = list.filter((e) => e.openSource).length;
  const sourceAvail = list.filter((e) => e.codeAvailable).length;
  const highRisk = list.filter(
    (e) => e.riskType === "High" || e.riskType === "Extreme" || e.grid || e.martingale,
  ).length;
  const approvedResearch = list.filter(
    (e) => e.status !== "Rejected" && e.status !== "Quarantine",
  ).length;

  return (
    <div className="space-y-6">
      <PageScope scope="Free EA Safety Review" />

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Free EAs" value={list.length} sub="Community & open" icon={<IconFlask size={18} />} />
        <KpiCard label="Open Source" value={openSource} sub="Code published" tone="success" icon={<IconCheck size={18} />} />
        <KpiCard label="Source Available" value={sourceAvail} sub="Readable code" tone="primary" icon={<IconActivity size={18} />} />
        <KpiCard label="High-Risk Free" value={highRisk} sub="Grid / martingale / high DD" tone="danger" icon={<IconShieldAlert size={18} />} />
        <KpiCard label="Approved for Research" value={approvedResearch} sub="Cleared to test" tone="success" icon={<IconShield size={18} />} />
      </div>

      <SectionCard
        title="Security Review"
        icon={<IconShield size={16} />}
        description="Transparency and behaviour checks for free EAs. Free is not automatically safe."
        bodyClassName="px-0 pb-0 pt-2"
      >
        <div className="scroll-area overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line bg-surface-soft text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-faint">
                <th className="px-6 py-3">EA</th>
                <th className="px-3 py-3">Source</th>
                <th className="px-3 py-3 text-center">Code</th>
                <th className="px-3 py-3 text-center">DLL</th>
                <th className="px-3 py-3 text-center">WebRequest</th>
                <th className="px-3 py-3 text-center">Grid</th>
                <th className="px-3 py-3 text-center">Martingale</th>
                <th className="px-3 py-3 text-center">Stop Loss</th>
                <th className="px-6 py-3">Security Verdict</th>
              </tr>
            </thead>
            <tbody>
              {list.map((ea: EA) => (
                <tr key={ea.id} className="border-b border-line last:border-0 hover:bg-surface-soft">
                  <td className="px-6 py-3">
                    <Link href={`/ea/${ea.id}`} className="font-semibold text-ink hover:text-primary-dark hover:underline">
                      {ea.name}
                    </Link>
                    <div className={cn("text-[12px] font-medium", SEC_TONE[ea.status])}>{ea.status}</div>
                  </td>
                  <td className="px-3 py-3 text-[12.5px] text-muted">{ea.openSource ? "Open source" : "Closed"}</td>
                  <td className="px-3 py-3 text-center"><Flag value={!!ea.codeAvailable} goodWhenYes /></td>
                  <td className="px-3 py-3 text-center"><Flag value={!!ea.usesDLL} goodWhenYes={false} /></td>
                  <td className="px-3 py-3 text-center"><Flag value={!!ea.usesWebRequest} goodWhenYes={false} /></td>
                  <td className="px-3 py-3 text-center"><Flag value={ea.grid} goodWhenYes={false} /></td>
                  <td className="px-3 py-3 text-center"><Flag value={ea.martingale} goodWhenYes={false} /></td>
                  <td className="px-3 py-3 text-center"><Flag value={ea.stopLoss} goodWhenYes /></td>
                  <td className="px-6 py-3 text-[12.5px] text-muted">{ea.securityVerdict}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Free EA shortlist */}
      <div>
        <h2 className="mb-3 text-lg font-bold tracking-tight text-ink">Free EA shortlist</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <LabSpotlight
            label="Best Open Source Candidate"
            tone="success"
            eaId="sydney-swing"
            reason="Open source with a stop loss and contained drawdown — the cleanest free option to keep testing."
          />
          <LabSpotlight
            label="Free EA Needs Forward Test"
            tone="warning"
            eaId="frankfurt-range"
            reason="Thin edge and limited history — keep on watchlist and gather forward results."
          />
          <LabSpotlight
            label="Risky Free EA"
            tone="danger"
            eaId="grid-recovery"
            reason="92% win rate masks grid + martingale with no stop loss — rejected, study only."
          />
        </div>
      </div>

      {/* Checklist + AI note */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Checklist
          title="Free EA Safety Checklist"
          items={[
            "Source code available",
            "No DLL",
            "No unknown WebRequest",
            "No Grid / Martingale",
            "Stop Loss present",
            "Forward test required",
          ]}
        />
        <SectionCard title="AI note" icon={<IconShieldAlert size={16} />} className="lg:col-span-2">
          <AIVerdictCard
            hideHeader
            verdict={{
              title: "Free EA safety",
              summary: "Free is not automatically safe.",
              evidence: [
                "Open-source code improves transparency but does not prove profitability",
                "Closed free EAs that bundle a DLL or make web requests need extra scrutiny",
                "Grid / martingale free EAs can still wipe an account regardless of being free",
              ],
              risk: "A free price tag can create false confidence in an unsafe strategy.",
              reason: "Transparency helps review, but every EA still has to prove risk control.",
              suggestedAction: "Treat open-source as a starting point, then demo-test before trusting capital.",
              confidence: "High",
            }}
          />
        </SectionCard>
      </div>
    </div>
  );
}
