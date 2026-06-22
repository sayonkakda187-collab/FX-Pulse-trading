"use client";

import { usePathname } from "next/navigation";
import { comingSoon } from "@/components/ui/Button";
import {
  IconList,
  IconCalendar,
  IconBell,
  IconPanel,
  IconChevronDown,
} from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { getEAById, USER } from "@/lib/mockData";

const ROUTE_META: Record<string, { title: string; subtitle: string }> = {
  "/": { title: "Dashboard", subtitle: `Welcome back, ${USER.name} 👋` },
  "/library": { title: "EA Library", subtitle: "Browse and filter every collected EA." },
  "/free-lab": { title: "Free EA Lab", subtitle: "Security review of free & open-source EAs." },
  "/paid-lab": { title: "Paid EA Lab", subtitle: "Vendor value review of paid EAs." },
  "/compare": { title: "Compare Free/Paid", subtitle: "Free vs paid, side by side." },
  "/portfolio": { title: "Portfolio Draft", subtitle: "Plan a research portfolio — not live." },
  "/assistant": { title: "AI Assistant", subtitle: "Ask about risk, evidence and fit." },
  "/reports": { title: "Reports", subtitle: "Saved reviews and exports." },
  "/settings": { title: "Settings", subtitle: "Scoring, thresholds and preferences." },
};

function metaFor(pathname: string) {
  if (pathname.startsWith("/ea/")) {
    const ea = getEAById(pathname.split("/")[2]);
    return { title: ea?.name ?? "EA Detail", subtitle: "EA due-diligence review" };
  }
  return ROUTE_META[pathname] ?? { title: "FX Pulse", subtitle: "EA Intelligence Platform" };
}

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  const { aiPanelOpen, toggleAIPanel } = useFXPulse();
  const meta = metaFor(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-neutral-soft lg:hidden"
        >
          <IconList size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-xl font-bold leading-tight text-ink">
            {meta.title}
          </h1>
          <p className="truncate text-[13px] text-muted">{meta.subtitle}</p>
        </div>

        {/* Date range pill */}
        <button
          type="button"
          onClick={() => comingSoon("Changing the date range")}
          className="hidden items-center gap-2 rounded-xl border border-line bg-surface px-3 py-2 text-[13px] font-medium text-muted hover:bg-surface-soft md:inline-flex"
        >
          <IconCalendar size={16} />
          <span className="num">01 Jun 2026 – 30 Jun 2026</span>
        </button>

        {/* Notifications */}
        <button
          type="button"
          onClick={() => comingSoon("Notifications")}
          aria-label="Notifications"
          className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line text-muted hover:bg-surface-soft"
        >
          <IconBell size={18} />
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User */}
        <button
          type="button"
          onClick={() => comingSoon("Account menu")}
          className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface py-1.5 pl-1.5 pr-2 hover:bg-surface-soft"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-soft text-[11px] font-bold text-primary-dark">
            {USER.initials}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-[12.5px] font-semibold leading-none text-ink">
              {USER.name}
            </span>
            <span className="block text-[11px] leading-none text-faint">
              {USER.role}
            </span>
          </span>
          <IconChevronDown size={14} className="hidden text-faint sm:block" />
        </button>

        {/* AI panel toggle */}
        <button
          type="button"
          onClick={toggleAIPanel}
          aria-label="Toggle AI Assistant panel"
          aria-pressed={aiPanelOpen}
          className={cn(
            "inline-flex h-10 w-10 items-center justify-center rounded-xl border transition-colors",
            aiPanelOpen
              ? "border-transparent bg-primary-soft text-primary-dark"
              : "border-line text-muted hover:bg-surface-soft",
          )}
        >
          <IconPanel size={18} />
        </button>
      </div>
    </header>
  );
}
