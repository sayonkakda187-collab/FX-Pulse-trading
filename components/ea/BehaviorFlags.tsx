import { cn } from "@/lib/utils";
import { IconCheck, IconAlert } from "@/components/ui/icons";
import type { EA, Sensitivity } from "@/lib/types";

type ChipTone = "success" | "warning" | "danger" | "neutral";

interface Flag {
  key: string;
  text: string;
  tone: ChipTone;
  danger?: boolean;
}

const CHIP: Record<ChipTone, string> = {
  success: "bg-success-soft text-success border-[#cdebd9]",
  warning: "bg-warning-soft text-warning border-[#f1e3c0]",
  danger: "bg-danger-soft text-danger border-[#f6d3d3]",
  neutral: "bg-neutral-soft text-[#475569] border-[#e2e8f0]",
};

function sensitivityTone(s: Sensitivity): ChipTone {
  if (s === "Low") return "success";
  if (s === "Medium") return "warning";
  return "danger";
}

export function behaviorFlags(ea: EA, full = false): Flag[] {
  const flags: Flag[] = [
    ea.grid
      ? { key: "grid", text: "Grid", tone: "danger", danger: true }
      : { key: "grid", text: "No Grid", tone: "success" },
    ea.martingale
      ? { key: "mart", text: "Martingale", tone: "danger", danger: true }
      : { key: "mart", text: "No Martingale", tone: "success" },
    ea.stopLoss
      ? { key: "sl", text: "Stop Loss", tone: "success" }
      : { key: "sl", text: "No Stop Loss", tone: "danger", danger: true },
  ];
  if (full) {
    flags.push(
      {
        key: "spread",
        text: `Spread ${ea.spreadSensitive}`,
        tone: sensitivityTone(ea.spreadSensitive),
        danger: ea.spreadSensitive === "High",
      },
      {
        key: "news",
        text: `News ${ea.newsSensitive}`,
        tone: sensitivityTone(ea.newsSensitive),
        danger: ea.newsSensitive === "High",
      },
    );
  }
  return flags;
}

interface BehaviorFlagsProps {
  ea: EA;
  /** Include spread + news sensitivity chips. */
  full?: boolean;
  size?: "sm" | "md";
  className?: string;
}

export function BehaviorFlags({
  ea,
  full = false,
  size = "md",
  className,
}: BehaviorFlagsProps) {
  const flags = behaviorFlags(ea, full);
  return (
    <ul className={cn("flex flex-wrap gap-1.5", className)}>
      {flags.map((f) => (
        <li
          key={f.key}
          className={cn(
            "inline-flex items-center gap-1 rounded-md border font-medium",
            size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-1 text-xs",
            CHIP[f.tone],
          )}
        >
          {f.danger ? (
            <IconAlert size={size === "sm" ? 11 : 13} />
          ) : f.tone === "success" ? (
            <IconCheck size={size === "sm" ? 11 : 13} />
          ) : null}
          {f.text}
        </li>
      ))}
    </ul>
  );
}
