import { Badge, type Tone } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { RiskType } from "@/lib/types";

const RISK_TONE: Record<RiskType, Tone> = {
  Low: "success",
  Normal: "neutral",
  Medium: "warning",
  High: "danger",
  Extreme: "danger",
};

interface RiskBadgeProps {
  risk: RiskType;
  size?: "sm" | "md";
  className?: string;
}

export function RiskBadge({ risk, size = "md", className }: RiskBadgeProps) {
  // Extreme gets the most emphatic, solid treatment.
  if (risk === "Extreme") {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border border-transparent bg-danger font-semibold text-white",
          size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
          className,
        )}
      >
        <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden />
        Extreme risk
      </span>
    );
  }
  return (
    <Badge tone={RISK_TONE[risk]} dot size={size} className={className}>
      {risk} risk
    </Badge>
  );
}
