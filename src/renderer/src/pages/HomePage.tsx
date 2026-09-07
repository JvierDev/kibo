import { Flame, Pause, Play, ChevronRight, Clock } from "lucide-react";
import { KiboMascot } from "../components/KiboMascot";
import { Toggle } from "../components/Toggle";
import { ProgressBar } from "../components/ProgressBar";
import { IntervalSelector } from "../components/IntervalSelector";
import { useKiboState } from "../lib/kibo";
import { HABITS, HABIT_GOAL } from "../lib/habits";
import type { ReminderId } from "../../../shared/types";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function HabitStatCard({
  id,
  label,
  icon: Icon,
  color,
  count,
}: {
  id: ReminderId;
  label: string;
  icon: typeof import("lucide-react").Droplets;
  color: string;
  count: number;
}): React.JSX.Element {
  return (
    <div className="glass-card card-hover flex flex-col gap-2.5 p-4">
      <div className="flex items-center justify-between">
        <span
          className="flex h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${color}1f`, color }}
        >
          <Icon size={18} />
        </span>
        <span className="text-2xl font-bold text-(--text-primary)">
          {count}
        </span>
      </div>
      <div>
        <div className="text-sm font-semibold text-(--text-primary)">
          {label}
        </div>
        <div className="text-[11px] text-(--text-muted)">
          / {HABIT_GOAL} goal
        </div>
      </div>
      <ProgressBar value={count} max={HABIT_GOAL} color={color} />
    </div>
  );
}

export function HomePage(): React.JSX.Element {
  const state = useKiboState();

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center text-(--text-muted)">
        Loading…
      </div>
    );
  }

  const { settings, today, streak, nextReminder } = state;

  const setReminder = (
    id: ReminderId,
    patch: Partial<{ enabled: boolean; interval: number }>,
  ): void => {
    void window.kibo.setReminder(id, patch);
  };

  // While paused there is effectively no upcoming reminder to show.
  const next = settings.paused ? null : nextReminder;

  // Approximate time spent working from the upcoming reminder timer.
  let workingLabel: string | null = null;
  if (next) {
    const cfg = settings.reminders[next.id];
    const elapsed = cfg.interval * 60 - next.secondsRemaining;
    if (elapsed > 0)
      workingLabel = `${Math.max(1, Math.round(elapsed / 60))} min`;
  }

  const nextMinutes = next
    ? Math.max(1, Math.ceil(next.secondsRemaining / 60))
    : null;

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
      {/* Hero */}
      <section className="glass-card anim-rise relative overflow-hidden p-6">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 140% at 100% 0%, rgba(32,213,221,0.12) 0%, transparent 55%), radial-gradient(120% 140% at 0% 100%, rgba(255,111,89,0.08) 0%, transparent 50%)",
          }}
        />

        {/* Top row: greeting + streak + pause */}
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-(--text-secondary)">
              {greeting()}
            </p>
            <h1 className="mt-1 text-[28px] font-bold leading-tight tracking-tight text-(--text-primary)">
              Small breaks.
              <br />A{" "}
              <span className="text-(--accent-cyan)">
                healthier, happier
              </span>{" "}
              you.
            </h1>
          </div>
          <div className="pointer-events-none relative h-40 w-40 shrink-0">
            <KiboMascot
              state={settings.paused ? "sleep" : "happy"}
              className="h-full w-full"
            />
            <div className="absolute inset-x-6 bottom-0 h-3 rounded-full bg-black/40 blur-md" />
          </div>
          <div className="flex shrink-0 flex-col items-end gap-2">
            {streak > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,135,72,0.3)] bg-[rgba(255,135,72,0.14)] px-3 py-1.5 text-sm font-medium text-(--accent-orange)">
                <Flame size={15} className="fill-current" />
                {streak}-day streak
              </span>
            )}
            <button
              type="button"
              onClick={() => void window.kibo.setPaused(!settings.paused)}
              aria-pressed={settings.paused}
              className={`btn-focus inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                settings.paused
                  ? "border-[rgba(255,135,72,0.4)] bg-[rgba(255,135,72,0.16)] text-(--accent-orange) hover:bg-[rgba(255,135,72,0.26)]"
                  : "border-(--border) bg-(--surface) text-(--text-secondary) hover:bg-(--surface-hover)"
              }`}
            >
              {settings.paused ? <Play size={14} /> : <Pause size={14} />}
              {settings.paused ? "Resume" : "Pause"} reminders
            </button>
          </div>
        </div>

        {/* Bottom row: subtitle */}
        <div className="relative mt-4 flex items-end justify-between gap-4">
          <p className="max-w-[46%] text-sm leading-relaxed text-(--text-muted)">
            Stay hydrated, move a little, feel a lot better.
          </p>
        </div>
      </section>

      {/* Today + Next reminder */}
      <section
        className="anim-rise flex flex-wrap gap-5"
        style={{ animationDelay: "0.05s" }}
      >
        <div className="grid min-w-95 flex-1 grid-cols-3 gap-5">
          {HABITS.map((habit) => (
            <HabitStatCard
              key={habit.id}
              id={habit.id}
              label={habit.label}
              icon={habit.icon}
              color={habit.color}
              count={today[habit.id] ?? 0}
            />
          ))}
        </div>

        {/* Next reminder */}
        <div className="glass-card card-hover flex min-w-67.5 flex-1 flex-col justify-between gap-4 p-5">
          <div className="flex items-center gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-(--surface) text-(--accent-cyan)">
              <Clock size={20} />
            </span>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-widest text-(--text-muted)">
                Next reminder
              </div>
              {next ? (
                <div className="mt-0.5 text-lg font-semibold text-(--text-primary)">
                  {next.id.charAt(0).toUpperCase() + next.id.slice(1)}{" "}
                  <span className="text-(--accent-cyan)">
                    in {nextMinutes} min
                  </span>
                </div>
              ) : (
                <div className="mt-0.5 text-lg font-semibold text-(--text-primary)">
                  All caught up
                </div>
              )}
            </div>
          </div>
          <div>
            {next ? (
              <p className="text-xs leading-relaxed text-(--text-muted)">
                {workingLabel
                  ? `You've been working for ${workingLabel}. A short break can boost your focus and energy.`
                  : "A little moment for yourself is coming up."}
              </p>
            ) : (
              <p className="text-xs leading-relaxed text-(--text-muted)">
                {settings.paused
                  ? "Reminders are paused."
                  : "Nothing scheduled right now — enjoy the calm."}
              </p>
            )}
            <div className="mt-3 flex items-center justify-end">
              <ChevronRight size={16} className="text-(--text-muted)" />
            </div>
          </div>
        </div>
      </section>

      {/* My Routine */}
      <section className="anim-rise" style={{ animationDelay: "0.1s" }}>
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="section-label">My routine</h2>
        </div>

        <div className="glass-card divide-y divide-(--border)">
          {HABITS.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between gap-3 p-4"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                  style={{
                    backgroundColor: `${habit.color}1f`,
                    color: habit.color,
                  }}
                >
                  <habit.icon size={17} />
                </span>
                <div>
                  <div className="text-sm font-semibold text-(--text-primary)">
                    {habit.label}
                  </div>
                  <div className="text-xs text-(--text-muted)">
                    {habit.description}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <IntervalSelector
                  value={settings.reminders[habit.id].interval}
                  onChange={(interval) => setReminder(habit.id, { interval })}
                  label="Every"
                />
                <Toggle
                  checked={settings.reminders[habit.id].enabled}
                  label={`Enable ${habit.label} reminders`}
                  onChange={(enabled) => setReminder(habit.id, { enabled })}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Motivational footer */}
      <footer
        className="glass-card anim-rise flex items-center justify-between gap-3 px-5 py-3"
        style={{ animationDelay: "0.15s" }}
      >
        <p className="text-sm text-(--text-secondary)">
          ✨ A few minutes for you, a lot of benefits for tomorrow.
        </p>
        <span className="shrink-0 text-xs font-medium text-(--accent-coral)">
          Kibo ♥︎
        </span>
      </footer>
    </div>
  );
}
