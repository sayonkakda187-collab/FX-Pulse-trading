"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, comingSoon } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";
import { SourceBadge } from "./SourceBadge";
import { QualityScoreRing } from "./QualityScoreRing";
import {
  IconArrowLeft,
  IconSparkChat,
  IconScale,
  IconPortfolio,
  IconCheck,
  IconChevronDown,
} from "@/components/ui/icons";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA } from "@/lib/types";

export function EADetailHeader({ ea }: { ea: EA }) {
  const router = useRouter();
  const { askAI, addToPortfolioDraft, isInPortfolio } = useFXPulse();

  const inPortfolio = isInPortfolio(ea.id);

  const handleAddPortfolio = () => {
    if (inPortfolio) return;
    if (ea.status === "Rejected") {
      const ok = window.confirm(
        `${ea.name} is Rejected. Risk rules block rejected EAs from the portfolio draft.\n\nOverride and add anyway? (You can manage the override on the Portfolio Draft page.)`,
      );
      if (!ok) return;
    } else if (ea.status === "Quarantine") {
      const ok = window.confirm(
        `${ea.name} is in Quarantine. It is still under review and not recommended for the draft.\n\nAdd to the portfolio draft anyway?`,
      );
      if (!ok) return;
    }
    addToPortfolioDraft(ea.id);
  };

  return (
    <div>
      <Link
        href="/library"
        className="inline-flex items-center gap-1.5 text-[13px] font-medium text-muted hover:text-ink"
      >
        <IconArrowLeft size={15} />
        Back to EA Library
      </Link>

      <Card className="mt-4">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={ea.status} />
            <SourceBadge source={ea.sourceType} />
            <Badge tone="neutral" size="sm">
              {ea.platform}
            </Badge>
            <Badge tone="primary" size="sm">
              Value {ea.valueScore}
            </Badge>
            <button
              type="button"
              onClick={() => comingSoon("Changing EA status")}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2 py-1 text-[11px] font-medium text-muted hover:bg-surface-soft"
              aria-label="Change status (coming soon)"
            >
              Change status
              <IconChevronDown size={13} />
            </button>
          </div>
          <h1 className="mt-2.5 text-2xl font-bold text-ink">{ea.name}</h1>
          <p className="mt-1 text-sm text-muted">
            {ea.strategy} · {ea.pairs} · {ea.timeframe}
          </p>
          {ea.aiVerdictLine ? (
            <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-primary-dark">
              <IconSparkChat size={14} />
              {ea.aiVerdictLine}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:gap-5">
          <div className="flex justify-center sm:block">
            <QualityScoreRing
              score={ea.qualityScore}
              size={96}
              showOutOf
              caption="Quality Score"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              leftIcon={<IconSparkChat size={16} />}
              onClick={() => askAI(ea.id)}
            >
              Ask AI
            </Button>
            <Button
              variant="secondary"
              leftIcon={<IconScale size={16} />}
              onClick={() => router.push("/compare")}
            >
              Compare Free/Paid
            </Button>
            <Button
              variant={inPortfolio ? "subtle" : "secondary"}
              leftIcon={inPortfolio ? <IconCheck size={16} /> : <IconPortfolio size={16} />}
              onClick={handleAddPortfolio}
              aria-pressed={inPortfolio}
            >
              {inPortfolio ? "In Portfolio Draft" : "Add to Portfolio Draft"}
            </Button>
          </div>
        </div>
        </div>
      </Card>
    </div>
  );
}
