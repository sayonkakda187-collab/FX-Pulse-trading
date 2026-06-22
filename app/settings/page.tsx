"use client";

import { useState } from "react";
import { PageScope } from "@/components/shell/PageScope";
import { SectionCard } from "@/components/ui/Card";
import { Button, comingSoon } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { IconSettings, IconCheck } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { SCORE_WEIGHTS } from "@/lib/scoring";

function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange?: (v: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-primary" : "bg-[#d8d6e4]",
      )}
    >
      <span
        className={cn(
          "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-[22px]" : "translate-x-0.5",
        )}
      />
    </button>
  );
}

function Row({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <div className="text-[13.5px] font-medium text-ink">{title}</div>
        {description ? (
          <div className="text-[12.5px] text-muted">{description}</div>
        ) : null}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

const WEIGHT_LABELS: Record<string, string> = {
  profitability: "Profitability",
  riskControl: "Risk Control",
  behaviorSafety: "Behaviour Safety",
  consistency: "Win-Rate Consistency",
  robustness: "Robustness",
};

export default function SettingsPage() {
  const [weights, setWeights] = useState<Record<string, number>>(() =>
    Object.fromEntries(
      Object.entries(SCORE_WEIGHTS).map(([k, v]) => [k, Math.round(v * 100)]),
    ),
  );
  const [maxDDAlert, setMaxDDAlert] = useState(20);
  const [minPF, setMinPF] = useState(1.3);
  const [minScore, setMinScore] = useState(75);
  const [imports, setImports] = useState({
    autoScan: true,
    quarantineBehaviour: true,
    requireStopLoss: true,
  });
  const [tone, setTone] = useState("Measured");
  const [showConfidence, setShowConfidence] = useState(true);

  const totalWeight = Object.values(weights).reduce((s, v) => s + v, 0);

  return (
    <div className="space-y-6">
      <PageScope scope="Vault Overview" />

      <p className="max-w-2xl text-sm leading-relaxed text-muted">
        Configure how FX Pulse scores and flags EAs. Settings are a working
        preview in Phase 1 — changes are not persisted yet.
      </p>

      {/* Scoring weights */}
      <SectionCard
        title="Scoring weights"
        icon={<IconSettings size={16} />}
        description="How much each factor contributes to the Quality Score."
        action={
          <Badge tone={totalWeight === 100 ? "success" : "warning"} dot>
            Total {totalWeight}%
          </Badge>
        }
      >
        <div className="space-y-4">
          {Object.entries(weights).map(([key, value]) => (
            <div key={key}>
              <div className="flex items-center justify-between text-[13px]">
                <span className="font-medium text-ink">
                  {WEIGHT_LABELS[key] ?? key}
                </span>
                <span className="num text-muted">{value}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={40}
                value={value}
                onChange={(e) =>
                  setWeights((w) => ({ ...w, [key]: Number(e.target.value) }))
                }
                aria-label={`${WEIGHT_LABELS[key] ?? key} weight`}
                className="range-allocation mt-2"
              />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Risk thresholds */}
      <SectionCard
        title="Risk thresholds"
        description="Trigger points for warnings and approval."
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-wide text-faint">
              Max drawdown alert
            </span>
            <div className="mt-1 flex items-center gap-2">
              <input
                type="number"
                value={maxDDAlert}
                min={0}
                max={100}
                onChange={(e) => setMaxDDAlert(Number(e.target.value))}
                className="num h-10 w-full rounded-xl border border-line bg-surface-soft px-3 text-sm text-ink outline-none focus:border-primary"
              />
              <span className="text-sm text-muted">%</span>
            </div>
          </label>
          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-wide text-faint">
              Min profit factor
            </span>
            <input
              type="number"
              step={0.1}
              value={minPF}
              onChange={(e) => setMinPF(Number(e.target.value))}
              className="num mt-1 h-10 w-full rounded-xl border border-line bg-surface-soft px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
          <label className="block">
            <span className="text-[12px] font-medium uppercase tracking-wide text-faint">
              Min score to approve
            </span>
            <input
              type="number"
              value={minScore}
              min={0}
              max={100}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="num mt-1 h-10 w-full rounded-xl border border-line bg-surface-soft px-3 text-sm text-ink outline-none focus:border-primary"
            />
          </label>
        </div>
      </SectionCard>

      {/* Appearance */}
      <SectionCard title="Appearance" description="Workspace theme.">
        <div className="flex flex-wrap gap-2">
          {[
            { key: "Light", available: true },
            { key: "Dark", available: false },
            { key: "System", available: false },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              disabled={!opt.available}
              onClick={() =>
                opt.available
                  ? undefined
                  : comingSoon(`${opt.key} theme`)
              }
              className={cn(
                "inline-flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-colors",
                opt.available
                  ? "border-primary bg-primary-soft text-primary-dark"
                  : "border-line bg-surface text-muted hover:bg-surface-soft",
              )}
            >
              {opt.available ? <IconCheck size={15} /> : null}
              {opt.key}
              {!opt.available ? (
                <span className="text-[11px] text-faint">soon</span>
              ) : null}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Data import settings */}
      <SectionCard
        title="Data import settings"
        description="Defaults applied when new EAs are collected."
      >
        <div className="divide-y divide-line">
          <Row
            title="Auto-scan on import"
            description="Run the risk & behaviour scan automatically."
          >
            <Toggle
              checked={imports.autoScan}
              onChange={(v) => setImports((s) => ({ ...s, autoScan: v }))}
              label="Auto-scan on import"
            />
          </Row>
          <Row
            title="Quarantine grid / martingale"
            description="Automatically isolate EAs that use grid or martingale."
          >
            <Toggle
              checked={imports.quarantineBehaviour}
              onChange={(v) =>
                setImports((s) => ({ ...s, quarantineBehaviour: v }))
              }
              label="Quarantine grid or martingale EAs"
            />
          </Row>
          <Row
            title="Require stop loss"
            description="Flag any EA imported without a stop loss."
          >
            <Toggle
              checked={imports.requireStopLoss}
              onChange={(v) =>
                setImports((s) => ({ ...s, requireStopLoss: v }))
              }
              label="Require stop loss"
            />
          </Row>
        </div>
      </SectionCard>

      {/* AI response preferences */}
      <SectionCard
        title="AI response preferences"
        description="How the assistant communicates."
      >
        <div className="divide-y divide-line">
          <Row title="Response tone">
            <div className="inline-flex rounded-xl border border-line bg-surface p-1">
              {["Measured", "Concise", "Detailed"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTone(t)}
                  aria-pressed={tone === t}
                  className={cn(
                    "rounded-lg px-3 py-1.5 text-[13px] font-semibold transition-colors",
                    tone === t
                      ? "bg-primary text-white"
                      : "text-muted hover:text-ink",
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </Row>
          <Row
            title="Show confidence level"
            description="Display High / Medium / Low on every verdict."
          >
            <Toggle
              checked={showConfidence}
              onChange={setShowConfidence}
              label="Show confidence level"
            />
          </Row>
          <Row
            title="Always include disclaimer"
            description="“Analysis only, not financial advice.” (required)"
          >
            <Toggle checked disabled label="Always include disclaimer" />
          </Row>
        </div>
      </SectionCard>

      {/* Save bar */}
      <div className="flex items-center justify-end gap-2 rounded-card border border-line bg-surface p-4 shadow-card">
        <Button variant="ghost" onClick={() => comingSoon("Resetting settings")}>
          Reset
        </Button>
        <Button variant="primary" onClick={() => comingSoon("Saving settings")}>
          Save changes
        </Button>
      </div>
    </div>
  );
}
