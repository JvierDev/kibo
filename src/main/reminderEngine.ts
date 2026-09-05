import { EventEmitter } from "node:events";
import type { ReminderConfigs, ReminderId } from "../shared/types";

const REMINDER_IDS: ReminderId[] = ["water", "stretch", "walk"];
const MS_PER_MINUTE = 60_000;

interface ReminderRuntime {
  resolvedAtMs: number;
  snoozeAtMs: number | null;
  firedAtMs: number | null;
  waiting: boolean;
}

interface EngineOptions {
  configs: ReminderConfigs;
  paused?: boolean;
  snoozeMinutes?: number;
  now?: () => number;
}

export class ReminderEngine extends EventEmitter {
  private readonly now: () => number;
  private configs: ReminderConfigs;
  private paused: boolean;
  private snoozeMinutes: number;
  private readonly runtime: Record<ReminderId, ReminderRuntime>;

  constructor(options: EngineOptions) {
    super();
    this.now = options.now ?? Date.now;
    this.configs = options.configs;
    this.paused = options.paused ?? false;
    this.snoozeMinutes = options.snoozeMinutes ?? 5;
    const startMs = this.now();
    this.runtime = {
      water: this.newRuntime(startMs),
      stretch: this.newRuntime(startMs),
      walk: this.newRuntime(startMs),
    };
  }

  private newRuntime(startMs: number): ReminderRuntime {
    return {
      resolvedAtMs: startMs,
      snoozeAtMs: null,
      firedAtMs: null,
      waiting: false,
    };
  }

  /** A reminder that has fired but not yet been answered, if any. */
  getActiveReminder(): ReminderId | null {
    for (const id of REMINDER_IDS) {
      if (this.runtime[id].waiting) return id;
    }
    return null;
  }

  getPaused(): boolean {
    return this.paused;
  }

  setConfigs(configs: ReminderConfigs): void {
    this.configs = configs;
    this.emitChange();
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    this.emitChange();
  }

  setSnoozeMinutes(minutes: number): void {
    this.snoozeMinutes = minutes;
    this.emitChange();
  }

  /** Evaluate due reminders against the current time. Call on a fixed cadence. */
  checkNow(): void {
    if (this.paused) return;
    for (const id of REMINDER_IDS) {
      if (this.isDue(id)) this.fire(id);
    }
  }

  /** Called when the user takes a real break (idle, lock, display off, sleep). */
  resetClocks(): void {
    const nowMs = this.now();
    for (const id of REMINDER_IDS) {
      this.runtime[id] = {
        resolvedAtMs: nowMs,
        snoozeAtMs: null,
        firedAtMs: null,
        waiting: false,
      };
    }
    this.emitChange();
  }

  done(id: ReminderId): void {
    this.resolve(id);
    this.emit("done", id);
    this.emitChange();
  }

  skip(id: ReminderId): void {
    this.resolve(id);
    this.emitChange();
  }

  snooze(id: ReminderId): void {
    const r = this.runtime[id];
    r.resolvedAtMs = this.now();
    r.snoozeAtMs = r.firedAtMs ?? this.now();
    r.firedAtMs = null;
    r.waiting = false;
    this.emitChange();
  }

  /** Force a reminder now (e.g. from the tray). */
  triggerNow(id: ReminderId): void {
    if (this.runtime[id].waiting) return;
    this.fire(id);
  }

  /** Earliest upcoming reminder, or null when nothing is due soon. */
  nextDue(): { id: ReminderId; secondsRemaining: number } | null {
    let best: { id: ReminderId; secondsRemaining: number } | null = null;
    for (const id of REMINDER_IDS) {
      if (!this.configs[id].enabled || this.runtime[id].waiting) continue;
      const secondsRemaining = this.secondsUntilDue(id);
      if (secondsRemaining === null) continue;
      if (!best || secondsRemaining < best.secondsRemaining) {
        best = { id, secondsRemaining };
      }
    }
    return best;
  }

  private resolve(id: ReminderId): void {
    const r = this.runtime[id];
    r.resolvedAtMs = this.now();
    r.snoozeAtMs = null;
    r.firedAtMs = null;
    r.waiting = false;
  }

  private isDue(id: ReminderId): boolean {
    const r = this.runtime[id];
    const cfg = this.configs[id];
    if (!cfg.enabled || r.waiting) return false;
    const nowMs = this.now();
    const baseDue = nowMs >= r.resolvedAtMs + cfg.interval * MS_PER_MINUTE;
    const snoozeDue =
      r.snoozeAtMs !== null &&
      nowMs >= r.snoozeAtMs + this.snoozeMinutes * MS_PER_MINUTE;
    return baseDue || snoozeDue;
  }

  private secondsUntilDue(id: ReminderId): number | null {
    const r = this.runtime[id];
    const cfg = this.configs[id];
    if (!cfg.enabled || r.waiting) return null;
    const nowMs = this.now();
    const baseRemaining = r.resolvedAtMs + cfg.interval * MS_PER_MINUTE - nowMs;
    const snoozeRemaining =
      r.snoozeAtMs !== null
        ? r.snoozeAtMs + this.snoozeMinutes * MS_PER_MINUTE - nowMs
        : Infinity;
    const remaining = Math.min(baseRemaining, snoozeRemaining);
    if (remaining < 0) return 0;
    return Math.round(remaining / 1000);
  }

  private fire(id: ReminderId): void {
    const r = this.runtime[id];
    r.waiting = true;
    r.firedAtMs = this.now();
    this.emit("fire", id);
    this.emitChange();
  }

  private emitChange(): void {
    this.emit("change");
  }
}
