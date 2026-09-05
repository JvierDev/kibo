import { useState } from "react";
import { Robot } from "../components/Robot";
import { clamp, useKiboState } from "../lib/kibo";
import { REMINDER_LABELS } from "../../../shared/types";
import type { ReminderId } from "../../../shared/types";

const REMINDER_IDS: ReminderId[] = ["water", "stretch", "walk"];
const REMINDER_EMOJI: Record<ReminderId, string> = {
  water: "💧",
  stretch: "🙆",
  walk: "🚶",
};
const WEEK_COLORS: Record<ReminderId, string> = {
  water: "bg-sky-400",
  stretch: "bg-emerald-400",
  walk: "bg-amber-400",
};
const WEEK_TARGET = 8;

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? "bg-sky-500" : "bg-slate-600"
      }`}
    >
      <span
        className={`block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

function Stepper({
  value,
  onChange,
  min,
  max,
  step,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
}) {
  const update = (v: number): void => onChange(clamp(v, min, max));
  return (
    <div className="flex items-center gap-1.5">
      <button
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-slate-200 transition hover:bg-slate-600"
        onClick={() => update(value - step)}
      >
        −
      </button>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={(e) => update(Number(e.target.value) || min)}
        className="w-14 rounded-lg bg-slate-800 px-1 py-1 text-center text-sm text-white outline-none focus:ring-2 focus:ring-sky-500"
      />
      <button
        className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-slate-200 transition hover:bg-slate-600"
        onClick={() => update(value + step)}
      >
        +
      </button>
      <span className="ml-1 text-xs text-slate-400">min</span>
    </div>
  );
}

export function Dashboard(): React.JSX.Element {
  const state = useKiboState();
  const [autoStartBusy, setAutoStartBusy] = useState(false);

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-950 text-slate-400">
        Loading…
      </div>
    );
  }

  const { settings, today, week, streak, nextReminder, activeReminder } = state;

  const setReminder = (
    id: ReminderId,
    patch: Partial<{ enabled: boolean; interval: number }>,
  ): void => {
    void window.kibo.setReminder(id, patch);
  };

  const nextLabel = nextReminder
    ? `${REMINDER_LABELS[nextReminder.id]} · ${Math.max(1, Math.ceil(nextReminder.secondsRemaining / 60))} min`
    : null;

  const toggleAutoStart = async (enabled: boolean): Promise<void> => {
    setAutoStartBusy(true);
    await window.kibo.setAutoStart(enabled);
    setAutoStartBusy(false);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-950 text-slate-100">
      <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-11">
            <Robot />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Kibo</h1>
            <p className="text-xs text-slate-400">
              Your healthy-work companion
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="rounded-full bg-orange-500/15 px-3 py-1.5 text-sm font-medium text-orange-300">
              🔥 {streak}-day streak
            </span>
          )}
          <button
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              settings.paused
                ? "bg-amber-500/15 text-amber-300 hover:bg-amber-500/25"
                : "bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
            }`}
            onClick={() => void window.kibo.setPaused(!settings.paused)}
          >
            {settings.paused ? "▶ Resume reminders" : "⏸ Pause reminders"}
          </button>
        </div>
      </header>

      <main className="flex-1 space-y-6 px-6 py-5">
        {activeReminder && (
          <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm text-sky-200">
            A {REMINDER_LABELS[activeReminder].toLowerCase()} reminder is
            waiting — check the mascot.
          </div>
        )}

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              My routine
            </h2>
            <span className="text-xs text-slate-500">
              {settings.paused
                ? "Paused"
                : nextLabel
                  ? `Next: ${nextLabel}`
                  : "All caught up"}
            </span>
          </div>
          <div className="space-y-3">
            {REMINDER_IDS.map((id) => (
              <div
                key={id}
                className={`flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3 transition ${
                  settings.reminders[id].enabled ? "" : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{REMINDER_EMOJI[id]}</span>
                  <span className="font-medium">{REMINDER_LABELS[id]}</span>
                </div>
                <div className="flex items-center gap-4">
                  <Stepper
                    value={settings.reminders[id].interval}
                    onChange={(interval) => setReminder(id, { interval })}
                    min={5}
                    max={240}
                    step={5}
                  />
                  <Toggle
                    checked={settings.reminders[id].enabled}
                    onChange={(enabled) => setReminder(id, { enabled })}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Today
            </h2>
            <div className="space-y-3">
              {REMINDER_IDS.map((id) => {
                const count = today[id] ?? 0;
                const pct = clamp(count / 8, 0, 1) * 100;
                return (
                  <div key={id}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-slate-300">
                        {REMINDER_LABELS[id]}
                      </span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-sky-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">
              Snooze
            </h2>
            <Stepper
              value={settings.snoozeMinutes}
              onChange={(minutes) => void window.kibo.setSnoozeMinutes(minutes)}
              min={1}
              max={30}
              step={1}
            />
          </div>
        </section>

        <section>
          <div className="mb-2 flex items-baseline justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
              This week
            </h2>
            <span className="text-xs text-slate-500">per-day completions</span>
          </div>
          <div className="flex items-end gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-4">
            {week.map((entry) => {
              const dayShort = new Date(
                `${entry.day}T00:00:00`,
              ).toLocaleDateString(undefined, { weekday: "short" });
              const total = REMINDER_IDS.reduce(
                (sum, id) => sum + (entry.counts[id] ?? 0),
                0,
              );
              return (
                <div
                  key={entry.day}
                  className="flex flex-1 flex-col items-center gap-1.5"
                >
                  <span className="text-xs font-medium text-slate-300">
                    {total}
                  </span>
                  <div className="flex h-24 w-full max-w-9 flex-col justify-end overflow-hidden rounded-lg bg-slate-800/60">
                    {REMINDER_IDS.map((id) => {
                      const count = entry.counts[id] ?? 0;
                      const pct = Math.min(count, WEEK_TARGET) / WEEK_TARGET;
                      return (
                        <div
                          key={id}
                          className={`${WEEK_COLORS[id]} ${count ? "" : "opacity-0"}`}
                          style={{ height: `${pct * 100}%` }}
                          title={`${REMINDER_LABELS[id]}: ${count}`}
                        />
                      );
                    })}
                  </div>
                  <span
                    className={`text-[10px] ${entry.day === week[week.length - 1].day ? "font-semibold text-sky-300" : "text-slate-500"}`}
                  >
                    {dayShort}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      <footer className="flex items-center justify-between border-t border-slate-800 px-6 py-3">
        <label className="flex items-center gap-3 text-sm text-slate-300">
          <Toggle
            checked={settings.autoStart}
            onChange={(v) => void toggleAutoStart(v)}
          />
          <span className={autoStartBusy ? "text-slate-500" : ""}>
            Launch Kibo at login
          </span>
        </label>
        <button
          className="rounded-xl px-4 py-2 text-sm font-medium text-slate-400 transition hover:bg-slate-800 hover:text-slate-200"
          onClick={() => void window.kibo.quit()}
        >
          Quit
        </button>
      </footer>
    </div>
  );
}
