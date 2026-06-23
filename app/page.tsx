"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageScope } from "@/components/shell/PageScope";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, SectionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ea/StatusBadge";
import { SourceBadge } from "@/components/ea/SourceBadge";
import { QualityScoreRing } from "@/components/ea/QualityScoreRing";
import { WinRateReality } from "@/components/ea/WinRateReality";
import { TrendLinesSvg } from "@/components/charts/TrendLinesSvg";
import { AllocationDonut } from "@/components/portfolio/AllocationDonut";
import {
  IconDashboard,
  IconCheck,
  IconEye,
  IconAlert,
  IconSparkChat,
  IconArrowRight,
  IconChevronRight,
  IconScale,
  IconShield,
  IconStar,
} from "@/components/ui/icons";
import { cn, formatPercent, formatRatio, scoreTone } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import {
  getEAById,
  VAULT_STATS,
  KPI_SPARKS,
  QUALITY_TREND,
  RISK_TREND,
  TREND_LABELS,
  BEST_FREE_EA_ID,
  BEST_PAID_EA_ID,
  BEST_VALUE_EA_ID,
  MOST_DANGEROUS_EA_ID,
  REVIEW_QUEUE,
} from "@/lib/mockData";
import type { EA } from "@/lib/types";

const SCORE_TEXT = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
} as const;

function Spotlight({
  label,
  kind,
  ea,
}: {
  label: string;
  kind: "free" | "paid" | "danger";
  ea: EA;
}) {
  const router = useRouter();
  const { askAI, selectEA } = useFXPulse();
  const labelTone =
    kind === "danger"
      ? "text-danger"
      : kind === "free"
        ? "text-blue"
        : "text-primary-dark";

  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <span className={cn("flex items-center gap-1.5 text-[12px] font-semibold", labelTone)}>
          {kind === "danger" ? <IconAlert size={14} /> : <IconStar size={14} />}
          {label}
        </span>
        <StatusBadge status={ea.status} size="sm" />
      </div>

      <div className="flex items-center gap-3.5">
        <QualityScoreRing score={ea.qualityScore} size={60} />
        <div className="min-w-0">
          <div className="mb-1 flex items-center gap-1.5">
            <SourceBadge source={ea.sourceType} size="sm" />
            <span className="num text-[11px] font-medium text-faint">
              Value {ea.valueScore}
            </span>
          </div>
          <h3 className="truncate text-[15px] font-semibold leading-tight text-ink">
            <Link
              href={`/ea/${ea.id}`}
              onClick={() => selectEA(ea.id)}
              className="hover:text-primary-dark hover:underline"
            >
              {ea.name}
            </Link>
          </h3>
          <p className="truncate text-[12px] text-muted">
            {ea.strategy} · {ea.timeframe}
          </p>
        </div>
      </div>

      <WinRateReality ea={ea} variant="card" />

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3.5">
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<IconEye size={15} />}
          onClick={() => {
            selectEA(ea.id);
            router.push(`/ea/${ea.id}`);
          }}
        >
          View
        </Button>
        <Button
          size="sm"
          variant="subtle"
          leftIcon={<IconSparkChat size={15} />}
          onClick={() => askAI(ea.id)}
        >
          Ask AI
        </Button>
      </div>
    </Card>
  );
}

function decisionRow(label: string, id: string, tone: "blue" | "primary" | "success" | "danger") {
  const ea = getEAById(id)!;
  const dot =
    tone === "blue"
      ? "bg-blue"
      : tone === "primary"
        ? "bg-primary"
        : tone === "success"
          ? "bg-success"
          : "bg-danger";
  return { label, ea, dot };
}

export default function DashboardPage() {
  const previewEAs = [
    "london-breakout",
    "sydney-swing",
    "trend-rider-pro",
    "grid-recovery",
    "gold-momentum",
  ].map((id) => getEAById(id)!);

  const recent = ["tokyo-mean-reversion", "london-breakout", "grid-recovery", "news-fade"].map(
    (id) => getEAById(id)!,
  );
  const recentTimes = ["2h ago", "5h ago", "1d ago", "2d ago"];

  const decisions = [
    decisionRow("Best Free EA", BEST_FREE_EA_ID, "blue"),
    decisionRow("Best Paid EA", BEST_PAID_EA_ID, "primary"),
    decisionRow("Best Value EA", BEST_VALUE_EA_ID, "success"),
    decisionRow("Most Dangerous EA", MOST_DANGEROUS_EA_ID, "danger"),
  ];

  return (
    <div className="space-y-6">
      <PageScope scope="Vault Overview" />

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
        <KpiCard label="Total EAs" value={VAULT_STATS.total} sub={`Free ${VAULT_STATS.free} · Paid ${VAULT_STATS.paid}`} icon={<IconDashboard size={18} />} spark={KPI_SPARKS.total} />
        <KpiCard label="Approved EAs" value={VAULT_STATS.approved} sub="+2 this week" tone="success" icon={<IconCheck size={18} />} spark={KPI_SPARKS.approved} />
        <KpiCard label="Needs Review" value={VAULT_STATS.needsReview} sub="AI review queue" tone="warning" icon={<IconEye size={18} />} spark={KPI_SPARKS.needsReview} />
        <KpiCard label="High Risk" value={VAULT_STATS.highRisk} sub="Grid / Martingale flagged" tone="danger" icon={<IconAlert size={18} />} spark={KPI_SPARKS.highRisk} />
        <KpiCard label="AI Reviewed" value={VAULT_STATS.aiReviewed} sub="Evidence-based reviews" tone="primary" icon={<IconSparkChat size={18} />} spark={KPI_SPARKS.aiReviewed} />
      </div>

      {/* Spotlights */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Spotlight label="Best Free EA" kind="free" ea={getEAById(BEST_FREE_EA_ID)!} />
        <Spotlight label="Best Paid EA" kind="paid" ea={getEAById(BEST_PAID_EA_ID)!} />
        <Spotlight label="Most Dangerous EA" kind="danger" ea={getEAById(MOST_DANGEROUS_EA_ID)!} />
      </div>

      {/* Quality overview + distribution */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <SectionCard
          title="EA Quality Overview"
          description="Average quality vs risk score across the vault."
          className="lg:col-span-2"
          action={
            <div className="flex items-center gap-3 text-[12px] font-medium">
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full bg-primary" /> Quality
              </span>
              <span className="flex items-center gap-1.5 text-muted">
                <span className="h-2 w-2 rounded-full bg-danger" /> Risk
              </span>
            </div>
          }
        >
          <TrendLinesSvg
            series={[
              { data: QUALITY_TREND, tone: "primary" },
              { data: RISK_TREND, tone: "danger" },
            ]}
            labels={TREND_LABELS}
          />
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#cdebd9] bg-success-soft px-3 py-2 text-[12.5px] text-success">
            <IconCheck size={15} className="mt-0.5 shrink-0" />
            <span>Average quality improved +8.4% this month; risk score down 5.2%.</span>
          </div>
        </SectionCard>

        <SectionCard
          title="Free vs Paid Distribution"
          description="How the vault splits by source."
        >
          <div className="flex flex-col items-center">
            <AllocationDonut
              segments={[
                { id: "free", label: "Free", value: VAULT_STATS.free, color: "var(--blue)" },
                { id: "paid", label: "Paid", value: VAULT_STATS.paid, color: "var(--primary)" },
              ]}
              size={168}
              centerValue={String(VAULT_STATS.total)}
              centerLabel="EAs"
            />
            <div className="mt-4 grid w-full grid-cols-2 gap-2">
              <div className="rounded-xl border border-line bg-surface-soft px-3 py-2 text-center">
                <div className="num text-lg font-bold text-blue">{VAULT_STATS.free}</div>
                <div className="text-[11px] text-muted">Free EAs</div>
              </div>
              <div className="rounded-xl border border-line bg-surface-soft px-3 py-2 text-center">
                <div className="num text-lg font-bold text-primary-dark">{VAULT_STATS.paid}</div>
                <div className="text-[11px] text-muted">Paid EAs</div>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Library preview */}
      <SectionCard
        title="EA Library Preview"
        description="A snapshot of your collected EAs — win rate is always shown with PF and drawdown."
        action={
          <Link href="/library">
            <Button size="sm" variant="secondary" rightIcon={<IconArrowRight size={15} />}>
              View all
            </Button>
          </Link>
        }
        bodyClassName="px-0 pb-0 pt-2"
      >
        <div className="scroll-area overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-y border-line bg-surface-soft text-left text-[12px] font-semibold uppercase tracking-[0.04em] text-faint">
                <th className="px-6 py-3">EA Name</th>
                <th className="px-3 py-3">Type</th>
                <th className="px-3 py-3 text-right">Quality</th>
                <th className="px-3 py-3 text-right">Win · PF · DD</th>
                <th className="px-6 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {previewEAs.map((ea) => (
                <tr key={ea.id} className="border-b border-line last:border-0 hover:bg-surface-soft">
                  <td className="px-6 py-3">
                    <Link href={`/ea/${ea.id}`} className="font-semibold text-ink hover:text-primary-dark hover:underline">
                      {ea.name}
                    </Link>
                    <div className="text-[12px] text-muted">{ea.strategy} · {ea.timeframe}</div>
                  </td>
                  <td className="px-3 py-3"><SourceBadge source={ea.sourceType} size="sm" /></td>
                  <td className={cn("num px-3 py-3 text-right text-[15px] font-bold", SCORE_TEXT[scoreTone(ea.qualityScore)])}>
                    {ea.qualityScore}
                  </td>
                  <td className="num px-3 py-3 text-right text-ink">
                    {formatPercent(ea.winRate, 0)} · {formatRatio(ea.profitFactor)} ·{" "}
                    <span className={ea.maxDrawdown >= 20 ? "text-danger" : ea.maxDrawdown >= 10 ? "text-warning" : "text-success"}>
                      {formatPercent(ea.maxDrawdown)}
                    </span>
                  </td>
                  <td className="px-6 py-3"><StatusBadge status={ea.status} size="sm" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* Lower grid */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Review First Queue */}
        <SectionCard title="Review First Queue" icon={<IconEye size={16} />}>
          <ul className="space-y-2.5">
            {REVIEW_QUEUE.slice(0, 3).map((item, i) => (
              <li key={item.eaId} className="flex items-center gap-3 rounded-xl border border-line bg-surface-soft px-3 py-2.5">
                <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary-soft text-[12px] font-bold text-primary-dark">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Link href={`/ea/${item.eaId}`} className="block truncate text-[13px] font-semibold text-ink hover:text-primary-dark hover:underline">
                    {item.eaName}
                  </Link>
                  <p className="truncate text-[12px] text-muted">{item.reason}</p>
                </div>
                <Link href={`/ea/${item.eaId}`} aria-label={`Review ${item.eaName}`} className="text-faint hover:text-primary">
                  <IconChevronRight size={16} />
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Recent AI Reviews */}
        <SectionCard title="Recent AI Reviews" icon={<IconSparkChat size={16} />}>
          <ul className="space-y-2.5">
            {recent.map((ea, i) => (
              <li key={ea.id} className="flex items-start gap-2.5">
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <Link href={`/ea/${ea.id}`} className="truncate text-[13px] font-semibold text-ink hover:text-primary-dark hover:underline">
                      {ea.name}
                    </Link>
                    <StatusBadge status={ea.status} size="sm" />
                  </div>
                  <p className="mt-0.5 line-clamp-1 text-[12px] text-muted">{ea.aiVerdict.summary}</p>
                  <span className="text-[11px] text-faint">{recentTimes[i]}</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        {/* Free vs Paid Decision */}
        <SectionCard
          title="Free vs Paid Decision"
          icon={<IconScale size={16} />}
          action={
            <Link href="/compare" className="text-[12px] font-semibold text-primary hover:underline">
              Compare
            </Link>
          }
        >
          <ul className="space-y-2.5">
            {decisions.map((d) => (
              <li key={d.label} className="flex items-center gap-3">
                <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", d.dot)} aria-hidden />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-faint">{d.label}</div>
                  <Link href={`/ea/${d.ea.id}`} className="block truncate text-[13px] font-semibold text-ink hover:text-primary-dark hover:underline">
                    {d.ea.name}
                  </Link>
                </div>
                <QualityScoreRing score={d.ea.qualityScore} size={34} />
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#ddd6fe] bg-primary-soft px-3 py-2 text-[12px] text-ink">
            <IconShield size={14} className="mt-0.5 shrink-0 text-primary" />
            <span>Free is not automatically safe; paid is not automatically better. Both must prove risk control.</span>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
