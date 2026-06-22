"use client";

import Link from "next/link";
import { PageScope } from "@/components/shell/PageScope";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SectionCard } from "@/components/ui/Card";
import { AIVerdictCard } from "@/components/ea/AIVerdictCard";
import { cn, formatMoney, scoreTone } from "@/lib/utils";
import {
  IconTag,
  IconEye,
  IconActivity,
  IconCheck,
  IconShieldAlert,
} from "@/components/ui/icons";
import { paidEAs } from "@/lib/mockData";
import type { EA, TrustLevel } from "@/lib/types";

const SCORE_TEXT = { success: "text-success", warning: "text-warning", danger: "text-danger" } as const;

function trustTone(t?: TrustLevel) {
  return t === "High" ? "text-success" : t === "Medium" ? "text-warning" : "text-danger";
}
function pill(text: string, tone: "success" | "warning" | "danger" | "neutral") {
  const map = {
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    neutral: "bg-neutral-soft text-[#475569]",
  };
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-[11.5px] font-semibold", map[tone])}>{text}</span>;
}

export default function PaidLabPage() {
  const list = paidEAs();
  const watchlist = list.filter((e) => e.status === "Testing" || e.status === "New");
  const watchlistCost = watchlist.reduce((s, e) => s + (e.price ?? 0), 0);
  const strongEvidence = list.filter(
    (e) => (e.forwardTestResult ?? 0) > 0 && e.qualityScore >= 75,
  ).length;
  const highRisk = list.filter(
    (e) => e.riskType === "High" || e.riskType === "Extreme" || e.martingale,
  ).length;

  return (
    <div className="space-y-6">
      <PageScope scope="Vault Overview" />

      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total Paid EAs" value={list.length} sub="Vendor products" icon={<IconTag size={18} />} />
        <KpiCard label="On Watchlist" value={watchlist.length} sub="Evaluating before buy" tone="warning" icon={<IconEye size={18} />} />
        <KpiCard label="Watchlist Cost" value={formatMoney(watchlistCost)} sub="If all purchased" tone="primary" icon={<IconActivity size={18} />} />
        <KpiCard label="Strong Evidence" value={strongEvidence} sub="Proven forward results" tone="success" icon={<IconCheck size={18} />} />
        <KpiCard label="High-Risk Paid" value={highRisk} sub="Risky despite cost" tone="danger" icon={<IconShieldAlert size={18} />} />
      </div>

      <SectionCard
        title="Vendor Value Review"
        icon={<IconTag size={16} />}
        description="Does each paid EA justify its cost? Paid is not automatically better."
        bodyClassName="px-0 pb-0 pt-2"
      >
        <div className="scroll-area overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line bg-surface-soft text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-faint">
                <th className="px-6 py-3">EA</th>
                <th className="px-3 py-3 text-right">Price</th>
                <th className="px-3 py-3">License</th>
                <th className="px-3 py-3">Vendor</th>
                <th className="px-3 py-3">Support</th>
                <th className="px-3 py-3">Updates</th>
                <th className="px-3 py-3 text-right">Quality</th>
                <th className="px-3 py-3 text-right">Value</th>
                <th className="px-6 py-3">AI Verdict</th>
              </tr>
            </thead>
            <tbody>
              {list.map((ea: EA) => (
                <tr key={ea.id} className="border-b border-line last:border-0 hover:bg-surface-soft">
                  <td className="px-6 py-3">
                    <Link href={`/ea/${ea.id}`} className="font-semibold text-ink hover:text-primary-dark hover:underline">
                      {ea.name}
                    </Link>
                    <div className="text-[12px] text-muted">{ea.strategy} · {ea.timeframe}</div>
                  </td>
                  <td className="num px-3 py-3 text-right text-ink">{ea.price != null ? formatMoney(ea.price) : "—"}</td>
                  <td className="px-3 py-3 text-[12.5px] text-muted">{ea.license ?? "—"}</td>
                  <td className={cn("px-3 py-3 text-[12.5px] font-semibold", trustTone(ea.vendorTrust))}>{ea.vendorTrust ?? "—"}</td>
                  <td className="px-3 py-3">
                    {ea.support === "Priority"
                      ? pill("Priority", "success")
                      : ea.support === "Email"
                        ? pill("Email", "neutral")
                        : pill("None", "danger")}
                  </td>
                  <td className="px-3 py-3">
                    {ea.updates === "Active"
                      ? pill("Active", "success")
                      : ea.updates === "Occasional"
                        ? pill("Occasional", "warning")
                        : pill("Stale", "danger")}
                  </td>
                  <td className={cn("num px-3 py-3 text-right font-bold", SCORE_TEXT[scoreTone(ea.qualityScore)])}>{ea.qualityScore}</td>
                  <td className={cn("num px-3 py-3 text-right font-bold", SCORE_TEXT[scoreTone(ea.valueScore)])}>{ea.valueScore}</td>
                  <td className="px-6 py-3 text-[12.5px] text-muted">{ea.aiVerdictLine ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="AI note" icon={<IconTag size={16} />}>
        <AIVerdictCard
          hideHeader
          verdict={{
            title: "Paid EA value",
            summary: "Paid is not automatically better.",
            evidence: [
              "A high price does not guarantee risk control or real forward performance",
              "Vendor trust, support and update cadence matter as much as the strategy",
              "A paid EA using martingale with no stop loss is poor value at any price",
            ],
            risk: "Paying for an EA can anchor you to it despite weak evidence.",
            reason: "Cost only makes sense when justified by proven, risk-controlled results.",
            suggestedAction: "Require forward-test evidence and a stop loss before buying or trusting capital.",
            confidence: "High",
          }}
        />
      </SectionCard>
    </div>
  );
}
