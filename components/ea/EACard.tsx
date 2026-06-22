"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";
import { SourceBadge } from "./SourceBadge";
import { RiskBadge } from "./RiskBadge";
import { BehaviorFlags } from "./BehaviorFlags";
import { WinRateReality } from "./WinRateReality";
import { QualityScoreRing } from "./QualityScoreRing";
import { IconEye, IconScale, IconSparkChat } from "@/components/ui/icons";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA } from "@/lib/types";

export function EACard({ ea }: { ea: EA }) {
  const router = useRouter();
  const { askAI, selectEA } = useFXPulse();

  const openDetail = () => {
    selectEA(ea.id);
    router.push(`/ea/${ea.id}`);
  };

  return (
    <Card className="flex h-full flex-col gap-4 transition-shadow duration-200 hover:shadow-pop">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            <StatusBadge status={ea.status} size="sm" />
            <SourceBadge source={ea.sourceType} size="sm" />
            <Badge tone="neutral" size="sm">
              {ea.platform}
            </Badge>
          </div>
          <div>
            <h3 className="text-base font-semibold leading-snug text-ink">
              <Link
                href={`/ea/${ea.id}`}
                onClick={() => selectEA(ea.id)}
                className="rounded-sm hover:text-primary-dark hover:underline"
              >
                {ea.name}
              </Link>
            </h3>
            <p className="mt-0.5 text-[12.5px] text-muted">
              {ea.strategy} · {ea.pairs} · {ea.timeframe}
            </p>
          </div>
        </div>
        <QualityScoreRing score={ea.qualityScore} size={56} />
      </div>

      <WinRateReality ea={ea} variant="card" />

      <div className="flex flex-wrap items-center gap-1.5">
        <RiskBadge risk={ea.riskType} size="sm" />
        <BehaviorFlags ea={ea} size="sm" />
      </div>

      <div className="mt-auto flex items-center gap-2 border-t border-line pt-4">
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
          variant="ghost"
          leftIcon={<IconScale size={15} />}
          onClick={() => router.push("/compare")}
          className="ml-auto"
        >
          Compare
        </Button>
      </div>
    </Card>
  );
}
