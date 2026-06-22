export const ALLOCATION_COLORS = [
  "#6c5cff",
  "#3b82f6",
  "#14b8a6",
  "#8b5cf6",
  "#0ea5e9",
  "#a78bfa",
];

export interface DonutSegment {
  id: string;
  label: string;
  value: number;
  color?: string;
}

interface AllocationDonutProps {
  segments: DonutSegment[];
  size?: number;
  stroke?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function AllocationDonut({
  segments,
  size = 184,
  stroke = 24,
  centerLabel,
  centerValue,
}: AllocationDonutProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const gap = total > 0 ? 2 : 0;

  let acc = 0;

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--line)"
          strokeWidth={stroke}
        />
        {total > 0 &&
          segments.map((seg, i) => {
            const frac = seg.value / total;
            const len = Math.max(0, frac * c - gap);
            const dash = `${len} ${c - len}`;
            const offset = -acc * c + gap / 2;
            acc += frac;
            return (
              <circle
                key={seg.id}
                cx={size / 2}
                cy={size / 2}
                r={r}
                fill="none"
                stroke={seg.color ?? ALLOCATION_COLORS[i % ALLOCATION_COLORS.length]}
                strokeWidth={stroke}
                strokeDasharray={dash}
                strokeDashoffset={offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
          })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {centerValue ? (
          <span className="num text-2xl font-semibold text-ink">{centerValue}</span>
        ) : null}
        {centerLabel ? (
          <span className="text-[11px] font-medium uppercase tracking-wide text-faint">
            {centerLabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
