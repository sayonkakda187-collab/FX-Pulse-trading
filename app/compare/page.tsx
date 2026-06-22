"use client";

import { PageScope } from "@/components/shell/PageScope";
import { SectionCard } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { CompareMatrix } from "@/components/compare/CompareMatrix";
import { IconCompare, IconCheck, IconPlus } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { EAS, getEAsByIds } from "@/lib/mockData";

export default function ComparePage() {
  const { compareEAIds, toggleCompare, isComparing, clearCompare } = useFXPulse();
  const selected = getEAsByIds(compareEAIds);
  const full = compareEAIds.length >= 4;

  return (
    <div className="space-y-5">
      <PageScope scope="Compare" />

      <p className="max-w-2xl text-[13.5px] text-muted">
        Compare 2–4 EAs side by side. Best values are highlighted green, worst in
        red — watch how the highest win rate can still lose on profit factor,
        drawdown and behaviour.
      </p>

      <SectionCard
        title="Choose EAs to compare"
        description={`Pick 2–4 EAs · ${compareEAIds.length}/4 selected`}
        icon={<IconCompare size={16} />}
        action={
          compareEAIds.length > 0 ? (
            <Button size="sm" variant="ghost" onClick={clearCompare}>
              Clear all
            </Button>
          ) : undefined
        }
      >
        <div className="flex flex-wrap gap-2">
          {EAS.map((ea) => {
            const on = isComparing(ea.id);
            const disabled = !on && full;
            return (
              <button
                key={ea.id}
                type="button"
                onClick={() => toggleCompare(ea.id)}
                disabled={disabled}
                aria-pressed={on}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40",
                  on
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface text-ink hover:border-primary hover:text-primary-dark",
                )}
              >
                {on ? <IconCheck size={14} /> : <IconPlus size={14} />}
                {ea.name}
                <span
                  className={cn(
                    "num text-[11px]",
                    on ? "text-white/80" : "text-faint",
                  )}
                >
                  {ea.qualityScore}
                </span>
              </button>
            );
          })}
        </div>
      </SectionCard>

      {selected.length >= 2 ? (
        <CompareMatrix eas={selected} />
      ) : (
        <EmptyState
          icon={<IconCompare size={22} />}
          title={
            selected.length === 1
              ? "Add at least one more EA"
              : "Select EAs to compare"
          }
          description="Choose 2–4 EAs above to build a side-by-side comparison matrix."
        />
      )}
    </div>
  );
}
