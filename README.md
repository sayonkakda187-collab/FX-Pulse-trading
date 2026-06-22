# FX Pulse — EA Intelligence Workspace (Phase 1)

FX Pulse is a **risk-first workspace for collecting, evaluating, comparing and
reviewing Expert Advisors (EAs)** — MT4/MT5 automated trading robots — with help
from an AI Assistant panel.

It is **not** a trading terminal and **not** a live trading app. Phase 1 is a
research and decision-support sandbox:

> Collect EAs → evaluate quality → detect hidden risk → compare with evidence →
> ask the AI before deciding → prepare safe EAs for a future portfolio draft.

### Core product principle

**Win rate is never shown alone.** It always appears next to **Profit Factor**
and **Max Drawdown**, because a high win rate can hide serious risk. The flagship
example, _Grid Recovery EA_, has a **92% win rate** yet is **Rejected** — because
profit factor is only 1.05, max drawdown is 45%, and it uses grid + martingale
with no stop loss.

---

## Getting started

```bash
npm install      # install dependencies
npm run dev      # start the dev server at http://localhost:3000
```

Production build / preview:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # ESLint (next/core-web-vitals + next/typescript)
```

> The app uses `next/font/google` (Plus Jakarta Sans + IBM Plex Mono), so the
> build fetches fonts once. No other network access is required.

---

## Main routes

| Route          | Page             | Purpose                                                        |
| -------------- | ---------------- | -------------------------------------------------------------- |
| `/`            | Dashboard        | EA vault overview — KPIs, best/riskiest spotlights, warnings, review queue |
| `/library`     | EA Library       | Search, status tabs, filter chips, card/table views            |
| `/ea/[id]`     | EA Detail        | Score breakdown, equity/drawdown chart, risk detection, AI verdict |
| `/compare`     | Compare EAs      | Side-by-side matrix (2–4 EAs) with best/worst highlighting      |
| `/portfolio`   | Portfolio Draft  | Allocation sandbox, risk rules, blended risk, override UI       |
| `/assistant`   | AI Assistant     | Full mock conversation with structured, risk-first responses    |
| `/reports`     | Reports          | Saved reviews, review sheets, export placeholders               |
| `/settings`    | Settings         | Scoring weights, risk thresholds, appearance, AI preferences    |

A **persistent, context-aware AI Assistant panel** lives on the right of the
workspace on desktop (and as a drawer on smaller screens). Its scope follows what
you are doing: _Vault Overview_, _Analyzing: [EA]_, _Comparing selected EAs_, or
_Portfolio Draft Review_.

---

## What is mocked

Everything is **mock data** held in React state — there is no backend.

- **EA data** (`lib/mockData.ts`) — 12 realistic EAs incl. the 6 specified ones.
- **Equity / drawdown curves** — generated deterministically from a seeded RNG,
  so server and client render identically (no hydration mismatch).
- **Quality Score reasoning** (`lib/scoring.ts`) — a deterministic, risk-first
  model that decomposes each score into weighted factors (profitability, risk
  control, behaviour safety, win-rate consistency, robustness).
- **AI Assistant** — a rules-based mock. Structured verdicts (Summary, Evidence,
  Risk, Reason, Suggested Action, Confidence, Disclaimer). No real AI/API calls.
- **KPIs, warnings, review queue, compare/portfolio defaults** — all mock.
- **Charts** — hand-built lightweight SVG (sparkline, equity/drawdown, donut). No
  charting library.

Shared state lives in `context/FXPulseContext.tsx` (selected EA, compare set,
portfolio draft + allocations, AI panel open/scope, conversation, search).
**No persistence** — no localStorage/sessionStorage/database.

---

## Intentionally NOT implemented in Phase 1

- No broker connection, no MT4/MT5 integration, no live market data.
- No trade execution / order placement.
- No real AI integration or real APIs.
- No candlestick / live trading dashboards.
- No data persistence between reloads.
- Buttons that belong to later phases (Add EA, exports, status change, save
  settings, themes) show a friendly “coming in a later phase” notice.

This is **analysis only — not financial advice.**

---

## Tech & structure

Next.js 15 (App Router) · TypeScript · Tailwind CSS · React Context. Design
tokens are CSS variables in `app/globals.css`.

```
app/            routes (layout, globals.css, dashboard + 7 pages)
components/
  shell/        AppShell, Sidebar, TopBar, AIAssistantPanel, PageScope
  ui/           Card, Button, Badge, MetricCard, EmptyState, icons
  ea/           QualityScoreRing, StatusBadge, RiskBadge, BehaviorFlags,
                WinRateReality, EACard, EATable, EADetailHeader,
                ScoreBreakdown, RiskDetectionPanel, AIVerdictCard
  compare/      CompareMatrix
  portfolio/    PortfolioDraft, AllocationDonut
  charts/       SparklineSvg, EquityDrawdownChartSvg
lib/            mockData.ts, scoring.ts, utils.ts, types.ts
context/        FXPulseContext.tsx
```
