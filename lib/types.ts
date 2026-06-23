// FX Pulse — Core domain types (Phase 1, mock data only)

export type Platform = "MT4" | "MT5";

export type SourceType = "Free" | "Paid";

export type TrustLevel = "Low" | "Medium" | "High";

export type EAStatus =
  | "Approved"
  | "Testing"
  | "Watchlist"
  | "Quarantine"
  | "Rejected"
  | "New";

export type RiskType = "Low" | "Normal" | "Medium" | "High" | "Extreme";

export type Sensitivity = "Low" | "Medium" | "High";

export type Confidence = "High" | "Medium" | "Low";

export interface AIVerdict {
  /** One-line plain-language summary of what is happening. */
  summary: string;
  /** Data points that support the assessment. */
  evidence: string[];
  /** What could go wrong. */
  risk: string;
  /** Why it matters. */
  reason: string;
  /** What the user should review / test / pause / avoid. */
  suggestedAction: string;
  confidence: Confidence;
}

export interface EA {
  id: string;
  name: string;
  platform: Platform;
  strategy: string;
  /** Display string for traded instruments, e.g. "EUR/USD, GBP/USD" or "Multi-pair". */
  pairs: string;
  /** Normalised list used for correlation checks. */
  pairList: string[];
  timeframe: string;
  status: EAStatus;

  /** Free (community / open) vs Paid (vendor) EA. */
  sourceType: SourceType;
  /** 0–100 — quality relative to its cost (Paid) or transparency/safety (Free). */
  valueScore: number;

  // Paid-EA commercial fields
  price?: number;
  license?: string;
  vendorTrust?: TrustLevel;
  support?: "None" | "Email" | "Priority";
  updates?: "Stale" | "Occasional" | "Active";

  // Free-EA security-review fields
  openSource?: boolean;
  codeAvailable?: boolean;
  usesDLL?: boolean;
  usesWebRequest?: boolean;
  securityVerdict?: string;

  qualityScore: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  recoveryFactor?: number;
  averageWin?: number;
  averageLoss?: number;

  riskType: RiskType;
  grid: boolean;
  martingale: boolean;
  stopLoss: boolean;
  spreadSensitive: Sensitivity;
  newsSensitive: Sensitivity;

  backtestResult?: number;
  forwardTestResult?: number;

  /** Short verdict line shown on cards. */
  aiVerdictLine?: string;
  /** Structured verdict shown in detail + AI panel. */
  aiVerdict: AIVerdict;

  /** Normalised equity curve points (account-growth index). */
  equityCurve: number[];
  /** Drawdown depth (%) at each point — positive numbers, plotted downward. */
  drawdownCurve: number[];
  /** Tiny trend used by sparklines. */
  sparkline: number[];

  /** When the EA entered the vault (ISO date string). */
  addedOn: string;
  /** Whether the AI assistant has produced a review for this EA. */
  aiReviewed: boolean;
  notes?: string;
}

export interface ScoreComponent {
  key: string;
  label: string;
  /** 0–100 sub-score for this dimension. */
  score: number;
  /** 0–1 weight in the blended model. */
  weight: number;
  /** Short explanation of how the sub-score was derived. */
  note: string;
}

export interface ScoreBreakdown {
  /** Weighted model estimate (0–100). */
  modelEstimate: number;
  components: ScoreComponent[];
}

export interface AIWarning {
  id: string;
  eaId: string;
  eaName: string;
  severity: "high" | "medium" | "low";
  message: string;
  time: string;
}

export interface ReviewQueueItem {
  eaId: string;
  eaName: string;
  reason: string;
  priority: "high" | "medium" | "low";
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  text?: string;
  verdict?: AIVerdict & { title?: string };
}

export type AIScope =
  | "Vault Overview"
  | "Library Review"
  | "Free EA Safety Review"
  | "Paid EA Value Review"
  | "Free vs Paid Comparison"
  | "Portfolio Draft Review"
  | "AI Workspace"
  | "EA";
