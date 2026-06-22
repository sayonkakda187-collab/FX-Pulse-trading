"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";
import { RiskBadge } from "./RiskBadge";
import { BehaviorFlags } from "./BehaviorFlags";
import { WinRateReality } from "./WinRateReality";
import { QualityScoreRing } from "./QualityScoreRing";
import { IconEye, IconCompare, IconCheck, IconSparkChat } from "@/components/ui/icons";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA } from "@/lib/types";

export function EACard({ ea }: { ea: EA }) {
  const router = useRouter();
  const { askAI, toggleCompare, isComparing, compareEAIds, selectEA } =
    useFXPulse();
  const comparing = isComparing(ea.id);
  const compareFull = compareEAIds.length >= 4 && !comparing;

  const openDetail = () => {
    selectEA(ea.id);
    router.push(`/ea/${ea.id}`);
  };

  return (
    <Card className="flex h-full flex-col gap-3.5 transition-shadow hover:shadow-[0_10px_34px_rgba(20,20,40,0.1)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge status={ea.status} size="sm" />
          <Badge tone="neutral" size="sm">
            {ea.platform}
          </Badge>
        </div>
        <QualityScoreRing score={ea.qualityScore} size={52} />
      </div>

      <div>
        <h3 className="text-[15px] font-semibold leading-tight text-ink">
          <Link
            href={`/ea/${ea.id}`}
            onClick={() => selectEA(ea.id)}
            className="rounded-sm hover:text-primary-dark hover:underline"
          >
            {ea.name}
          </Link>
        </h3>
        <p className="mt-1 text-[12.5px] text-muted">
          {ea.strategy} · {ea.pairs} · {ea.timeframe}
        </p>
      </div>

      <WinRateReality ea={ea} variant="card" />

      <div className="flex flex-wrap items-center gap-1.5">
        <RiskBadge risk={ea.riskType} size="sm" />
        <BehaviorFlags ea={ea} size="sm" />
      </div>

      <div className="mt-auto flex items-center gap-2 pt-1">
        <Button
          size="sm"
          variant="secondary"
          leftIcon={<IconEye size={15} />}
          onClick={openDetail}
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
        <Button
          size="sm"
          variant={comparing ? "primary" : "ghost"}
          leftIcon={comparing ? <IconCheck size={15} /> : <IconCompare size={15} />}
          onClick={() => toggleCompare(ea.id)}
          disabled={compareFull}
          aria-pressed={comparing}
          className="ml-auto"
          title={compareFull ? "Compare holds up to 4 EAs" : undefined}
        >
          {comparing ? "Comparing" : "Compare"}
        </Button>
      </div>
    </Card>
  );
}
