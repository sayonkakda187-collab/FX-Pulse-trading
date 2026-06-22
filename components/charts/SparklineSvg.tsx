import { mapRange, pointsToPath } from "@/lib/utils";

const TONE_COLOR = {
  primary: "var(--primary)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
} as const;

interface SparklineSvgProps {
  data: number[];
  width?: number;
  height?: number;
  tone?: keyof typeof TONE_COLOR;
  strokeWidth?: number;
  area?: boolean;
  className?: string;
}

export function SparklineSvg({
  data,
  width = 120,
  height = 36,
  tone = "primary",
  strokeWidth = 2,
  area = true,
  className,
}: SparklineSvgProps) {
  if (!data || data.length < 2) {
    return null;
  }
  const min = Math.min(...data);
  const max = Math.max(...data);
  const pad = strokeWidth + 1;
  const points = data.map((v, i) => ({
    x: mapRange(i, 0, data.length - 1, pad, width - pad),
    y: mapRange(v, min, max, height - pad, pad),
  }));
  const line = pointsToPath(points);
  const color = TONE_COLOR[tone];
  const areaPath = `${line} L${(width - pad).toFixed(2)},${height} L${pad.toFixed(
    2,
  )},${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {area ? <path d={areaPath} fill={color} fillOpacity={0.1} /> : null}
      <path
        d={line}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
