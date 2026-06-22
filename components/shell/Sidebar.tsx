"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ANALYST_PROFILE, VAULT_STATS } from "@/lib/mockData";
import { comingSoon } from "@/components/ui/Button";
import {
  IconDashboard,
  IconLibrary,
  IconFlask,
  IconTag,
  IconScale,
  IconPortfolio,
  IconAssistant,
  IconReports,
  IconSettings,
  IconActivity,
  IconClose,
  IconStar,
  IconShieldAlert,
  IconDownload,
  IconBookmark,
} from "@/components/ui/icons";

interface NavItem {
  href: string;
  label: string;
  icon: (p: { size?: number }) => React.ReactNode;
  exact?: boolean;
}

const NAV: NavItem[] = [
  { href: "/", label: "Dashboard", icon: IconDashboard, exact: true },
  { href: "/library", label: "EA Library", icon: IconLibrary },
  { href: "/free-lab", label: "Free EA Lab", icon: IconFlask },
  { href: "/paid-lab", label: "Paid EA Lab", icon: IconTag },
  { href: "/compare", label: "Compare Free/Paid", icon: IconScale },
  { href: "/portfolio", label: "Portfolio Draft", icon: IconPortfolio },
  { href: "/assistant", label: "AI Assistant", icon: IconAssistant },
  { href: "/reports", label: "Reports", icon: IconReports },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

interface Shortcut {
  label: string;
  href: string;
  icon: (p: { size?: number }) => React.ReactNode;
  count?: number;
}

const SHORTCUTS: Shortcut[] = [
  { label: "Best Free EA", href: "/ea/sydney-swing", icon: IconStar },
  { label: "Best Paid EA", href: "/ea/london-breakout", icon: IconStar },
  {
    label: "High Risk Review",
    href: "/library",
    icon: IconShieldAlert,
    count: VAULT_STATS.highRisk,
  },
  { label: "Import Reports", href: "/reports", icon: IconDownload },
  { label: "Saved AI Reviews", href: "/reports", icon: IconBookmark },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const effectivePath = pathname.startsWith("/ea/") ? "/library" : pathname;

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_6px_16px_rgba(109,93,252,0.45)]">
          <IconActivity size={19} />
        </span>
        <div>
          <div className="text-[15px] font-bold leading-none text-ink">
            FX Pulse
          </div>
          <div className="mt-1 text-[11px] font-medium text-faint">
            EA Intelligence Platform
          </div>
        </div>
      </div>

      <div className="scroll-area flex-1 overflow-y-auto px-3 pb-3">
        {/* Nav */}
        <nav className="space-y-1" aria-label="Primary">
          {NAV.map((item) => {
            const active = isActive(effectivePath, item);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-colors",
                  active
                    ? "bg-primary text-white shadow-[0_6px_16px_rgba(109,93,252,0.35)]"
                    : "text-[#475569] hover:bg-neutral-soft hover:text-ink",
                )}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Shortcuts */}
        <div className="mt-6 px-1">
          <div className="eyebrow mb-2">Shortcuts</div>
          <div className="space-y-0.5">
            {SHORTCUTS.map((s) => {
              const Icon = s.icon;
              return (
                <Link
                  key={s.label}
                  href={s.href}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 rounded-lg px-2 py-2 text-[13px] text-muted transition-colors hover:bg-neutral-soft hover:text-ink"
                >
                  <Icon size={16} />
                  <span className="flex-1 truncate">{s.label}</span>
                  {s.count != null ? (
                    <span className="num rounded-full bg-danger-soft px-1.5 text-[11px] font-semibold text-danger">
                      {s.count}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="m-3 rounded-xl border border-line bg-surface-soft p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-soft text-sm font-bold text-primary-dark">
            AK
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-ink">
              {ANALYST_PROFILE.name}
            </div>
            <div className="text-[11px] text-faint">{ANALYST_PROFILE.role}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-surface px-2.5 py-2 ring-1 ring-line">
            <div className="num text-[15px] font-semibold text-ink">
              {ANALYST_PROFILE.freeEAs}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-faint">
              Free EAs
            </div>
          </div>
          <div className="rounded-lg bg-surface px-2.5 py-2 ring-1 ring-line">
            <div className="num text-[15px] font-semibold text-ink">
              {ANALYST_PROFILE.paidEAs}
            </div>
            <div className="text-[10px] font-medium uppercase tracking-wide text-faint">
              Paid EAs
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => comingSoon("Upgrading the plan")}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary-dark"
        >
          <IconStar size={14} />
          Upgrade Plan
        </button>
      </div>
    </div>
  );
}

interface SidebarProps {
  drawerOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ drawerOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Desktop fixed column */}
      <aside className="sticky top-0 hidden h-screen w-[244px] shrink-0 border-r border-line lg:block">
        <SidebarContent />
      </aside>

      {/* Mobile / tablet drawer */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          drawerOpen ? "pointer-events-auto" : "pointer-events-none",
        )}
        aria-hidden={!drawerOpen}
      >
        <div
          className={cn(
            "absolute inset-0 bg-black/40 transition-opacity",
            drawerOpen ? "opacity-100" : "opacity-0",
          )}
          onClick={onClose}
        />
        <div
          className={cn(
            "absolute left-0 top-0 h-full w-[244px] border-r border-line bg-surface transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute right-2 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-neutral-soft hover:text-ink"
          >
            <IconClose size={18} />
          </button>
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
