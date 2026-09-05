import { useState } from "react";
import { Bell, Clock, Power, Timer, Minus, Plus } from "lucide-react";
import { useKiboState, clamp } from "../lib/kibo";
import { Toggle } from "../components/Toggle";
import { IntervalSelector } from "../components/IntervalSelector";
import { HABITS } from "../lib/habits";
import type { ReminderId } from "../../../shared/types";

function Stepper({
  value,
  onChange,
  min,
  max,
  step = 1,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
}): React.JSX.Element {
  const update = (v: number): void => onChange(clamp(v, min, max));
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label="Decrease"
        className="btn-focus flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--text-secondary) transition hover:bg-(--surface-hover) hover:text-(--text-primary)"
        onClick={() => update(value - step)}
      >
        <Minus size={14} />
      </button>
      <div className="min-w-20 rounded-lg border border-(--border) bg-(--surface) px-3 py-1.5 text-center text-sm font-semibold text-(--text-primary)">
        {value} min
      </div>
      <button
        type="button"
        aria-label="Increase"
        className="btn-focus flex h-8 w-8 items-center justify-center rounded-lg border border-(--border) bg-(--surface) text-(--text-secondary) transition hover:bg-(--surface-hover) hover:text-(--text-primary)"
        onClick={() => update(value + step)}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Bell;
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="anim-rise glass-card p-5">
      <div className="mb-4 flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-(--surface) text-(--accent-cyan)">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-semibold text-(--text-primary)">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function SettingsPage(): React.JSX.Element {
  const state = useKiboState();
  const [autoStartBusy, setAutoStartBusy] = useState(false);

  if (!state) {
    return (
      <div className="flex h-full items-center justify-center text-(--text-muted)">
        Loading…
      </div>
    );
  }

  const { settings } = state;

  const setReminder = (
    id: ReminderId,
    patch: Partial<{ enabled: boolean; interval: number }>,
  ): void => {
    void window.kibo.setReminder(id, patch);
  };

  const toggleAutoStart = async (enabled: boolean): Promise<void> => {
    setAutoStartBusy(true);
    await window.kibo.setAutoStart(enabled);
    setAutoStartBusy(false);
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-6">
      {/* Reminder intervals */}
      <Section icon={Bell} title="Reminder intervals">
        <div className="space-y-3">
          {HABITS.map((habit) => (
            <div
              key={habit.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-(--border) bg-(--surface) p-3"
            >
              <div>
                <div className="text-sm font-medium text-(--text-primary)">
                  {habit.label}
                </div>
                <div className="text-[11px] text-(--text-muted)">
                  {settings.reminders[habit.id].enabled
                    ? "Enabled"
                    : "Disabled"}
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
                  label={`Enable ${habit.label}`}
                  onChange={(enabled) => setReminder(habit.id, { enabled })}
                />
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* Reminder settings */}
      <Section icon={Timer} title="Reminder settings">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-(--text-primary)">
              Default snooze
            </div>
            <div className="text-[11px] text-(--text-muted)">
              How long to wait before reminding you again.
            </div>
          </div>
          <Stepper
            value={settings.snoozeMinutes}
            onChange={(minutes) => void window.kibo.setSnoozeMinutes(minutes)}
            min={1}
            max={30}
          />
        </div>
      </Section>

      {/* Launch at login */}
      <Section icon={Power} title="Startup">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-(--text-primary)">
              Launch Kibo at login
            </div>
            <div className="text-[11px] text-(--text-muted)">
              Start Kibo quietly when you sign in.
            </div>
          </div>
          <Toggle
            checked={settings.autoStart}
            disabled={autoStartBusy}
            label="Launch at login"
            onChange={(v) => void toggleAutoStart(v)}
          />
        </div>
      </Section>

      {/* Pause behavior */}
      <Section icon={Clock} title="Pause">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-medium text-(--text-primary)">
              Pause reminders
            </div>
            <div className="text-[11px] text-(--text-muted)">
              Stop all reminders until you resume.
            </div>
          </div>
          <Toggle
            checked={settings.paused}
            label="Pause reminders"
            onChange={(paused) => void window.kibo.setPaused(paused)}
          />
        </div>
      </Section>

      {/* Quit */}
      <button
        type="button"
        onClick={() => void window.kibo.quit()}
        className="btn-focus self-end rounded-xl border border-(--border) bg-(--surface) px-5 py-2.5 text-sm font-medium text-(--text-muted) transition hover:bg-(--surface-hover) hover:text-(--text-primary)"
      >
        Quit Kibo
      </button>
    </div>
  );
}
