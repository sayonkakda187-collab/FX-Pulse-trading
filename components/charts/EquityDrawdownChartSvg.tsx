import { mapRange, pointsToPath } from "@/lib/utils";

interface EquityDrawdownChartSvgProps {
  equity: number[];
  drawdown: number[];
  /** Published max drawdown, used to scale the drawdown band. */
  maxDrawdown?: number;
  className?: string;
}

const W = 720;
const H = 260;
const PAD_X = 16;

// Equity band
const EQ_TOP = 22;
const EQ_BOTTOM = 150;
// Drawdown band
const DD_TOP = 186;
const DD_BOTTOM = 244;

export function EquityDrawdownChartSvg({
  equity,
  drawdown,
  maxDrawdown,
  className,
}: EquityDrawdownChartSvgProps) {
  if (!equity || equity.length < 2) return null;

  const eqMin = Math.min(...equity);
  const eqMax = Math.max(...equity);
  const eqPoints = equity.map((v, i) => ({
    x: mapRange(i, 0, equity.length - 1, PAD_X, W - PAD_X),
    y: mapRange(v, eqMin, eqMax, EQ_BOTTOM, EQ_TOP),
  }));
  const eqLine = pointsToPath(eqPoints);
  const eqArea = `${eqLine} L${(W - PAD_X).toFixed(2)},${EQ_BOTTOM} L${PAD_X},${EQ_BOTTOM} Z`;
  const lastEq = eqPoints[eqPoints.length - 1];

  const ddPeak = Math.max(...drawdown, maxDrawdown ?? 0, 1);
  const ddPoints = drawdown.map((v, i) => ({
    x: mapRange(i, 0, drawdown.length - 1, PAD_X, W - PAD_X),
    y: mapRange(v, 0, ddPeak, DD_TOP, DD_BOTTOM),
  }));
  const ddLine = pointsToPath(ddPoints);
  const ddArea = `${ddLine} L${(W - PAD_X).toFixed(2)},${DD_TOP} L${PAD_X},${DD_TOP} Z`;

  // Equity gridlines (quartiles)
  const eqGrid = [0, 0.5, 1].map((t) => EQ_TOP + t * (EQ_BOTTOM - EQ_TOP));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className={className}
      role="img"
      aria-label="Equity growth curve with drawdown band (illustrative mock data)"
      style={{ height: "auto" }}
    >
      {/* Equity gridlines */}
      {eqGrid.map((y, i) => (
        <line
          key={i}
          x1={PAD_X}
          x2={W - PAD_X}
          y1={y}
          y2={y}
          stroke="var(--line)"
          strokeWidth={1}
        />
      ))}

      {/* Equity area + line */}
      <path d={eqArea} fill="var(--primary)" fillOpacity={0.08} />
      <path
        d={eqLine}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.4}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={lastEq.x} cy={lastEq.y} r={3.5} fill="var(--primary)" />

      {/* Drawdown baseline */}
      <line
        x1={PAD_X}
        x2={W - PAD_X}
        y1={DD_TOP}
        y2={DD_TOP}
        stroke="var(--line)"
        strokeWidth={1}
      />
      <path d={ddArea} fill="var(--danger)" fillOpacity={0.12} />
      <path
        d={ddLine}
        fill="none"
        stroke="var(--danger)"
        strokeWidth={1.8}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Labels */}
      <text
        x={PAD_X}
        y={14}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily="var(--font-sans)"
      >
        Equity growth
      </text>
      <text
        x={PAD_X}
        y={178}
        fontSize={11}
        fontWeight={600}
        fill="var(--muted)"
        fontFamily="var(--font-sans)"
      >
        Drawdown
      </text>
      <text
        x={W - PAD_X}
        y={178}
        fontSize={11}
        fontWeight={600}
        fill="var(--danger)"
        textAnchor="end"
        fontFamily="var(--font-mono)"
      >
        peak −{ddPeak.toFixed(1)}%
      </text>
    </svg>
  );
}
