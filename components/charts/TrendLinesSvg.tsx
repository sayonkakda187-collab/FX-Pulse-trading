import { mapRange, pointsToPath } from "@/lib/utils";

const TONE_COLOR = {
  primary: "var(--primary)",
  danger: "var(--danger)",
  success: "var(--success)",
  blue: "var(--blue)",
} as const;

export interface TrendSeries {
  data: number[];
  tone: keyof typeof TONE_COLOR;
}

interface TrendLinesSvgProps {
  series: TrendSeries[];
  labels?: string[];
  className?: string;
}

const W = 640;
const H = 240;
const PAD_X = 8;
const TOP = 12;
const BOTTOM = 200;

/** Lightweight multi-line chart (0–100 scale) — no charting library. */
export function TrendLinesSvg({ series, labels, className }: TrendLinesSvgProps) {
  const n = Math.max(...series.map((s) => s.data.length), 2);
  const gridY = [0, 25, 50, 75, 100].map((v) => ({
    v,
    y: mapRange(v, 0, 100, BOTTOM, TOP),
  }));

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width="100%"
      className={className}
      role="img"
      aria-label="Average quality and risk score trend (illustrative mock data)"
      style={{ height: "auto" }}
    >
      {gridY.map((g) => (
        <g key={g.v}>
          <line
            x1={PAD_X + 22}
            x2={W - PAD_X}
            y1={g.y}
            y2={g.y}
            stroke="var(--line)"
            strokeWidth={1}
          />
          <text
            x={PAD_X}
            y={g.y + 3.5}
            fontSize={10}
            fill="var(--faint)"
            fontFamily="var(--font-mono)"
          >
            {g.v}
          </text>
        </g>
      ))}

      {series.map((s, si) => {
        const color = TONE_COLOR[s.tone];
        const pts = s.data.map((v, i) => ({
          x: mapRange(i, 0, n - 1, PAD_X + 28, W - PAD_X),
          y: mapRange(v, 0, 100, BOTTOM, TOP),
        }));
        return (
          <g key={si}>
            <path
              d={pointsToPath(pts)}
              fill="none"
              stroke={color}
              strokeWidth={2.4}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={3} fill={color} />
            ))}
          </g>
        );
      })}

      {labels
        ? labels.map((lab, i) => (
            <text
              key={lab}
              x={mapRange(i, 0, labels.length - 1, PAD_X + 28, W - PAD_X)}
              y={H - 6}
              fontSize={10}
              fill="var(--faint)"
              textAnchor={i === 0 ? "start" : i === labels.length - 1 ? "end" : "middle"}
              fontFamily="var(--font-sans)"
            >
              {lab}
            </text>
          ))
        : null}
    </svg>
  );
}
