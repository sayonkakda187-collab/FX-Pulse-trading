// FX Pulse — quality-score reasoning model (Phase 1, deterministic, no AI)
//
// The published Quality Score is risk-first: profitability matters, but risk
// control and behaviour safety (grid / martingale / stop loss) dominate. This
// module decomposes a score into weighted factors so the UI can *teach* why a
// high win rate alone is never enough.

import { clamp, mapRange, round } from "./utils";
import type { EA, ScoreBreakdown, ScoreComponent, Sensitivity } from "./types";

export const SCORE_WEIGHTS = {
  profitability: 0.24,
  riskControl: 0.26,
  behaviorSafety: 0.2,
  consistency: 0.14,
  robustness: 0.16,
} as const;

function sensScore(s: Sensitivity): number {
  if (s === "Low") return 92;
  if (s === "Medium") return 62;
  return 32;
}

function rawProfitability(ea: EA): number {
  const base = clamp(mapRange(ea.profitFactor, 1.0, 2.2, 12, 96), 0, 100);
  if (ea.recoveryFactor != null) {
    const rec = clamp(mapRange(ea.recoveryFactor, 0.8, 3.0, 25, 96), 0, 100);
    return 0.7 * base + 0.3 * rec;
  }
  return base;
}

function rawRiskControl(ea: EA): number {
  let base = clamp(mapRange(ea.maxDrawdown, 5, 48, 96, 10), 10, 96);
  if (!ea.stopLoss) base *= 0.5;
  return base;
}

function rawBehaviorSafety(ea: EA): number {
  let s = 100;
  if (ea.grid) s -= 42;
  if (ea.martingale) s -= 42;
  if (!ea.stopLoss) s -= 24;
  return clamp(s, 4, 100);
}

function rawConsistency(ea: EA): number {
  const q = clamp(mapRange(ea.profitFactor, 1.0, 2.0, 38, 92), 0, 100);
  const penalty =
    ea.winRate > 66 && ea.profitFactor < 1.45
      ? clamp((ea.winRate - 66) * 1.1 + (1.45 - ea.profitFactor) * 45, 0, 55)
      : 0;
  return clamp(q - penalty, 5, 100);
}

function rawRobustness(ea: EA): number {
  const sens = (sensScore(ea.spreadSensitive) + sensScore(ea.newsSensitive)) / 2;
  let adj = 0;
  if (ea.forwardTestResult != null) {
    adj = ea.forwardTestResult > 0 ? 6 : -8;
  }
  return clamp(0.9 * sens + adj, 5, 100);
}

/**
 * Decompose the published Quality Score into weighted risk-quality factors.
 *
 * The raw factor model is deliberately risk-first. We then apply a single
 * shared offset so the weighted blend reconciles to the published score while
 * preserving *which* factors are weakest — that ordering is the lesson.
 */
export function computeScoreBreakdown(ea: EA): ScoreBreakdown {
  const raw = {
    profitability: rawProfitability(ea),
    riskControl: rawRiskControl(ea),
    behaviorSafety: rawBehaviorSafety(ea),
    consistency: rawConsistency(ea),
    robustness: rawRobustness(ea),
  };

  const rawBlend =
    raw.profitability * SCORE_WEIGHTS.profitability +
    raw.riskControl * SCORE_WEIGHTS.riskControl +
    raw.behaviorSafety * SCORE_WEIGHTS.behaviorSafety +
    raw.consistency * SCORE_WEIGHTS.consistency +
    raw.robustness * SCORE_WEIGHTS.robustness;

  const offset = ea.qualityScore - rawBlend;
  const adjust = (v: number) => clamp(round(v + offset), 2, 100);

  const behaviorNote = (() => {
    const bad: string[] = [];
    if (ea.grid) bad.push("grid");
    if (ea.martingale) bad.push("martingale");
    if (!ea.stopLoss) bad.push("no stop loss");
    return bad.length
      ? `Hidden-risk behaviour: ${bad.join(", ")}`
      : "No grid / martingale · stop loss in place";
  })();

  const components: ScoreComponent[] = [
    {
      key: "profitability",
      label: "Profitability",
      score: adjust(raw.profitability),
      weight: SCORE_WEIGHTS.profitability,
      note:
        `Profit factor ${ea.profitFactor.toFixed(2)}` +
        (ea.recoveryFactor != null
          ? ` · recovery ${ea.recoveryFactor.toFixed(1)}`
          : ""),
    },
    {
      key: "riskControl",
      label: "Risk Control",
      score: adjust(raw.riskControl),
      weight: SCORE_WEIGHTS.riskControl,
      note: `${ea.maxDrawdown.toFixed(1)}% max drawdown · ${
        ea.stopLoss ? "stop loss set" : "no stop loss"
      }`,
    },
    {
      key: "behaviorSafety",
      label: "Behaviour Safety",
      score: adjust(raw.behaviorSafety),
      weight: SCORE_WEIGHTS.behaviorSafety,
      note: behaviorNote,
    },
    {
      key: "consistency",
      label: "Win-Rate Consistency",
      score: adjust(raw.consistency),
      weight: SCORE_WEIGHTS.consistency,
      note:
        `${ea.winRate}% win rate vs PF ${ea.profitFactor.toFixed(2)}` +
        (isWinRateMisleading(ea) ? " · win rate overstates edge" : ""),
    },
    {
      key: "robustness",
      label: "Robustness",
      score: adjust(raw.robustness),
      weight: SCORE_WEIGHTS.robustness,
      note: `Spread ${ea.spreadSensitive.toLowerCase()} · news ${ea.newsSensitive.toLowerCase()} sensitivity`,
    },
  ];

  return { modelEstimate: ea.qualityScore, components };
}

/** A high win rate is misleading when risk control / behaviour is weak. */
export function isWinRateMisleading(ea: EA): boolean {
  return (
    ea.winRate >= 65 &&
    (ea.grid ||
      ea.martingale ||
      !ea.stopLoss ||
      ea.profitFactor < 1.3 ||
      ea.maxDrawdown >= 20)
  );
}

export interface WinRateReadout {
  headline: string;
  tone: "success" | "warning" | "danger";
}

/** The one-line "win rate reality" message used across the app. */
export function winRateReality(ea: EA): WinRateReadout {
  const highWR = ea.winRate >= 65;
  const weakControl =
    ea.grid ||
    ea.martingale ||
    !ea.stopLoss ||
    ea.profitFactor < 1.25 ||
    ea.maxDrawdown >= 25;
  const moderateControl = ea.profitFactor < 1.5 || ea.maxDrawdown >= 15;

  if (weakControl) {
    return {
      headline: highWR
        ? "High win rate, but weak risk control."
        : "Weak risk control — handle with caution.",
      tone: "danger",
    };
  }
  if (moderateControl) {
    return {
      headline: highWR
        ? "Strong win rate — keep watching risk control."
        : "Reasonable risk profile; keep testing.",
      tone: "warning",
    };
  }
  return {
    headline: "Win rate is backed by solid risk control.",
    tone: "success",
  };
}
