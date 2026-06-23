"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { StatusBadge } from "./StatusBadge";
import { SourceBadge } from "./SourceBadge";
import { BehaviorFlags } from "./BehaviorFlags";
import { WinRateReality } from "./WinRateReality";
import { QualityScoreRing } from "./QualityScoreRing";
import { IconEye, IconScale, IconSparkChat } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import type { EA } from "@/lib/types";

/** Small risk chips specific to a Free EA's source/security. */
function sourceFlags(ea: EA): Array<{ key: string; text: string; tone: "warning" | "danger" }> {
  if (ea.sourceType !== "Free") return [];
  const out: Array<{ key: string; text: string; tone: "warning" | "danger" }> = [];
  if (!ea.codeAvailable) out.push({ key: "src", text: "Closed source", tone: "warning" });
  if (ea.usesDLL) out.push({ key: "dll", text: "DLL", tone: "danger" });
  if (ea.usesWebRequest) out.push({ key: "web", text: "WebRequest", tone: "warning" });
  return out;
}

export function EACard({ ea }: { ea: EA }) {
  const router = useRouter();
  const { askAI, selectEA } = useFXPulse();

  const openDetail = () => {
    selectEA(ea.id);
    router.push(`/ea/${ea.id}`);
  };

  return (
    <Card
      flush
      className="flex h-full flex-col gap-3 p-4 transition-shadow duration-200 hover:shadow-pop"
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <SourceBadge source={ea.sourceType} size="sm" />
          <StatusBadge status={ea.status} size="sm" />
          <Badge tone="neutral" size="sm">
            {ea.platform}
          </Badge>
        </div>
        <QualityScoreRing score={ea.qualityScore} size={46} />
      </div>

      {/* Name + meta */}
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
        <p className="mt-0.5 text-[12.5px] text-muted">
          {ea.strategy} · {ea.pairs} · {ea.timeframe}
        </p>
      </div>

      {/* Win rate is never shown alone */}
      <WinRateReality ea={ea} variant="card" />

      {/* Flags */}
      <div className="flex flex-wrap items-center gap-1.5">
        <BehaviorFlags ea={ea} size="sm" />
        {sourceFlags(ea).map((f) => (
          <span
            key={f.key}
            className={cn(
              "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[11px] font-medium",
              f.tone === "danger"
                ? "border-[#f6d3d3] bg-danger-soft text-danger"
                : "border-[#f1e3c0] bg-warning-soft text-warning",
            )}
          >
            {f.text}
          </span>
        ))}
      </div>

      {/* Footer — Compare is intentionally lighter than View / Ask AI */}
      <div className="mt-auto flex items-center gap-2 border-t border-line pt-3">
        <Button size="sm" variant="secondary" leftIcon={<IconEye size={15} />} onClick={openDetail}>
          View
        </Button>
        <Button size="sm" variant="subtle" leftIcon={<IconSparkChat size={15} />} onClick={() => askAI(ea.id)}>
          Ask AI
        </Button>
        <button
          type="button"
          onClick={() => router.push("/compare")}
          className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-faint transition-colors hover:bg-neutral-soft hover:text-muted"
        >
          <IconScale size={14} />
          Compare
        </button>
      </div>
    </Card>
  );
}
