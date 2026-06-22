"use client";

import Link from "next/link";
import { PageScope } from "@/components/shell/PageScope";
import { Card, SectionCard } from "@/components/ui/Card";
import { Button, comingSoon } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ea/StatusBadge";
import {
  IconReports,
  IconDownload,
  IconPortfolio,
  IconActivity,
  IconArrowRight,
} from "@/components/ui/icons";
import { EAS } from "@/lib/mockData";
import { formatDate } from "@/lib/utils";

function ExportButtons({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<IconDownload size={14} />}
        onClick={() => comingSoon(`Exporting ${name} as PDF`)}
      >
        PDF
      </Button>
      <Button
        size="sm"
        variant="secondary"
        leftIcon={<IconDownload size={14} />}
        onClick={() => comingSoon(`Exporting ${name} as CSV`)}
      >
        CSV
      </Button>
    </div>
  );
}

function ReportCard({
  icon,
  title,
  description,
  meta,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  meta: string;
}) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-soft text-primary">
          {icon}
        </span>
        <div>
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          <p className="mt-0.5 text-[13px] text-muted">{description}</p>
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line pt-3">
        <span className="text-[12px] text-faint">{meta}</span>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="subtle"
            onClick={() => comingSoon(`Generating the ${title}`)}
          >
            Generate
          </Button>
          <ExportButtons name={title} />
        </div>
      </div>
    </Card>
  );
}

export default function ReportsPage() {
  const reviewed = EAS.filter((e) => e.aiReviewed);

  return (
    <div className="space-y-6">
      <PageScope scope="Vault Overview" />

      <p className="max-w-2xl text-[13.5px] text-muted">
        Generate and export review documentation. Export actions are visual in
        Phase 1 — no files are produced yet.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ReportCard
          icon={<IconActivity size={20} />}
          title="Daily EA review report"
          description="A risk-first summary of every EA reviewed today, with score changes and new warnings."
          meta="Last generated: 22 Jun 2026"
        />
        <ReportCard
          icon={<IconPortfolio size={20} />}
          title="Portfolio draft report"
          description="Current draft holdings, blended drawdown, risk rules status and AI notes."
          meta="Draft snapshot · 2 holdings"
        />
      </div>

      <SectionCard
        title="Saved AI reviews"
        icon={<IconReports size={16} />}
        description="Structured verdicts the assistant has produced for your EAs."
      >
        <ul className="divide-y divide-line">
          {reviewed.map((ea) => (
            <li
              key={ea.id}
              className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/ea/${ea.id}`}
                    className="text-[14px] font-semibold text-ink hover:text-primary-dark hover:underline"
                  >
                    {ea.name}
                  </Link>
                  <StatusBadge status={ea.status} size="sm" />
                </div>
                <p className="mt-0.5 line-clamp-1 text-[12.5px] text-muted">
                  {ea.aiVerdict.summary}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-faint">
                  {formatDate(ea.addedOn)}
                </span>
                <button
                  type="button"
                  onClick={() => comingSoon(`Exporting ${ea.name} review sheet`)}
                  aria-label={`Export ${ea.name} review`}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:bg-surface-soft hover:text-ink"
                >
                  <IconDownload size={15} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard
        title="EA review sheets"
        description="One-page review sheet per EA."
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {EAS.map((ea) => (
            <div
              key={ea.id}
              className="flex items-center justify-between gap-2 rounded-xl border border-line bg-surface-soft px-3 py-2.5"
            >
              <Link
                href={`/ea/${ea.id}`}
                className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-primary-dark hover:underline"
              >
                {ea.name}
                <IconArrowRight size={13} className="text-faint" />
              </Link>
              <button
                type="button"
                onClick={() => comingSoon(`Exporting ${ea.name} review sheet`)}
                aria-label={`Export ${ea.name} review sheet`}
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-muted hover:bg-surface hover:text-ink"
              >
                <IconDownload size={14} />
              </button>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
