"use client";

import { usePathname, useRouter } from "next/navigation";
import { Button, comingSoon } from "@/components/ui/Button";
import { IconSearch, IconPlus, IconPanel, IconList } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { useFXPulse } from "@/context/FXPulseContext";
import { getEAById } from "@/lib/mockData";

interface RouteMeta {
  title: string;
  crumb: string;
}

const ROUTE_META: Record<string, RouteMeta> = {
  "/": { title: "Dashboard", crumb: "Overview" },
  "/library": { title: "EA Library", crumb: "Vault" },
  "/compare": { title: "Compare EAs", crumb: "Analysis" },
  "/portfolio": { title: "Portfolio Draft", crumb: "Planning" },
  "/assistant": { title: "AI Assistant", crumb: "Analysis" },
  "/reports": { title: "Reports", crumb: "Workspace" },
  "/settings": { title: "Settings", crumb: "Workspace" },
};

function metaFor(pathname: string): RouteMeta {
  if (pathname.startsWith("/ea/")) {
    const id = pathname.split("/")[2];
    const ea = getEAById(id);
    return { title: ea?.name ?? "EA Detail", crumb: "EA Library" };
  }
  return ROUTE_META[pathname] ?? { title: "FX Pulse", crumb: "Workspace" };
}

export function TopBar({ onOpenNav }: { onOpenNav: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { aiPanelOpen, toggleAIPanel, searchQuery, setSearchQuery } =
    useFXPulse();
  const meta = metaFor(pathname);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathname !== "/library") router.push("/library");
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={onOpenNav}
          aria-label="Open navigation menu"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-line text-muted hover:bg-surface-soft lg:hidden"
        >
          <IconList size={18} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="text-[11px] font-medium uppercase tracking-wide text-faint">
            FX Pulse · {meta.crumb}
          </div>
          <h1 className="truncate text-lg font-bold leading-tight text-ink">
            {meta.title}
          </h1>
        </div>

        <form onSubmit={onSearchSubmit} className="hidden sm:block" role="search">
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint">
              <IconSearch size={16} />
            </span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search EAs…"
              aria-label="Search EAs"
              className="h-10 w-44 rounded-xl border border-line bg-surface-soft pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-faint focus:border-primary focus:bg-surface md:w-64"
            />
          </div>
        </form>

        <Button
          variant="primary"
          leftIcon={<IconPlus size={16} />}
          onClick={() => comingSoon("Adding an EA")}
          className="hidden sm:inline-flex"
        >
          Add EA
        </Button>
        <Button
          variant="primary"
          aria-label="Add EA"
          onClick={() => comingSoon("Adding an EA")}
          className="sm:hidden"
        >
          <IconPlus size={18} />
        </Button>

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
