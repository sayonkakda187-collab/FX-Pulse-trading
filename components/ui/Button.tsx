import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "subtle" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  block?: boolean;
}

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-primary text-white border border-transparent hover:bg-primary-dark shadow-[0_1px_2px_rgba(20,20,40,0.18)]",
  secondary:
    "bg-surface text-ink border border-line hover:bg-surface-soft hover:border-[#dcd9e8]",
  ghost:
    "bg-transparent text-muted border border-transparent hover:bg-neutral-soft hover:text-ink",
  subtle:
    "bg-primary-soft text-primary-dark border border-transparent hover:bg-[#ece8fb]",
  danger:
    "bg-danger-soft text-danger border border-transparent hover:bg-[#fbe0e0]",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5 rounded-lg",
  md: "h-10 px-4 text-sm gap-2 rounded-xl",
};

export function Button({
  variant = "secondary",
  size = "md",
  leftIcon,
  rightIcon,
  block,
  className,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(
        "inline-flex select-none items-center justify-center font-semibold transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-50",
        SIZES[size],
        VARIANTS[variant],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {leftIcon ? <span className="shrink-0">{leftIcon}</span> : null}
      {children}
      {rightIcon ? <span className="shrink-0">{rightIcon}</span> : null}
    </button>
  );
}

/** Shared placeholder handler for Phase 1 actions that are visual-only. */
export function comingSoon(feature = "This action") {
  if (typeof window !== "undefined") {
    window.alert(`${feature} is coming in a later phase.`);
  }
}
