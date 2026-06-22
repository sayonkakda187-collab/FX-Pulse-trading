import { cn } from "@/lib/utils";
import { SparklineSvg } from "@/components/charts/SparklineSvg";
import type { Tone } from "@/components/ui/Badge";

const ICON_CHIP: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-[#64748b]",
  primary: "bg-primary-soft text-primary",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
};

const SPARK_TONE: Record<Tone, "primary" | "success" | "warning" | "danger"> = {
  neutral: "primary",
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
};

interface KpiCardProps {
  label: string;
  value: number | string;
  sub?: string;
  tone?: Tone;
  icon: React.ReactNode;
  spark?: number[];
}

export function KpiCard({
  label,
  value,
  sub,
  tone = "neutral",
  icon,
  spark,
}: KpiCardProps) {
  return (
    <div className="rounded-card border border-line bg-surface p-4 shadow-card transition-shadow hover:shadow-pop">
      <div className="flex items-start justify-between gap-2">
        <span className="eyebrow pt-1">{label}</span>
        <span
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            ICON_CHIP[tone],
          )}
          aria-hidden
        >
          {icon}
        </span>
      </div>
      <div className="num mt-1 text-[26px] font-bold leading-none tracking-tight text-ink">
        {value}
      </div>
      {sub ? <div className="mt-1.5 text-[12px] text-muted">{sub}</div> : null}
      {spark && spark.length > 1 ? (
        <SparklineSvg
          data={spark}
          tone={SPARK_TONE[tone]}
          width={220}
          height={30}
          className="mt-3 w-full"
        />
      ) : null}
    </div>
  );
}
