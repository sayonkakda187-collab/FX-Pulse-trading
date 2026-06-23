"use client";

import { PageScope } from "@/components/shell/PageScope";
import { PortfolioDraft } from "@/components/portfolio/PortfolioDraft";
import { IconInfo } from "@/components/ui/icons";

export default function PortfolioPage() {
  return (
    <div className="space-y-6">
      <PageScope scope="Portfolio Draft Review" />

      {/* Persistent sandbox banner */}
      <div className="flex items-start gap-2.5 rounded-card border border-[#e4dffb] bg-primary-soft px-4 py-3">
        <IconInfo size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-[13px] leading-snug text-ink">
          <span className="font-semibold text-primary-dark">Draft only —</span>{" "}
          not connected to a broker. This is a planning sandbox. No live trading
          or execution in Phase 1.
        </p>
      </div>

      <div>
        <h2 className="text-lg font-bold tracking-tight text-ink">Draft Sandbox</h2>
        <p className="mt-0.5 text-[13px] text-muted">
          Plan a research allocation — check mix, correlation and risk rules.
        </p>
      </div>

      <PortfolioDraft />
    </div>
  );
}
