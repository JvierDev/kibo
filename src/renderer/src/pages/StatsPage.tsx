import {
  Activity,
  Droplets,
  PersonStanding,
  Footprints,
  Flame,
} from "lucide-react";
import { useKiboState } from "../lib/kibo";
import { HABITS, HABIT_GOAL } from "../lib/habits";
import { ProgressBar } from "../components/ProgressBar";
import type { ReminderId } from "../../../shared/types";

const WEEK_COLORS: Record<ReminderId, string> = {
  water: "var(--accent-cyan)",
  stretch: "var(--accent-coral)",
  walk: "var(--accent-teal)",
};

export function StatsPage(): React.JSX.Element {
  const state = useKiboState();

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center text-(--text-muted)">
        Loading…
      </div>
    );
  }

  const { today, week, streak } = state;

  const totalToday = HABITS.reduce((sum, h) => sum + (today[h.id] ?? 0), 0);
  const summary = [
    {
      label: "Total breaks",
      value: totalToday,
      icon: Activity,
      color: "var(--text-primary)",
    },
    {
      label: "Water completed",
      value: today.water ?? 0,
      icon: Droplets,
      color: "var(--accent-cyan)",
    },
    {
      label: "Stretch breaks",
      value: today.stretch ?? 0,
      icon: PersonStanding,
      color: "var(--accent-coral)",
    },
    {
      label: "Walk breaks",
      value: today.walk ?? 0,
      icon: Footprints,
      color: "var(--accent-teal)",
    },
    {
      label: "Current streak",
      value: streak,
      icon: Flame,
      color: "var(--accent-orange)",
    },
  ];

  const maxDayTotal = Math.max(
    1,
    ...week.map((entry) =>
      HABITS.reduce((sum, h) => sum + (entry.counts[h.id] ?? 0), 0),
    ),
  );

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
      {/* Today progress */}
      <section className="anim-rise">
        <h2 className="section-label mb-2">Today</h2>
        <div className="glass-card space-y-4 p-5">
          {HABITS.map((habit) => {
            const count = today[habit.id] ?? 0;
            return (
              <div key={habit.id} className="flex items-center gap-3">
                <span
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                  style={{
                    backgroundColor: `${habit.color}1f`,
                    color: habit.color,
                  }}
                >
                  <habit.icon size={15} />
                </span>
                <div className="flex-1">
                  <div className="mb-1 flex items-baseline justify-between">
                    <span className="text-sm font-medium text-(--text-primary)">
                      {habit.label}
                    </span>
                    <span className="text-xs text-(--text-muted)">
                      {count} / {HABIT_GOAL}
                    </span>
                  </div>
                  <ProgressBar
                    value={count}
                    max={HABIT_GOAL}
                    color={habit.color}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* This week chart */}
      <section className="anim-rise" style={{ animationDelay: "0.05s" }}>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="section-label">This week</h2>
          <span className="text-[11px] text-(--text-muted)">
            per-day completions
          </span>
        </div>
        <div className="glass-card p-5">
          <div className="flex items-end gap-2">
            {week.map((entry) => {
              const dayShort = new Date(
                `${entry.day}T00:00:00`,
              ).toLocaleDateString(undefined, { weekday: "short" });
              const total = HABITS.reduce(
                (sum, h) => sum + (entry.counts[h.id] ?? 0),
                0,
              );
              const isToday = entry.day === week[week.length - 1].day;
              return (
                <div
                  key={entry.day}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span
                    className={`text-[11px] font-medium ${
                      total > 0
                        ? "text-(--text-secondary)"
                        : "text-(--text-muted)"
                    }`}
                  >
                    {total}
                  </span>
                  <div className="flex h-28 w-full items-end justify-center gap-0.5 rounded-lg bg-(--progress-track) p-1">
                    {HABITS.map((h) => {
                      const count = entry.counts[h.id] ?? 0;
                      const height =
                        count > 0 ? Math.round((count / maxDayTotal) * 100) : 0;
                      if (height === 0) return null;
                      return (
                        <div
                          key={h.id}
                          title={`${h.label}: ${count}`}
                          className="w-2 rounded-sm"
                          style={{
                            height: `${height}%`,
                            backgroundColor: WEEK_COLORS[h.id],
                          }}
                        />
                      );
                    })}
                  </div>
                  <span
                    className={`text-[10px] ${
                      isToday
                        ? "font-semibold text-(--accent-cyan)"
                        : "text-(--text-muted)"
                    }`}
                  >
                    {dayShort}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-4 border-t border-(--border) pt-3">
            {HABITS.map((h) => (
              <span
                key={h.id}
                className="inline-flex items-center gap-1.5 text-[11px] text-(--text-muted)"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: WEEK_COLORS[h.id] }}
                />
                {h.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Summary cards */}
      <section
        className="anim-rise grid grid-cols-2 gap-3 md:grid-cols-5"
        style={{ animationDelay: "0.1s" }}
      >
        {summary.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass-card card-hover p-4">
            <span
              className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${color}1f`, color }}
            >
              <Icon size={15} />
            </span>
            <div className="text-2xl font-bold text-(--text-primary)">
              {value}
            </div>
            <div className="text-[11px] leading-tight text-(--text-muted)">
              {label}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
