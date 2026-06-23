"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ea/StatusBadge";
import { SourceBadge } from "@/components/ea/SourceBadge";
import { QualityScoreRing } from "@/components/ea/QualityScoreRing";
import { IconEye, IconSparkChat, IconCheck, IconStar, IconAlert } from "@/components/ui/icons";
import { cn, formatPercent, formatRatio } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { getEAById } from "@/lib/mockData";

type LabTone = "success" | "warning" | "danger" | "primary";

const LABEL_TONE: Record<LabTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
  primary: "text-primary-dark",
};

export function LabSpotlight({
  label,
  tone,
  eaId,
  reason,
}: {
  label: string;
  tone: LabTone;
  eaId: string;
  reason: string;
}) {
  const router = useRouter();
  const { askAI, selectEA } = useFXPulse();
  const ea = getEAById(eaId);
  if (!ea) return null;

  const pfTone = ea.profitFactor >= 1.5 ? "text-success" : ea.profitFactor >= 1.25 ? "text-warning" : "text-danger";
  const ddTone = ea.maxDrawdown < 10 ? "text-success" : ea.maxDrawdown < 20 ? "text-warning" : "text-danger";

  return (
    <Card flush className="flex h-full flex-col gap-3 p-4">
      <div className="flex items-center justify-between">
        <span className={cn("flex items-center gap-1.5 text-[12px] font-semibold", LABEL_TONE[tone])}>
          {tone === "danger" ? <IconAlert size={14} /> : <IconStar size={14} />}
          {label}
        </span>
        <StatusBadge status={ea.status} size="sm" />
      </div>

      <div className="flex items-center gap-3">
        <QualityScoreRing score={ea.qualityScore} size={48} />
        <div className="min-w-0">
          <div className="mb-1">
            <SourceBadge source={ea.sourceType} size="sm" />
          </div>
          <Link
            href={`/ea/${ea.id}`}
            onClick={() => selectEA(ea.id)}
            className="block truncate text-[14px] font-semibold text-ink hover:text-primary-dark hover:underline"
          >
            {ea.name}
          </Link>
        </div>
      </div>

      <p className="text-[12.5px] leading-snug text-muted">{reason}</p>

      <div className="num rounded-lg border border-line bg-surface-soft px-3 py-2 text-[12.5px] text-muted">
        WR {formatPercent(ea.winRate, 0)} ·{" "}
        <span className={pfTone}>PF {formatRatio(ea.profitFactor)}</span> ·{" "}
        <span className={ddTone}>DD {formatPercent(ea.maxDrawdown)}</span>
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <Button size="sm" variant="secondary" leftIcon={<IconEye size={15} />} onClick={() => { selectEA(ea.id); router.push(`/ea/${ea.id}`); }}>
          View
        </Button>
        <Button size="sm" variant="subtle" leftIcon={<IconSparkChat size={15} />} onClick={() => askAI(ea.id)}>
          Ask AI
        </Button>
      </div>
    </Card>
  );
}

export function Checklist({ title, items }: { title: string; items: string[] }) {
  return (
    <Card className="h-full">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <IconCheck size={15} />
        </span>
        <h3 className="text-[14px] font-semibold text-ink">{title}</h3>
      </div>
      <ul className="mt-3 space-y-2">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-[13px] text-ink">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border border-primary/40 bg-primary-soft text-primary">
              <IconCheck size={11} />
            </span>
            {it}
          </li>
        ))}
      </ul>
    </Card>
  );
}
