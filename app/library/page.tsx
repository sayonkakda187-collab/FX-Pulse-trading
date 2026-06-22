"use client";

import { useMemo, useState } from "react";
import { PageScope } from "@/components/shell/PageScope";
import { EACard } from "@/components/ea/EACard";
import { EATable } from "@/components/ea/EATable";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconSearch, IconGrid, IconList, IconLibrary } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { EAS, STATUS_TABS } from "@/lib/mockData";
import type { EA, EAStatus } from "@/lib/types";

type StatusTab = EAStatus | "All";

interface Chip {
  key: string;
  label: string;
  group?: string;
  test: (ea: EA) => boolean;
}

const CHIPS: Chip[] = [
  { key: "MT4", label: "MT4", group: "platform", test: (e) => e.platform === "MT4" },
  { key: "MT5", label: "MT5", group: "platform", test: (e) => e.platform === "MT5" },
  { key: "noMart", label: "No Martingale", test: (e) => !e.martingale && !e.grid },
  { key: "lowDD", label: "Low Drawdown", test: (e) => e.maxDrawdown < 10 },
  { key: "highPF", label: "High Profit Factor", test: (e) => e.profitFactor >= 1.5 },
  { key: "highWR", label: "High Win Rate", test: (e) => e.winRate >= 65 },
];

export default function LibraryPage() {
  const { searchQuery, setSearchQuery } = useFXPulse();
  const [tab, setTab] = useState<StatusTab>("All");
  const [active, setActive] = useState<Set<string>>(new Set());
  const [view, setView] = useState<"cards" | "table">("cards");

  const toggleChip = (key: string) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Apply search + chip filters (but not the status tab) first.
  const baseFiltered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const platformChips = CHIPS.filter(
      (c) => c.group === "platform" && active.has(c.key),
    );
    const otherChips = CHIPS.filter(
      (c) => !c.group && active.has(c.key),
    );

    return EAS.filter((ea) => {
      if (q) {
        const hay = `${ea.name} ${ea.strategy} ${ea.pairs} ${ea.platform} ${ea.timeframe}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (platformChips.length && !platformChips.some((c) => c.test(ea)))
        return false;
      if (otherChips.length && !otherChips.every((c) => c.test(ea)))
        return false;
      return true;
    });
  }, [searchQuery, active]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { All: baseFiltered.length };
    for (const ea of baseFiltered) {
      map[ea.status] = (map[ea.status] ?? 0) + 1;
    }
    return map;
  }, [baseFiltered]);

  const results = useMemo(
    () => (tab === "All" ? baseFiltered : baseFiltered.filter((e) => e.status === tab)),
    [baseFiltered, tab],
  );

  return (
    <div className="space-y-5">
      <PageScope scope="Vault Overview" />

      {/* Search + view toggle */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
            <IconSearch size={17} />
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search EAs by name, strategy, pair…"
            aria-label="Search EAs"
            className="h-11 w-full rounded-xl border border-line bg-surface pl-10 pr-3 text-sm text-ink outline-none placeholder:text-faint focus:border-primary"
          />
        </div>
        <div
          className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface p-1"
          role="group"
          aria-label="View mode"
        >
          <ViewToggle
            active={view === "cards"}
            onClick={() => setView("cards")}
            label="Card view"
          >
            <IconGrid size={16} /> Cards
          </ViewToggle>
          <ViewToggle
            active={view === "table"}
            onClick={() => setView("table")}
            label="Table view"
          >
            <IconList size={16} /> Table
          </ViewToggle>
        </div>
      </div>

      {/* Status tabs */}
      <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {STATUS_TABS.map((t) => {
          const isActive = tab === t;
          const count = counts[t] ?? 0;
          return (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              aria-pressed={isActive}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-semibold transition-colors",
                isActive
                  ? "border-transparent bg-ink text-white"
                  : "border-line bg-surface text-muted hover:bg-surface-soft hover:text-ink",
              )}
            >
              {t}
              <span
                className={cn(
                  "num rounded-full px-1.5 text-[11px]",
                  isActive ? "bg-white/20 text-white" : "bg-neutral-soft text-faint",
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[12px] font-medium uppercase tracking-wide text-faint">
          Filters
        </span>
        {CHIPS.map((c) => {
          const on = active.has(c.key);
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => toggleChip(c.key)}
              aria-pressed={on}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors",
                on
                  ? "border-primary bg-primary-soft text-primary-dark"
                  : "border-line bg-surface text-muted hover:bg-surface-soft hover:text-ink",
              )}
            >
              {c.label}
            </button>
          );
        })}
        {active.size > 0 ? (
          <button
            type="button"
            onClick={() => setActive(new Set())}
            className="text-[13px] font-medium text-primary hover:underline"
          >
            Clear
          </button>
        ) : null}
      </div>

      {/* Results */}
      <div>
        <p className="mb-3 text-[13px] text-muted">
          <span className="num font-semibold text-ink">{results.length}</span>{" "}
          {results.length === 1 ? "EA" : "EAs"}
          {tab !== "All" ? ` · ${tab}` : ""}
        </p>

        {results.length === 0 ? (
          <EmptyState
            icon={<IconLibrary size={22} />}
            title="No EAs match your filters"
            description="Try clearing a filter, switching status tab, or adjusting your search."
          />
        ) : view === "cards" ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {results.map((ea) => (
              <EACard key={ea.id} ea={ea} />
            ))}
          </div>
        ) : (
          <EATable eas={results} />
        )}
      </div>
    </div>
  );
}

function ViewToggle({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
        active ? "bg-primary text-white" : "text-muted hover:bg-surface-soft hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
