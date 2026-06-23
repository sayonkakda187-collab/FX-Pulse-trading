// FX Pulse — mock data (Phase 1). No backend, no APIs, no persistence.
// Everything here is deterministic so the server and client render identically.

import type {
  AIScope,
  AIVerdict,
  AIWarning,
  ChatMessage,
  Confidence,
  EA,
  EAStatus,
  ReviewQueueItem,
} from "./types";
import { isWinRateMisleading } from "./scoring";

/* -------------------------------------------------------------------------- */
/*  Deterministic equity / drawdown curve generation                          */
/* -------------------------------------------------------------------------- */

function makeRng(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface CurveProfile {
  drift: number;
  vol: number;
  shockProb: number;
  shockSize: number;
  /** Position (0–1) of an engineered cliff, e.g. a grid blow-up. */
  crashAt?: number;
  crashSize?: number;
}

function generateEquity(id: string, profile: CurveProfile, points = 56): number[] {
  const rng = makeRng(id);
  const eq: number[] = [];
  let value = 10000;
  eq.push(value);
  for (let i = 1; i < points; i++) {
    let r = profile.drift + (rng() - 0.5) * 2 * profile.vol;
    if (profile.shockProb > 0 && rng() < profile.shockProb) {
      r -= profile.shockSize * (0.6 + rng() * 0.8);
    }
    if (profile.crashAt != null && i === Math.round(points * profile.crashAt)) {
      r -= profile.crashSize ?? 0.3;
    }
    value = value * (1 + r);
    if (value < 800) value = 800;
    eq.push(Math.round(value));
  }
  return eq;
}

function drawdownFromEquity(eq: number[]): number[] {
  let peak = eq[0];
  return eq.map((v) => {
    if (v > peak) peak = v;
    return Math.round(((peak - v) / peak) * 1000) / 10;
  });
}

function sparkFromEquity(eq: number[], n = 16): number[] {
  const step = Math.max(1, Math.floor(eq.length / n));
  const out: number[] = [];
  for (let i = 0; i < eq.length; i += step) out.push(eq[i]);
  if (out[out.length - 1] !== eq[eq.length - 1]) out.push(eq[eq.length - 1]);
  return out;
}

/* -------------------------------------------------------------------------- */
/*  EA seeds                                                                  */
/* -------------------------------------------------------------------------- */

/** Free/Paid, value and vendor/security metadata, merged into each EA. */
type EAMeta = Pick<EA, "sourceType" | "valueScore"> &
  Partial<
    Pick<
      EA,
      | "price"
      | "license"
      | "vendorTrust"
      | "support"
      | "updates"
      | "openSource"
      | "codeAvailable"
      | "usesDLL"
      | "usesWebRequest"
      | "securityVerdict"
    >
  >;

type EASeed = Omit<
  EA,
  "equityCurve" | "drawdownCurve" | "sparkline" | keyof EAMeta
> & {
  profile: CurveProfile;
};

const SEEDS: EASeed[] = [
  {
    id: "london-breakout",
    name: "London Breakout EA",
    platform: "MT5",
    strategy: "Breakout",
    pairs: "EUR/USD, GBP/USD",
    pairList: ["EUR/USD", "GBP/USD"],
    timeframe: "H1",
    status: "Approved",
    qualityScore: 86,
    winRate: 63,
    profitFactor: 1.82,
    maxDrawdown: 8.4,
    recoveryFactor: 2.3,
    averageWin: 42.1,
    averageLoss: -28.7,
    riskType: "Normal",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Low",
    newsSensitive: "Medium",
    backtestResult: 3420,
    forwardTestResult: 512,
    aiReviewed: true,
    addedOn: "2026-04-18",
    aiVerdictLine: "Approved for low-risk testing",
    aiVerdict: {
      summary: "London Breakout EA is approved for low-risk testing.",
      evidence: [
        "Profit factor 1.82 with max drawdown held to 8.4%",
        "Recovery factor 2.3 — losses are recovered efficiently",
        "Stop loss enforced; no grid or martingale",
        "Forward test (+$512) directionally agrees with backtest (+$3,420)",
      ],
      risk: "Breakout entries can underperform in low-volatility, range-bound sessions.",
      reason: "Returns are backed by genuine risk control, not a fragile high win rate.",
      suggestedAction:
        "Continue forward testing on a demo account and monitor performance around major news.",
      confidence: "High",
    },
    profile: { drift: 0.012, vol: 0.017, shockProb: 0.05, shockSize: 0.03 },
  },
  {
    id: "trend-rider-pro",
    name: "Trend Rider Pro",
    platform: "MT5",
    strategy: "Trend Following",
    pairs: "Multi-pair",
    pairList: ["Multi-pair"],
    timeframe: "H4",
    status: "Approved",
    qualityScore: 78,
    winRate: 58,
    profitFactor: 1.64,
    maxDrawdown: 10.1,
    recoveryFactor: 1.9,
    averageWin: 61.2,
    averageLoss: -39.5,
    riskType: "Normal",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Low",
    newsSensitive: "Low",
    backtestResult: 2890,
    forwardTestResult: 410,
    aiReviewed: true,
    addedOn: "2026-04-22",
    aiVerdictLine: "Approved for continued testing",
    aiVerdict: {
      summary: "Trend Rider Pro looks solid for continued low-risk testing.",
      evidence: [
        "Profit factor 1.64 with max drawdown 10.1%",
        "Recovery factor 1.9",
        "Stop loss enforced; no grid or martingale",
        "Low spread and news sensitivity across multiple pairs",
      ],
      risk: "Trend following can suffer repeated small losses in choppy, directionless markets.",
      reason: "Risk control is sound and the edge does not rely on an inflated win rate.",
      suggestedAction:
        "Keep forward testing; watch behaviour during prolonged ranging conditions.",
      confidence: "High",
    },
    profile: { drift: 0.0105, vol: 0.022, shockProb: 0.06, shockSize: 0.04 },
  },
  {
    id: "gold-momentum",
    name: "Gold Momentum EA",
    platform: "MT4",
    strategy: "Momentum",
    pairs: "XAU/USD",
    pairList: ["XAU/USD"],
    timeframe: "M30",
    status: "Testing",
    qualityScore: 74,
    winRate: 61,
    profitFactor: 1.48,
    maxDrawdown: 12.5,
    recoveryFactor: 1.7,
    averageWin: 55.4,
    averageLoss: -41.2,
    riskType: "Medium",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Medium",
    newsSensitive: "High",
    backtestResult: 2110,
    forwardTestResult: 280,
    aiReviewed: true,
    addedOn: "2026-05-02",
    aiVerdictLine: "Keep testing — news sensitive",
    aiVerdict: {
      summary: "Gold Momentum EA needs more testing before approval.",
      evidence: [
        "Profit factor 1.48 with 12.5% max drawdown",
        "High news sensitivity on XAU/USD",
        "Stop loss enforced; no grid or martingale",
        "Medium spread sensitivity can erode a scalped edge",
      ],
      risk: "Gold reacts sharply to news; slippage and gaps can exceed expectations.",
      reason: "The strategy is reasonable but its edge is exposed to news-driven volatility.",
      suggestedAction:
        "Keep in Testing. Trial with news-time filters before considering the portfolio draft.",
      confidence: "Medium",
    },
    profile: { drift: 0.009, vol: 0.03, shockProb: 0.1, shockSize: 0.05 },
  },
  {
    id: "scalper-xtreme",
    name: "Scalper Xtreme",
    platform: "MT5",
    strategy: "Scalper",
    pairs: "XAU/USD",
    pairList: ["XAU/USD"],
    timeframe: "M5",
    status: "Quarantine",
    qualityScore: 48,
    winRate: 78,
    profitFactor: 1.12,
    maxDrawdown: 28.4,
    recoveryFactor: 0.9,
    averageWin: 11.3,
    averageLoss: -33.6,
    riskType: "High",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "High",
    newsSensitive: "High",
    backtestResult: 1740,
    forwardTestResult: -190,
    aiReviewed: true,
    addedOn: "2026-05-09",
    aiVerdictLine: "Review before adding to portfolio",
    aiVerdict: {
      summary: "Scalper Xtreme should be reviewed before adding to any portfolio draft.",
      evidence: [
        "Win rate is high at 78%, but profit factor is only 1.12",
        "Max drawdown is 28.4%",
        "It is sensitive to spread on XAU/USD",
        "Recent results show multiple consecutive losses",
      ],
      risk: "This EA may look attractive because of win rate, but risk control appears weak.",
      reason: "High win rate with weak profit factor and high drawdown can indicate hidden risk.",
      suggestedAction:
        "Keep this EA in Quarantine and continue demo testing. Do not add it to the portfolio draft yet.",
      confidence: "Medium",
    },
    profile: { drift: 0.004, vol: 0.045, shockProb: 0.16, shockSize: 0.09 },
  },
  {
    id: "grid-recovery",
    name: "Grid Recovery EA",
    platform: "MT4",
    strategy: "Grid Recovery",
    pairs: "EUR/USD",
    pairList: ["EUR/USD"],
    timeframe: "M15",
    status: "Rejected",
    qualityScore: 31,
    winRate: 92,
    profitFactor: 1.05,
    maxDrawdown: 45,
    recoveryFactor: 0.4,
    averageWin: 8.7,
    averageLoss: -96.4,
    riskType: "Extreme",
    grid: true,
    martingale: true,
    stopLoss: false,
    spreadSensitive: "High",
    newsSensitive: "High",
    backtestResult: 980,
    forwardTestResult: -2400,
    aiReviewed: true,
    addedOn: "2026-05-12",
    aiVerdictLine: "Rejected due to hidden risk",
    aiVerdict: {
      summary: "Grid Recovery EA is rejected due to hidden risk.",
      evidence: [
        "92% win rate is produced by averaging into losers, not by edge",
        "Profit factor is only 1.05 — barely above break-even",
        "Max drawdown reaches 45%",
        "Uses grid and martingale with no stop loss",
      ],
      risk: "A single sustained trend can trigger an unrecoverable drawdown and wipe the account.",
      reason:
        "The high win rate masks an asymmetric risk profile typical of grid / martingale systems.",
      suggestedAction:
        "Do not add to the portfolio draft. Keep Rejected; use only for study, not testing capital.",
      confidence: "High",
    },
    profile: {
      drift: 0.014,
      vol: 0.009,
      shockProb: 0,
      shockSize: 0,
      crashAt: 0.82,
      crashSize: 0.36,
    },
  },
  {
    id: "tokyo-mean-reversion",
    name: "Tokyo Mean Reversion",
    platform: "MT5",
    strategy: "Mean Reversion",
    pairs: "USD/JPY",
    pairList: ["USD/JPY"],
    timeframe: "H1",
    status: "Testing",
    qualityScore: 69,
    winRate: 55,
    profitFactor: 1.42,
    maxDrawdown: 9.2,
    recoveryFactor: 1.6,
    averageWin: 38.9,
    averageLoss: -30.1,
    riskType: "Low",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Low",
    newsSensitive: "Medium",
    backtestResult: 1960,
    forwardTestResult: 240,
    aiReviewed: true,
    addedOn: "2026-05-15",
    aiVerdictLine: "Reasonable — still testing",
    aiVerdict: {
      summary: "Tokyo Mean Reversion is a reasonable candidate still in testing.",
      evidence: [
        "Profit factor 1.42 with a contained 9.2% max drawdown",
        "Stop loss enforced; no grid or martingale",
        "Low spread sensitivity on USD/JPY",
        "Win rate 55% is consistent with its profit factor",
      ],
      risk: "Mean reversion can fail badly during strong trending breakouts.",
      reason: "Risk control is sound; the edge is modest but honestly represented.",
      suggestedAction:
        "Continue Testing; consider for the portfolio draft once forward results accumulate.",
      confidence: "Medium",
    },
    profile: { drift: 0.008, vol: 0.02, shockProb: 0.06, shockSize: 0.035 },
  },
  {
    id: "carry-harvest",
    name: "Carry Harvest EA",
    platform: "MT5",
    strategy: "Carry / Swing",
    pairs: "AUD/JPY",
    pairList: ["AUD/JPY"],
    timeframe: "D1",
    status: "Approved",
    qualityScore: 81,
    winRate: 56,
    profitFactor: 1.71,
    maxDrawdown: 7.9,
    recoveryFactor: 2.1,
    averageWin: 88.5,
    averageLoss: -58.3,
    riskType: "Normal",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Low",
    newsSensitive: "Low",
    backtestResult: 3110,
    forwardTestResult: 470,
    aiReviewed: true,
    addedOn: "2026-04-28",
    aiVerdictLine: "Approved for low-risk testing",
    aiVerdict: {
      summary: "Carry Harvest EA is approved for low-risk testing.",
      evidence: [
        "Profit factor 1.71 with max drawdown 7.9%",
        "Recovery factor 2.1",
        "Stop loss enforced; no grid or martingale",
        "Low spread and news sensitivity",
      ],
      risk: "Carry strategies are exposed to sudden interest-rate and risk-sentiment shifts.",
      reason: "Strong risk control with a believable, moderate win rate.",
      suggestedAction:
        "Continue forward testing; monitor around central-bank decisions.",
      confidence: "High",
    },
    profile: { drift: 0.011, vol: 0.016, shockProb: 0.05, shockSize: 0.035 },
  },
  {
    id: "frankfurt-range",
    name: "Frankfurt Range Bot",
    platform: "MT5",
    strategy: "Range",
    pairs: "EUR/USD",
    pairList: ["EUR/USD"],
    timeframe: "M15",
    status: "Watchlist",
    qualityScore: 64,
    winRate: 60,
    profitFactor: 1.38,
    maxDrawdown: 11.8,
    recoveryFactor: 1.4,
    averageWin: 24.6,
    averageLoss: -19.8,
    riskType: "Medium",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Medium",
    newsSensitive: "Low",
    backtestResult: 1480,
    forwardTestResult: 120,
    aiReviewed: true,
    addedOn: "2026-05-20",
    aiVerdictLine: "On watchlist — thin edge",
    aiVerdict: {
      summary: "Frankfurt Range Bot is on the watchlist pending more data.",
      evidence: [
        "Profit factor 1.38 with max drawdown 11.8%",
        "Stop loss enforced; no grid or martingale",
        "Medium spread sensitivity",
        "Win rate 60% is broadly consistent with profit factor",
      ],
      risk: "Range strategies break down when volatility expands out of the range.",
      reason: "Acceptable risk control, but the edge is thin and not yet proven.",
      suggestedAction:
        "Keep on Watchlist; gather more forward-test history before committing testing capital.",
      confidence: "Medium",
    },
    profile: { drift: 0.0075, vol: 0.021, shockProb: 0.08, shockSize: 0.04 },
  },
  {
    id: "sydney-swing",
    name: "Sydney Swing EA",
    platform: "MT5",
    strategy: "Swing",
    pairs: "AUD/USD",
    pairList: ["AUD/USD"],
    timeframe: "H4",
    status: "Watchlist",
    qualityScore: 71,
    winRate: 52,
    profitFactor: 1.55,
    maxDrawdown: 9.8,
    recoveryFactor: 1.8,
    averageWin: 70.4,
    averageLoss: -47.1,
    riskType: "Low",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Low",
    newsSensitive: "Low",
    backtestResult: 2050,
    forwardTestResult: 190,
    aiReviewed: false,
    addedOn: "2026-05-24",
    aiVerdictLine: "Promising — needs history",
    aiVerdict: {
      summary: "Sydney Swing EA shows promise but needs more history.",
      evidence: [
        "Profit factor 1.55 with max drawdown 9.8%",
        "Recovery factor 1.8",
        "Stop loss enforced; no grid or martingale",
        "Low sensitivity to spread and news",
      ],
      risk: "Swing trades hold overnight, exposing the account to gap risk.",
      reason: "Good risk control; the sample size is still small.",
      suggestedAction:
        "Keep on Watchlist and continue collecting forward results.",
      confidence: "Medium",
    },
    profile: { drift: 0.0095, vol: 0.019, shockProb: 0.06, shockSize: 0.04 },
  },
  {
    id: "index-pulse",
    name: "Index Pulse EA",
    platform: "MT5",
    strategy: "Breakout",
    pairs: "US30, NAS100",
    pairList: ["US30", "NAS100"],
    timeframe: "M30",
    status: "New",
    qualityScore: 58,
    winRate: 57,
    profitFactor: 1.3,
    maxDrawdown: 14.2,
    recoveryFactor: 1.2,
    averageWin: 64.1,
    averageLoss: -52.3,
    riskType: "Medium",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "Medium",
    newsSensitive: "High",
    backtestResult: 1320,
    aiReviewed: false,
    addedOn: "2026-06-12",
    aiVerdictLine: "Newly collected — run first review",
    aiVerdict: {
      summary: "Index Pulse EA is newly collected and not yet reviewed in depth.",
      evidence: [
        "Profit factor 1.30 with 14.2% max drawdown",
        "High news sensitivity",
        "Stop loss enforced; no grid or martingale",
        "Limited history available",
      ],
      risk: "Index breakouts are highly news- and session-driven.",
      reason: "Early data only; the edge is not yet established.",
      suggestedAction:
        "Run an initial review and start demo forward testing before judging it.",
      confidence: "Low",
    },
    profile: { drift: 0.0085, vol: 0.028, shockProb: 0.11, shockSize: 0.05 },
  },
  {
    id: "martingale-master",
    name: "Martingale Master",
    platform: "MT4",
    strategy: "Martingale",
    pairs: "EUR/USD",
    pairList: ["EUR/USD"],
    timeframe: "M5",
    status: "Rejected",
    qualityScore: 27,
    winRate: 88,
    profitFactor: 1.08,
    maxDrawdown: 52,
    recoveryFactor: 0.3,
    averageWin: 9.4,
    averageLoss: -118.7,
    riskType: "Extreme",
    grid: false,
    martingale: true,
    stopLoss: false,
    spreadSensitive: "High",
    newsSensitive: "High",
    backtestResult: 760,
    forwardTestResult: -3100,
    aiReviewed: true,
    addedOn: "2026-05-30",
    aiVerdictLine: "Rejected — unsafe risk model",
    aiVerdict: {
      summary: "Martingale Master is rejected — the risk model is unsafe.",
      evidence: [
        "88% win rate is built on doubling into losers",
        "Profit factor 1.08 with 52% max drawdown",
        "Uses martingale with no stop loss",
        "High spread and news sensitivity",
      ],
      risk: "Martingale position sizing can blow up the account in a single adverse run.",
      reason: "The win rate is an illusion created by hiding losses in open positions.",
      suggestedAction: "Do not test with capital. Keep Rejected; study only.",
      confidence: "High",
    },
    profile: {
      drift: 0.012,
      vol: 0.011,
      shockProb: 0,
      shockSize: 0,
      crashAt: 0.74,
      crashSize: 0.44,
    },
  },
  {
    id: "news-fade",
    name: "News Fade EA",
    platform: "MT4",
    strategy: "News Fade",
    pairs: "GBP/USD",
    pairList: ["GBP/USD"],
    timeframe: "M15",
    status: "Quarantine",
    qualityScore: 44,
    winRate: 49,
    profitFactor: 1.18,
    maxDrawdown: 22,
    recoveryFactor: 1.0,
    averageWin: 47.2,
    averageLoss: -39.9,
    riskType: "High",
    grid: false,
    martingale: false,
    stopLoss: true,
    spreadSensitive: "High",
    newsSensitive: "High",
    backtestResult: 1130,
    forwardTestResult: -80,
    aiReviewed: true,
    addedOn: "2026-05-27",
    aiVerdictLine: "Keep in quarantine",
    aiVerdict: {
      summary: "News Fade EA should stay in quarantine for now.",
      evidence: [
        "Profit factor 1.18 with a high 22% max drawdown",
        "Fades news spikes on GBP/USD — high news sensitivity",
        "Stop loss enforced, but spread sensitivity is high",
        "Win rate 49% offers no cushion at this profit factor",
      ],
      risk: "Fading news can incur large losses when a spike becomes a sustained move.",
      reason: "A thin profit factor plus high drawdown make the edge fragile.",
      suggestedAction:
        "Keep in Quarantine; demo-test with strict news filters before reconsidering.",
      confidence: "Medium",
    },
    profile: { drift: 0.005, vol: 0.038, shockProb: 0.14, shockSize: 0.07 },
  },
];

// Free/Paid + value + vendor/security metadata per EA.
const META: Record<string, EAMeta> = {
  "london-breakout": {
    sourceType: "Paid",
    valueScore: 78,
    price: 199,
    license: "1 account",
    vendorTrust: "High",
    support: "Priority",
    updates: "Active",
  },
  "trend-rider-pro": {
    sourceType: "Paid",
    valueScore: 75,
    price: 149,
    license: "2 accounts",
    vendorTrust: "Medium",
    support: "Email",
    updates: "Occasional",
  },
  "gold-momentum": {
    sourceType: "Paid",
    valueScore: 64,
    price: 249,
    license: "1 account",
    vendorTrust: "Medium",
    support: "Email",
    updates: "Active",
  },
  "scalper-xtreme": {
    sourceType: "Paid",
    valueScore: 30,
    price: 299,
    license: "1 account",
    vendorTrust: "Low",
    support: "None",
    updates: "Stale",
  },
  "grid-recovery": {
    sourceType: "Free",
    valueScore: 18,
    openSource: true,
    codeAvailable: true,
    usesDLL: false,
    usesWebRequest: true,
    securityVerdict: "Transparent code, but a dangerous grid/martingale strategy.",
  },
  "tokyo-mean-reversion": {
    sourceType: "Free",
    valueScore: 70,
    openSource: true,
    codeAvailable: true,
    usesDLL: false,
    usesWebRequest: false,
    securityVerdict: "Open source and clean — safe to keep testing.",
  },
  "carry-harvest": {
    sourceType: "Paid",
    valueScore: 86,
    price: 179,
    license: "Unlimited",
    vendorTrust: "High",
    support: "Priority",
    updates: "Active",
  },
  "frankfurt-range": {
    sourceType: "Free",
    valueScore: 50,
    openSource: false,
    codeAvailable: false,
    usesDLL: true,
    usesWebRequest: true,
    securityVerdict: "Closed free EA bundling a DLL — review carefully before testing.",
  },
  "sydney-swing": {
    sourceType: "Free",
    valueScore: 80,
    openSource: true,
    codeAvailable: true,
    usesDLL: false,
    usesWebRequest: false,
    securityVerdict: "Open source, low security risk — gather more data.",
  },
  "index-pulse": {
    sourceType: "Paid",
    valueScore: 60,
    price: 129,
    license: "1 account",
    vendorTrust: "Medium",
    support: "Email",
    updates: "Occasional",
  },
  "martingale-master": {
    sourceType: "Paid",
    valueScore: 12,
    price: 349,
    license: "1 account",
    vendorTrust: "Low",
    support: "None",
    updates: "Stale",
  },
  "news-fade": {
    sourceType: "Free",
    valueScore: 38,
    openSource: false,
    codeAvailable: false,
    usesDLL: true,
    usesWebRequest: true,
    securityVerdict: "Closed free EA making network calls with a DLL — keep quarantined.",
  },
};

export const EAS: EA[] = SEEDS.map(({ profile, ...rest }) => {
  const equityCurve = generateEquity(rest.id, profile);
  return {
    ...rest,
    ...META[rest.id],
    equityCurve,
    drawdownCurve: drawdownFromEquity(equityCurve),
    sparkline: sparkFromEquity(equityCurve),
  };
});

const EA_MAP = new Map(EAS.map((ea) => [ea.id, ea]));

export function getEAById(id?: string | null): EA | undefined {
  if (!id) return undefined;
  return EA_MAP.get(id);
}

export function getEAsByIds(ids: string[]): EA[] {
  return ids.map((id) => EA_MAP.get(id)).filter((e): e is EA => Boolean(e));
}

/* -------------------------------------------------------------------------- */
/*  Spotlights, KPIs, warnings, review queue                                  */
/* -------------------------------------------------------------------------- */

export const BEST_EA_ID = "london-breakout";
export const RISKIEST_EA_ID = "grid-recovery";
export const BEST_FREE_EA_ID = "sydney-swing";
export const BEST_PAID_EA_ID = "london-breakout";
export const BEST_VALUE_EA_ID = "carry-harvest";
export const MOST_DANGEROUS_EA_ID = "grid-recovery";

export function freeEAs(list: EA[] = EAS): EA[] {
  return list.filter((e) => e.sourceType === "Free");
}
export function paidEAs(list: EA[] = EAS): EA[] {
  return list.filter((e) => e.sourceType === "Paid");
}

/** Curated vault overview figures shown on the Dashboard + sidebar. */
export const VAULT_STATS = {
  total: 30,
  free: 18,
  paid: 12,
  approved: 8,
  needsReview: 6,
  highRisk: 7,
  aiReviewed: 24,
} as const;

/** Account shown in the top bar. */
export const USER = {
  name: "Chan Dara",
  role: "Admin",
  initials: "CD",
};

/** Mock monthly trend for the "EA Quality Overview" chart (avg of vault). */
export const QUALITY_TREND = [54, 58, 57, 62, 66, 64, 71, 76];
export const RISK_TREND = [38, 36, 41, 39, 35, 44, 40, 33];
export const TREND_LABELS = [
  "Jun 1",
  "Jun 8",
  "Jun 15",
  "Jun 22",
  "Jun 30",
];

/** Tiny deterministic sparklines for the KPI cards. */
export const KPI_SPARKS: Record<string, number[]> = {
  total: [20, 22, 21, 24, 26, 27, 29, 30],
  approved: [3, 4, 4, 5, 6, 7, 7, 8],
  needsReview: [9, 8, 7, 8, 6, 7, 6, 6],
  highRisk: [4, 5, 6, 6, 7, 6, 7, 7],
  aiReviewed: [12, 14, 16, 18, 20, 22, 23, 24],
};

export const STATUS_TABS: Array<EAStatus | "All"> = [
  "All",
  "Approved",
  "Testing",
  "Watchlist",
  "Quarantine",
  "Rejected",
];

export interface VaultKPIs {
  total: number;
  approved: number;
  testing: number;
  watchlist: number;
  quarantine: number;
  rejected: number;
  newCount: number;
  highRiskFlagged: number;
  aiReviewed: number;
}

export function computeKPIs(list: EA[] = EAS): VaultKPIs {
  const by = (s: EAStatus) => list.filter((e) => e.status === s).length;
  return {
    total: list.length,
    approved: by("Approved"),
    testing: by("Testing"),
    watchlist: by("Watchlist"),
    quarantine: by("Quarantine"),
    rejected: by("Rejected"),
    newCount: by("New"),
    highRiskFlagged: list.filter(
      (e) =>
        e.riskType === "High" ||
        e.riskType === "Extreme" ||
        e.grid ||
        e.martingale,
    ).length,
    aiReviewed: list.filter((e) => e.aiReviewed).length,
  };
}

/** Static analyst profile figures shown in the sidebar (broader vault). */
export const ANALYST_PROFILE = {
  name: "Analyst",
  role: "Phase 1 · Research",
  freeEAs: 18,
  paidEAs: 12,
};

export const AI_WARNINGS: AIWarning[] = [
  {
    id: "w1",
    eaId: "grid-recovery",
    eaName: "Grid Recovery EA",
    severity: "high",
    message: "Grid + martingale with no stop loss — 45% max drawdown risk.",
    time: "2h ago",
  },
  {
    id: "w2",
    eaId: "scalper-xtreme",
    eaName: "Scalper Xtreme",
    severity: "high",
    message: "78% win rate masks a profit factor of just 1.12.",
    time: "5h ago",
  },
  {
    id: "w3",
    eaId: "martingale-master",
    eaName: "Martingale Master",
    severity: "high",
    message: "Martingale sizing with no stop loss — kept Rejected.",
    time: "1d ago",
  },
  {
    id: "w4",
    eaId: "gold-momentum",
    eaName: "Gold Momentum EA",
    severity: "medium",
    message: "High news sensitivity on XAU/USD before forward test completes.",
    time: "1d ago",
  },
  {
    id: "w5",
    eaId: "news-fade",
    eaName: "News Fade EA",
    severity: "medium",
    message: "22% drawdown with a thin 1.18 profit factor.",
    time: "2d ago",
  },
];

export const REVIEW_QUEUE: ReviewQueueItem[] = [
  {
    eaId: "scalper-xtreme",
    eaName: "Scalper Xtreme",
    reason: "High win rate, weak profit factor — confirm quarantine.",
    priority: "high",
  },
  {
    eaId: "gold-momentum",
    eaName: "Gold Momentum EA",
    reason: "News-sensitive; needs forward test before approval.",
    priority: "medium",
  },
  {
    eaId: "index-pulse",
    eaName: "Index Pulse EA",
    reason: "Newly collected — run a first review.",
    priority: "medium",
  },
  {
    eaId: "frankfurt-range",
    eaName: "Frankfurt Range Bot",
    reason: "Thin edge on watchlist — gather more data.",
    priority: "low",
  },
];

export const DEFAULT_COMPARE_IDS = [
  "london-breakout",
  "gold-momentum",
  "grid-recovery",
];

export const DEFAULT_PORTFOLIO_IDS = ["london-breakout", "trend-rider-pro"];

/* -------------------------------------------------------------------------- */
/*  Mock AI verdicts for non-EA scopes + assistant reply engine               */
/* -------------------------------------------------------------------------- */

export const VAULT_VERDICT: AIVerdict = {
  summary: "Two EAs need review before any portfolio decisions.",
  evidence: [
    "Grid Recovery EA is rejected — grid + martingale, 45% drawdown",
    "Scalper Xtreme is in quarantine — 78% win rate but PF 1.12",
    "Gold Momentum is news-sensitive and still testing",
    "Three EAs are approved with drawdowns under 11%",
  ],
  risk: "High win-rate EAs (Grid, Martingale Master, Scalper) can mask fragile risk profiles.",
  reason: "Risk-first triage keeps dangerous EAs out of the portfolio draft.",
  suggestedAction:
    "Review Scalper Xtreme first; keep Grid Recovery and Martingale Master out of the draft.",
  confidence: "High",
};

export function compareVerdict(ids: string[]): AIVerdict {
  const eas = getEAsByIds(ids);
  const safest = [...eas].sort((a, b) => b.qualityScore - a.qualityScore)[0];
  const riskiest = [...eas].sort((a, b) => a.qualityScore - b.qualityScore)[0];
  return {
    summary: safest
      ? `On a like-for-like view, ${safest.name} is the safest of the set.`
      : "Pick 2–4 EAs to compare them side by side.",
    evidence: [
      safest
        ? `${safest.name}: PF ${safest.profitFactor.toFixed(2)}, drawdown ${safest.maxDrawdown}%`
        : "Add EAs to populate the matrix",
      riskiest
        ? `${riskiest.name}: PF ${riskiest.profitFactor.toFixed(2)}, drawdown ${riskiest.maxDrawdown}%`
        : "",
      "Win rate alone would favour the riskiest EA in the set",
    ].filter(Boolean),
    risk: "Choosing on win rate alone can favour the most dangerous EA in the set.",
    reason: "Profit factor, drawdown and behaviour flags reveal what win rate hides.",
    suggestedAction: safest
      ? `Send ${safest.name} to the portfolio draft; avoid the rejected EAs.`
      : "Select EAs to compare.",
    confidence: "High",
  };
}

export function portfolioVerdict(ids: string[]): AIVerdict {
  const eas = getEAsByIds(ids);
  const hasBehaviorRisk = eas.some((e) => e.grid || e.martingale || !e.stopLoss);
  const blendedDD =
    eas.length > 0
      ? eas.reduce((s, e) => s + e.maxDrawdown, 0) / eas.length
      : 0;
  return {
    summary: hasBehaviorRisk
      ? "The draft contains an EA with unsafe behaviour — review before continuing."
      : "The current draft is conservative and within the risk rules.",
    evidence: [
      hasBehaviorRisk
        ? "At least one holding uses grid / martingale or has no stop loss"
        : "Only approved-style EAs included; no grid or martingale present",
      "All eligible holdings enforce a stop loss",
      `Blended max drawdown is approximately ${blendedDD.toFixed(1)}%`,
    ],
    risk: "EAs that share a pair or strategy can be correlated and draw down together.",
    reason: "Diversifying pairs and strategies reduces shared-shock risk.",
    suggestedAction: hasBehaviorRisk
      ? "Remove grid / martingale EAs from the draft before going further."
      : "Keep allocations balanced; avoid stacking multiple EUR/USD breakout EAs.",
    confidence: "Medium",
  };
}

export const SUGGESTED_QUESTIONS = [
  "Which Free EA is safest?",
  "Is this paid EA worth buying?",
  "Why is this risky despite high win rate?",
  "Can this EA join Portfolio Draft?",
  "Compare Sydney Swing with London Breakout Pro.",
];

/** Context-aware copy for the right AI panel, keyed by scope (route). */
export interface PanelContext {
  scope: string;
  question: string;
  summary: string;
  risk: string;
  suggestedAction: string;
  confidence: Confidence;
}

export const AI_CONTEXTS: Record<Exclude<AIScope, "EA">, PanelContext> = {
  "Vault Overview": {
    scope: "Vault Overview",
    question: "Which EA should I review first?",
    summary: "You have 30 EAs — 7 are high-risk and 6 need review.",
    risk: "High win-rate EAs can hide weak risk control.",
    suggestedAction: "Review Grid Recovery EA and News Fade EA first.",
    confidence: "High",
  },
  "Library Review": {
    scope: "Library Review",
    question: "Which EAs are risky?",
    summary:
      "Your library mixes Free and Paid EAs. Several high-win-rate EAs have weak risk control.",
    risk: "Win rate alone can disguise grid / martingale and high drawdown.",
    suggestedAction: "Filter by Quarantine and Rejected first.",
    confidence: "High",
  },
  "Free EA Safety Review": {
    scope: "Free EA Safety Review",
    question: "Which free EA is safest?",
    summary:
      "Free EAs should be checked for source-code availability, DLL / WebRequest usage, grid, martingale and stop loss.",
    risk: "A free price tag is not proof of safety.",
    suggestedAction: "Continue forward testing the open-source EAs.",
    confidence: "Medium",
  },
  "Paid EA Value Review": {
    scope: "Paid EA Value Review",
    question: "Is this paid EA worth buying?",
    summary:
      "Paid EAs must justify cost with evidence, support, updates and controlled drawdown.",
    risk: "A high price does not guarantee risk control.",
    suggestedAction: "Keep weak-evidence paid EAs on Watchlist.",
    confidence: "Medium",
  },
  "Free vs Paid Comparison": {
    scope: "Free vs Paid Comparison",
    question: "Free or paid — which is safer?",
    summary:
      "The paid EA has stronger quality; the free EA has better transparency and lower cost.",
    risk: "Choosing on price or win rate alone imports hidden risk.",
    suggestedAction: "Keep both under review before the Portfolio Draft.",
    confidence: "Medium",
  },
  "Portfolio Draft Review": {
    scope: "Portfolio Draft Review",
    question: "Is my draft safe?",
    summary:
      "Draft only — no broker connection. Check allocation, correlation, rejected EAs and quarantine warnings.",
    risk: "Rejected or quarantined EAs can import hidden risk into the draft.",
    suggestedAction: "Do not add a rejected EA without an explicit override.",
    confidence: "Medium",
  },
  "AI Workspace": {
    scope: "AI Workspace",
    question: "What can you help with?",
    summary:
      "Ask evidence-based questions about EA quality, hidden risk, paid value, free safety and portfolio readiness.",
    risk: "Analysis is mock and risk-first — not financial advice.",
    suggestedAction: "Pick a context and a suggested question to start.",
    confidence: "High",
  },
};

let replyCounter = 0;
function nextId(): string {
  replyCounter += 1;
  return `m${replyCounter}`;
}

/** Reset the message id counter (used when seeding a fresh conversation). */
export function resetMessageIds() {
  replyCounter = 0;
}

export function makeUserMessage(text: string): ChatMessage {
  return { id: nextId(), role: "user", text };
}

/**
 * Deterministic, rules-based mock of an AI reply. No network, no real model.
 * Tone: measured, skeptical, professional — rewards risk control over returns.
 */
export function getAssistantReply(
  question: string,
  ctx: { scope: string; ea?: EA },
): ChatMessage {
  const q = question.toLowerCase();
  const ea = ctx.ea;

  const verdict = (v: AIVerdict & { title?: string }): ChatMessage => ({
    id: nextId(),
    role: "assistant",
    verdict: v,
  });

  if (q.includes("review first") || q.includes("which ea should i review")) {
    return verdict({ title: "Review priority", ...VAULT_VERDICT });
  }

  if (
    q.includes("risky") ||
    q.includes("high win rate") ||
    q.includes("despite")
  ) {
    const target = ea ?? getEAById("grid-recovery")!;
    if (isWinRateMisleading(target)) {
      return verdict({
        title: `Why ${target.name} is risky`,
        ...target.aiVerdict,
      });
    }
    return verdict({
      title: `${target.name} risk read`,
      summary: `${target.name} does not show the classic high-win-rate trap.`,
      evidence: [
        `Win rate ${target.winRate}% sits alongside profit factor ${target.profitFactor.toFixed(2)}`,
        `Max drawdown is contained at ${target.maxDrawdown}%`,
        target.stopLoss ? "Stop loss is enforced" : "No stop loss in place",
      ],
      risk: "Every EA still carries market risk; conditions can change.",
      reason: "Here the win rate is backed by genuine risk control.",
      suggestedAction: "Continue testing and monitor drawdown over time.",
      confidence: "Medium",
    });
  }

  if (q.includes("portfolio") || q.includes("join")) {
    const target = ea ?? getEAById("london-breakout")!;
    const eligible =
      target.status === "Approved" &&
      !target.grid &&
      !target.martingale &&
      target.stopLoss;
    return verdict({
      title: `Portfolio fit — ${target.name}`,
      summary: eligible
        ? `${target.name} is eligible for the portfolio draft.`
        : `${target.name} should not join the portfolio draft yet.`,
      evidence: [
        `Status: ${target.status}`,
        `Profit factor ${target.profitFactor.toFixed(2)}, drawdown ${target.maxDrawdown}%`,
        target.grid || target.martingale
          ? "Uses grid / martingale — disqualifying for the draft"
          : "No grid or martingale",
        target.stopLoss ? "Stop loss enforced" : "No stop loss — disqualifying",
      ],
      risk: eligible
        ? "Watch for correlation with other EUR/USD or breakout EAs in the draft."
        : "Adding it now would import hidden risk into the draft.",
      reason:
        "The draft only accepts approved EAs with sound behaviour and a stop loss.",
      suggestedAction: eligible
        ? "Add it and keep its allocation modest while forward testing continues."
        : "Keep testing in its current status before reconsidering.",
      confidence: eligible ? "High" : "Medium",
    });
  }

  if (q.includes("compare")) {
    const target = ea ?? getEAById("grid-recovery")!;
    const approved = getEAById("london-breakout")!;
    return verdict({
      title: `${target.name} vs ${approved.name}`,
      summary: `${approved.name} shows stronger risk-adjusted quality than ${target.name}.`,
      evidence: [
        `${approved.name}: PF ${approved.profitFactor.toFixed(2)}, DD ${approved.maxDrawdown}%, score ${approved.qualityScore}`,
        `${target.name}: PF ${target.profitFactor.toFixed(2)}, DD ${target.maxDrawdown}%, score ${target.qualityScore}`,
        target.winRate > approved.winRate
          ? `${target.name} has the higher win rate, but it is not backed by profit factor`
          : `${approved.name} leads on win rate as well`,
      ],
      risk: "Comparing on win rate alone would mislead the decision.",
      reason: "Profit factor and drawdown are the deciding factors, not win rate.",
      suggestedAction: `Prefer ${approved.name} for the portfolio draft.`,
      confidence: "High",
    });
  }

  if (q.includes("quarantine")) {
    return verdict({
      title: "Quarantine candidates",
      summary: "Scalper Xtreme and News Fade should stay in quarantine.",
      evidence: [
        "Scalper Xtreme: 78% win rate but profit factor 1.12, drawdown 28.4%",
        "News Fade: profit factor 1.18 with 22% drawdown",
        "Both are highly spread- and news-sensitive",
      ],
      risk: "Promoting either now would add fragile EAs to the workflow.",
      reason: "Weak profit factor with high drawdown is a hidden-risk signature.",
      suggestedAction:
        "Keep both in Quarantine and continue demo testing with strict filters.",
      confidence: "Medium",
    });
  }

  if (q.includes("safe") || q.includes("safest")) {
    const target = getEAById("sydney-swing")!;
    return verdict({
      title: "Safest free EA",
      summary: `${target.name} is the safest free EA in the library right now.`,
      evidence: [
        "Open source with readable code — no DLL or unknown web requests",
        `Profit factor ${target.profitFactor.toFixed(2)} with drawdown ${target.maxDrawdown}%`,
        "Stop loss enforced; no grid or martingale",
      ],
      risk: "Free does not mean safe — most free EAs still need forward testing.",
      reason: "Transparency plus controlled drawdown is what makes a free EA trustworthy.",
      suggestedAction: "Keep forward testing open-source EAs before trusting capital.",
      confidence: "Medium",
    });
  }

  if (q.includes("worth") || q.includes("buy") || q.includes("paid")) {
    const target = ea && ea.sourceType === "Paid" ? ea : getEAById("london-breakout")!;
    const justified =
      target.qualityScore >= 75 && (target.forwardTestResult ?? 0) > 0;
    return verdict({
      title: `Paid value — ${target.name}`,
      summary: justified
        ? `${target.name} justifies its cost with evidence.`
        : `${target.name} does not yet justify its cost.`,
      evidence: [
        `Price ${target.price != null ? "$" + target.price : "—"}, value score ${target.valueScore}`,
        `Quality ${target.qualityScore}, profit factor ${target.profitFactor.toFixed(2)}, drawdown ${target.maxDrawdown}%`,
        `Vendor trust ${target.vendorTrust ?? "—"}, updates ${target.updates ?? "—"}`,
      ],
      risk: "A high price does not guarantee risk control or real forward results.",
      reason: "Paid is only worth it when cost is matched by proven, controlled performance.",
      suggestedAction: justified
        ? "Reasonable to keep testing; require a stop loss before any capital."
        : "Keep on Watchlist until forward-test evidence improves.",
      confidence: justified ? "High" : "Medium",
    });
  }

  // Default: scope-aware acknowledgement.
  if (ea) {
    return verdict({ title: `Analysis — ${ea.name}`, ...ea.aiVerdict });
  }
  return verdict({ title: "Vault overview", ...VAULT_VERDICT });
}

export const INTRO_MESSAGE: ChatMessage = {
  id: "intro",
  role: "assistant",
  text: "I review EAs with a risk-first lens — I weigh profit factor, drawdown and behaviour flags over headline win rate. Pick a question below or select an EA to analyse.",
};
