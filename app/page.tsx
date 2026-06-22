"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PageScope } from "@/components/shell/PageScope";
import { MetricCard } from "@/components/ui/MetricCard";
import { Card, SectionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge, type Tone } from "@/components/ui/Badge";
import { StatusBadge } from "@/components/ea/StatusBadge";
import { QualityScoreRing } from "@/components/ea/QualityScoreRing";
import { WinRateReality } from "@/components/ea/WinRateReality";
import { EATable } from "@/components/ea/EATable";
import { SparklineSvg } from "@/components/charts/SparklineSvg";
import {
  IconDashboard,
  IconShield,
  IconAlert,
  IconCheck,
  IconActivity,
  IconSparkChat,
  IconEye,
  IconArrowRight,
  IconChevronRight,
} from "@/components/ui/icons";
import {
  EAS,
  computeKPIs,
  AI_WARNINGS,
  REVIEW_QUEUE,
  BEST_EA_ID,
  RISKIEST_EA_ID,
  getEAById,
} from "@/lib/mockData";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA } from "@/lib/types";

const SEVERITY_TONE: Record<string, Tone> = {
  high: "danger",
  medium: "warning",
  low: "neutral",
};

function Spotlight({
  label,
  kind,
  ea,
}: {
  label: string;
  kind: "best" | "risk";
  ea: EA;
}) {
  const router = useRouter();
  const { askAI, selectEA } = useFXPulse();
  const tone = kind === "best" ? "success" : "danger";

  return (
    <Card className="flex flex-col gap-3.5">
      <div className="flex items-center justify-between">
        <Badge tone={tone} dot icon={kind === "best" ? <IconShield size={13} /> : <IconAlert size={13} />}>
          {label}
        </Badge>
        <StatusBadge status={ea.status} size="sm" />
      </div>

      <div className="flex items-center gap-3.5">
        <QualityScoreRing score={ea.qualityScore} size={64} />
        <div className="min-w-0">
          <h3 className="text-base font-semibold text-ink">
            <Link
              href={`/ea/${ea.id}`}
              onClick={() => selectEA(ea.id)}
              className="hover:text-primary-dark hover:underline"
            >
              {ea.name}
            </Link>
          </h3>
          <p className="text-[12.5px] text-muted">
            {ea.strategy} · {ea.pairs} · {ea.timeframe}
          </p>
          <SparklineSvg
            data={ea.sparkline}
            tone={kind === "best" ? "success" : "danger"}
            width={150}
            height={30}
            className="mt-1.5"
          />
        </div>
      </div>

      <WinRateReality ea={ea} variant="card" />

      <p className="flex items-start gap-1.5 text-[12.5px] text-muted">
        <IconSparkChat size={14} className="mt-0.5 shrink-0 text-primary" />
        <span>{ea.aiVerdict.summary}</span>
      </p>

      <div className="mt-auto flex items-center gap-2">
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

export default function DashboardPage() {
  const kpis = computeKPIs();
  const best = getEAById(BEST_EA_ID)!;
  const riskiest = getEAById(RISKIEST_EA_ID)!;
  const previewEAs = EAS.slice(0, 6);

  return (
    <div className="space-y-8">
      <PageScope scope="Vault Overview" />

      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Your EA vault at a glance — what you have, what is strong, what is
        dangerous, and what to review next. Win rate is always read alongside
        profit factor and drawdown.
      </p>

      {/* What you have */}
      <section className="space-y-3.5">
        <BandHeader eyebrow="What you have" title="Vault at a glance" />
        <div className="grid grid-cols-2 gap-3.5 md:grid-cols-3 xl:grid-cols-5">
          <MetricCard label="Total EAs" value={kpis.total} icon={<IconDashboard size={17} />} sub="In workspace" />
          <MetricCard label="Approved" value={kpis.approved} tone="success" icon={<IconCheck size={17} />} sub="Cleared for testing" />
          <MetricCard label="Testing" value={kpis.testing} tone="warning" icon={<IconActivity size={17} />} sub="Under evaluation" />
          <MetricCard label="High-Risk Flagged" value={kpis.highRiskFlagged} tone="danger" icon={<IconAlert size={17} />} sub="Grid / martingale / high DD" />
          <MetricCard label="AI Reviewed" value={kpis.aiReviewed} tone="primary" icon={<IconSparkChat size={17} />} sub={`of ${kpis.total} EAs`} />
        </div>
      </section>

      {/* What's good · what's dangerous */}
      <section className="space-y-3.5">
        <BandHeader
          eyebrow="What's good · what's dangerous"
          title="Spotlights"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Spotlight label="Best EA" kind="best" ea={best} />
          <Spotlight label="Riskiest EA" kind="risk" ea={riskiest} />
        </div>
      </section>

      {/* What to review next */}
      <section className="space-y-3.5">
        <BandHeader eyebrow="What to review next" title="Warnings & review queue" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <SectionCard
          title="Recent AI Warnings"
          icon={<IconAlert size={16} />}
          description="Risk signals the assistant surfaced from the vault."
        >
          <ul className="space-y-2.5">
            {AI_WARNINGS.slice(0, 5).map((w) => (
              <li key={w.id} className="flex items-start gap-2.5">
                <span
                  className={cnTone(SEVERITY_TONE[w.severity])}
                  aria-hidden
                />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-ink">{w.message}</p>
                  <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted">
                    <Link
                      href={`/ea/${w.eaId}`}
                      className="font-medium hover:text-primary-dark hover:underline"
                    >
                      {w.eaName}
                    </Link>
                    <span aria-hidden>·</span>
                    <span>{w.time}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard
          title="Review First"
          icon={<IconEye size={16} />}
          description="Prioritised by risk — start at the top."
        >
          <ul className="space-y-2.5">
            {REVIEW_QUEUE.map((item) => (
              <li
                key={item.eaId}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-surface-soft px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge tone={SEVERITY_TONE[item.priority]} size="sm" dot>
                      {item.priority}
                    </Badge>
                    <Link
                      href={`/ea/${item.eaId}`}
                      className="truncate text-[13px] font-semibold text-ink hover:text-primary-dark hover:underline"
                    >
                      {item.eaName}
                    </Link>
                  </div>
                  <p className="mt-0.5 text-[12px] text-muted">{item.reason}</p>
                </div>
                <Link href={`/ea/${item.eaId}`} aria-label={`Review ${item.eaName}`}>
                  <Button size="sm" variant="ghost" rightIcon={<IconChevronRight size={15} />}>
                    Review
                  </Button>
                </Link>
              </li>
            ))}
          </ul>
        </SectionCard>
        </div>
      </section>

      {/* Library preview */}
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="text-primary" aria-hidden>
              <IconActivity size={16} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold text-ink">EA Library</h2>
              <p className="text-[13px] text-muted">
                A preview of your collected EAs.
              </p>
            </div>
          </div>
          <Link href="/library">
            <Button size="sm" variant="secondary" rightIcon={<IconArrowRight size={15} />}>
              View all
            </Button>
          </Link>
        </div>
        <EATable eas={previewEAs} />
      </section>
    </div>
  );
}

function BandHeader({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div>
      <div className="eyebrow">{eyebrow}</div>
      <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
    </div>
  );
}

function cnTone(tone: Tone): string {
  const map: Record<Tone, string> = {
    danger: "mt-1 h-2 w-2 shrink-0 rounded-full bg-danger",
    warning: "mt-1 h-2 w-2 shrink-0 rounded-full bg-warning",
    success: "mt-1 h-2 w-2 shrink-0 rounded-full bg-success",
    primary: "mt-1 h-2 w-2 shrink-0 rounded-full bg-primary",
    neutral: "mt-1 h-2 w-2 shrink-0 rounded-full bg-[#94a3b8]",
  };
  return map[tone];
}
