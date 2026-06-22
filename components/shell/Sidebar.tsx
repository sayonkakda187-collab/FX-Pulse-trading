"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ANALYST_PROFILE } from "@/lib/mockData";
import {
  IconDashboard,
  IconLibrary,
  IconCompare,
  IconPortfolio,
  IconAssistant,
  IconReports,
  IconSettings,
  IconActivity,
  IconClose,
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
  { href: "/compare", label: "Compare EAs", icon: IconCompare },
  { href: "/portfolio", label: "Portfolio Draft", icon: IconPortfolio },
  { href: "/assistant", label: "AI Assistant", icon: IconAssistant },
  { href: "/reports", label: "Reports", icon: IconReports },
  { href: "/settings", label: "Settings", icon: IconSettings },
];

function isActive(pathname: string, item: NavItem): boolean {
  if (item.exact) return pathname === item.href;
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  // EA detail pages belong to the Library section.
  const effectivePath = pathname.startsWith("/ea/") ? "/library" : pathname;

  return (
    <div className="flex h-full flex-col bg-sidebar">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-white shadow-[0_4px_12px_rgba(108,92,255,0.45)]">
          <IconActivity size={19} />
        </span>
        <div>
          <div className="text-[15px] font-bold leading-none text-white">
            FX Pulse
          </div>
          <div className="mt-1 text-[11px] font-medium uppercase tracking-wide text-[#8a88a6]">
            EA Intelligence
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-3" aria-label="Primary">
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
                  ? "bg-primary text-white shadow-[0_4px_14px_rgba(108,92,255,0.4)]"
                  : "text-[#a6a4bf] hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Profile */}
      <div className="m-3 rounded-xl bg-sidebar-deep p-3">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-sm font-bold text-white">
            A
          </span>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-white">
              {ANALYST_PROFILE.name}
            </div>
            <div className="text-[11px] text-[#8a88a6]">
              {ANALYST_PROFILE.role}
            </div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-lg bg-white/5 px-2.5 py-2">
            <div className="num text-[15px] font-semibold text-white">
              {ANALYST_PROFILE.collectedEAs}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-[#8a88a6]">
              Collected EAs
            </div>
          </div>
          <div className="rounded-lg bg-white/5 px-2.5 py-2">
            <div className="num text-[15px] font-semibold text-white">
              {ANALYST_PROFILE.aiReviewed}
            </div>
            <div className="text-[10px] uppercase tracking-wide text-[#8a88a6]">
              AI reviewed
            </div>
          </div>
        </div>
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
      <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 lg:block">
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
            "absolute left-0 top-0 h-full w-[248px] transition-transform duration-200",
            drawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
          role="dialog"
          aria-label="Navigation menu"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="absolute right-2 top-3 z-10 flex h-8 w-8 items-center justify-center rounded-lg text-[#a6a4bf] hover:bg-white/10 hover:text-white"
          >
            <IconClose size={18} />
          </button>
          <SidebarContent onNavigate={onClose} />
        </div>
      </div>
    </>
  );
}
