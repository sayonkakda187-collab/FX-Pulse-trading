import { cn } from "@/lib/utils";
import type { EAStatus } from "@/lib/types";

interface StatusStyle {
  label: string;
  className: string;
  dot: string;
}

const STATUS: Record<EAStatus, StatusStyle> = {
  Approved: {
    label: "Approved",
    className: "bg-success-soft text-success border-[#cdebd9]",
    dot: "bg-success",
  },
  Testing: {
    label: "Testing",
    className: "bg-warning-soft text-warning border-[#f1e3c0]",
    dot: "bg-warning",
  },
  Watchlist: {
    label: "Watchlist",
    className: "bg-warning-soft text-warning border-[#f1e3c0]",
    dot: "bg-warning",
  },
  Quarantine: {
    label: "Quarantine",
    className: "bg-danger-soft text-danger border-[#f6d3d3]",
    dot: "bg-danger",
  },
  Rejected: {
    label: "Rejected",
    className: "bg-danger text-white border-transparent",
    dot: "bg-white",
  },
  New: {
    label: "New",
    className: "bg-neutral-soft text-[#475569] border-[#e2e8f0]",
    dot: "bg-[#94a3b8]",
  },
};

interface StatusBadgeProps {
  status: EAStatus;
  size?: "sm" | "md";
  className?: string;
}

export function StatusBadge({ status, size = "md", className }: StatusBadgeProps) {
  const s = STATUS[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        s.className,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", s.dot)} aria-hidden />
      {s.label}
    </span>
  );
}
