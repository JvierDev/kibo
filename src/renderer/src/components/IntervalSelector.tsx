import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export const INTERVAL_PRESETS = [
  5, 10, 15, 20, 25, 30, 45, 60, 90, 120, 180, 240,
];

interface IntervalSelectorProps {
  value: number;
  onChange: (minutes: number) => void;
  min?: number;
  max?: number;
  label?: string;
}

export function IntervalSelector({
  value,
  onChange,
  min = 5,
  max = 240,
  label = "Every",
}: IntervalSelectorProps): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent): void => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const options = INTERVAL_PRESETS.filter((v) => v >= min && v <= max);
  if (!options.includes(value)) options.push(value);
  options.sort((a, b) => a - b);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label} ${value} minutes`}
        className={`btn-focus inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
          open
            ? "border-(--accent-cyan) bg-[rgba(32,213,221,0.12)] text-(--text-primary)"
            : "border-(--border) bg-(--surface) text-(--text-secondary) hover:border-(--border-strong) hover:text-(--text-primary)"
        }`}
      >
        <span className="text-(--text-muted)">{label}</span>
        <span className="text-(--text-primary)">{value} min</span>
        <ChevronDown
          size={14}
          className={`text-(--text-muted) transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="anim-fade absolute right-0 z-50 mt-2 max-h-56 w-40 overflow-y-auto rounded-xl border border-(--border) bg-(--bg-secondary) p-1 shadow-(--shadow-soft)"
        >
          {options.map((opt) => {
            const active = opt === value;
            return (
              <button
                key={opt}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`btn-focus flex w-full items-center justify-between rounded-lg px-3 py-1.5 text-left text-sm transition ${
                  active
                    ? "bg-(--accent-cyan) font-semibold text-(--bg-primary)"
                    : "text-(--text-secondary) hover:bg-(--surface-hover) hover:text-(--text-primary)"
                }`}
              >
                {opt} min
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
