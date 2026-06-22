import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Tone = "neutral" | "primary" | "success" | "warning" | "danger";

const TONES: Record<Tone, string> = {
  neutral: "bg-neutral-soft text-[#475569] border-[#e2e8f0]",
  primary: "bg-primary-soft text-primary-dark border-[#e4dffb]",
  success: "bg-success-soft text-success border-[#cdebd9]",
  warning: "bg-warning-soft text-warning border-[#f1e3c0]",
  danger: "bg-danger-soft text-danger border-[#f6d3d3]",
};

const DOT: Record<Tone, string> = {
  neutral: "bg-[#94a3b8]",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
};

interface BadgeProps {
  children: ReactNode;
  tone?: Tone;
  dot?: boolean;
  icon?: ReactNode;
  className?: string;
  size?: "sm" | "md";
}

export function Badge({
  children,
  tone = "neutral",
  dot,
  icon,
  className,
  size = "md",
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-semibold",
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        TONES[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 rounded-full", DOT[tone])}
          aria-hidden
        />
      ) : null}
      {icon ? <span className="-ml-0.5">{icon}</span> : null}
      {children}
    </span>
  );
}
