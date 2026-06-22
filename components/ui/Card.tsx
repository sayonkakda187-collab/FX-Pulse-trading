import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Remove inner padding (e.g. when wrapping a table). */
  flush?: boolean;
}

export function Card({ children, className, flush }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        !flush && "p-5",
        className,
      )}
    >
      {children}
    </div>
  );
}

interface SectionCardProps {
  title: string;
  description?: string;
  /** Small uppercase label above the title. */
  eyebrow?: string;
  icon?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

/** A card with a standard header row (title + optional action). */
export function SectionCard({
  title,
  description,
  eyebrow,
  icon,
  action,
  children,
  className,
  bodyClassName,
}: SectionCardProps) {
  return (
    <section
      className={cn(
        "rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      <header className="flex items-start justify-between gap-3 px-5 pt-5 sm:px-6">
        <div className="flex items-start gap-3">
          {icon ? (
            <span
              className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary"
              aria-hidden
            >
              {icon}
            </span>
          ) : null}
          <div>
            {eyebrow ? <div className="eyebrow mb-1">{eyebrow}</div> : null}
            <h2 className="text-[15px] font-semibold leading-tight text-ink">
              {title}
            </h2>
            {description ? (
              <p className="mt-1 text-[13px] leading-snug text-muted">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </header>
      <div className={cn("px-5 pb-5 pt-4 sm:px-6", bodyClassName)}>
        {children}
      </div>
    </section>
  );
}
