import { clamp } from "../lib/kibo";

interface ProgressBarProps {
  value: number;
  max: number;
  color: string;
  className?: string;
}

export function ProgressBar({
  value,
  max,
  color,
  className = "",
}: ProgressBarProps): React.JSX.Element {
  const pct = clamp(max > 0 ? (value / max) * 100 : 0, 0, 100);
  return (
    <div
      className={`h-1.5 w-full overflow-hidden rounded-full bg-(--progress-track) ${className}`}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
    </div>
  );
}
