import { clamp, scoreTone } from "@/lib/utils";

const TONE_COLOR = {
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
} as const;

interface QualityScoreRingProps {
  score: number;
  size?: number;
  stroke?: number;
  /** Show the "/100" denominator under the score. */
  showOutOf?: boolean;
  /** Caption rendered below the ring (e.g. "Quality Score"). */
  caption?: string;
}

export function QualityScoreRing({
  score,
  size = 72,
  stroke,
  showOutOf = false,
  caption,
}: QualityScoreRingProps) {
  const tone = scoreTone(score);
  const color = TONE_COLOR[tone];
  const sw = stroke ?? Math.max(5, Math.round(size * 0.1));
  const r = (size - sw) / 2;
  const circumference = 2 * Math.PI * r;
  const pct = clamp(score, 0, 100) / 100;
  const offset = circumference * (1 - pct);
  const scoreFont = Math.round(size * (showOutOf ? 0.3 : 0.34));

  return (
    <figure className="inline-flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-label={`Quality score ${score} out of 100`}
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="var(--line)"
            strokeWidth={sw}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="num font-semibold leading-none"
            style={{ fontSize: scoreFont, color }}
          >
            {Math.round(score)}
          </span>
          {showOutOf ? (
            <span
              className="num leading-none text-faint"
              style={{ fontSize: Math.round(size * 0.13), marginTop: 2 }}
            >
              /100
            </span>
          ) : null}
        </div>
      </div>
      {caption ? (
        <figcaption className="text-[11px] font-medium uppercase tracking-wide text-faint">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
