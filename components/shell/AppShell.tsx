"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { useFXPulse } from "@/context/FXPulseContext";

export function AppShell({ children }: { children: ReactNode }) {
  const [navOpen, setNavOpen] = useState(false);
  const { setAIPanelOpen } = useFXPulse();

  // Open the assistant panel by default on desktop only. Runs after mount so
  // server and client initial render agree (both start closed).
  useEffect(() => {
    if (window.matchMedia("(min-width: 1280px)").matches) {
      setAIPanelOpen(true);
    }
  }, [setAIPanelOpen]);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar drawerOpen={navOpen} onClose={() => setNavOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar onOpenNav={() => setNavOpen(true)} />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-workspace px-4 py-6 sm:px-6 sm:py-7 lg:px-10 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      <AIAssistantPanel />
    </div>
  );
}
