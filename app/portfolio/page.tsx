"use client";

import { PageScope } from "@/components/shell/PageScope";
import { PortfolioDraft } from "@/components/portfolio/PortfolioDraft";
import { IconInfo } from "@/components/ui/icons";

export default function PortfolioPage() {
  return (
    <div className="space-y-5">
      <PageScope scope="Portfolio Draft" />

      {/* Persistent sandbox banner */}
      <div className="flex items-start gap-2.5 rounded-card border border-[#e4dffb] bg-primary-soft px-4 py-3">
        <IconInfo size={18} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-[13px] leading-snug text-ink">
          <span className="font-semibold text-primary-dark">Draft only —</span>{" "}
          not connected to a broker. This is a planning sandbox. No live trading
          or execution in Phase 1.
        </p>
      </div>

      <PortfolioDraft />
    </div>
  );
}
