import { cn } from "@/lib/utils";
import type { SourceType } from "@/lib/types";

interface SourceBadgeProps {
  source: SourceType;
  size?: "sm" | "md";
  className?: string;
}

/** Free = blue, Paid = indigo/primary. Calm, single-accent pills. */
export function SourceBadge({ source, size = "md", className }: SourceBadgeProps) {
  const isFree = source === "Free";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold tracking-tight",
        size === "sm"
          ? "px-2 py-0.5 text-[11px]"
          : "px-2.5 py-[3px] text-[11.5px]",
        isFree
          ? "border-[#cfe0fb] bg-blue-soft text-blue"
          : "border-[#ddd6fe] bg-primary-soft text-primary-dark",
        className,
      )}
    >
      <span
        className={cn(
          "rounded-full",
          size === "sm" ? "h-1.5 w-1.5" : "h-[7px] w-[7px]",
          isFree ? "bg-blue" : "bg-primary",
        )}
        aria-hidden
      />
      {source}
    </span>
  );
}
