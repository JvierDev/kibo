import { EventEmitter } from "node:events";
import type { ReminderConfigs, ReminderId } from "../shared/types";

const REMINDER_IDS: ReminderId[] = ["water", "stretch", "walk"];

interface ReminderRuntime {
  baseResetAtSeconds: number;
  snoozeAnchorSeconds: number | null;
  firedAtSeconds: number | null;
  waiting: boolean;
}

interface EngineOptions {
  configs: ReminderConfigs;
  paused?: boolean;
  snoozeMinutes?: number;
}

export class ReminderEngine extends EventEmitter {
  private activeSeconds = 0;
  private configs: ReminderConfigs;
  private paused: boolean;
  private snoozeMinutes: number;
  private readonly runtime: Record<ReminderId, ReminderRuntime>;

  constructor(options: EngineOptions) {
    super();
    this.configs = options.configs;
    this.paused = options.paused ?? false;
    this.snoozeMinutes = options.snoozeMinutes ?? 5;
    this.runtime = {
      water: this.newRuntime(),
      stretch: this.newRuntime(),
      walk: this.newRuntime(),
    };
  }

  private newRuntime(): ReminderRuntime {
    return {
      baseResetAtSeconds: 0,
      snoozeAnchorSeconds: null,
      firedAtSeconds: null,
      waiting: false,
    };
  }

  getActiveSeconds(): number {
    return this.activeSeconds;
  }

  /** A reminder that has fired but not yet been answered, if any. */
  getActiveReminder(): ReminderId | null {
    for (const id of REMINDER_IDS) {
      if (this.runtime[id].waiting) return id;
    }
    return null;
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

  /** Advance the active clock by `deltaSeconds` of continuous system use. */
  tick(deltaSeconds: number): void {
    this.activeSeconds += deltaSeconds;
    if (this.paused) return;
    for (const id of REMINDER_IDS) {
      if (this.isDue(id)) this.fire(id);
    }
  }

  /** Called when the user takes a real break (idle, lock, sleep). */
  resetClocks(): void {
    for (const id of REMINDER_IDS) {
      this.runtime[id] = {
        baseResetAtSeconds: this.activeSeconds,
        snoozeAnchorSeconds: null,
        firedAtSeconds: null,
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
    r.baseResetAtSeconds = this.activeSeconds;
    r.snoozeAnchorSeconds = r.firedAtSeconds ?? this.activeSeconds;
    r.firedAtSeconds = null;
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
    r.baseResetAtSeconds = this.activeSeconds;
    r.snoozeAnchorSeconds = null;
    r.firedAtSeconds = null;
    r.waiting = false;
  }

  private isDue(id: ReminderId): boolean {
    const r = this.runtime[id];
    const cfg = this.configs[id];
    if (!cfg.enabled || r.waiting) return false;
    const baseDue =
      this.activeSeconds >= r.baseResetAtSeconds + cfg.interval * 60;
    const snoozeDue =
      r.snoozeAnchorSeconds !== null &&
      this.activeSeconds >= r.snoozeAnchorSeconds + this.snoozeMinutes * 60;
    return baseDue || snoozeDue;
  }

  private secondsUntilDue(id: ReminderId): number | null {
    const r = this.runtime[id];
    const cfg = this.configs[id];
    if (!cfg.enabled || r.waiting) return null;
    const baseRemaining =
      r.baseResetAtSeconds + cfg.interval * 60 - this.activeSeconds;
    const snoozeRemaining =
      r.snoozeAnchorSeconds !== null
        ? r.snoozeAnchorSeconds + this.snoozeMinutes * 60 - this.activeSeconds
        : Infinity;
    const remaining = Math.min(baseRemaining, snoozeRemaining);
    return remaining < 0 ? 0 : remaining;
  }

  private fire(id: ReminderId): void {
    const r = this.runtime[id];
    r.waiting = true;
    r.firedAtSeconds = this.activeSeconds;
    this.emit("fire", id);
    this.emitChange();
  }

  private emitChange(): void {
    this.emit("change");
  }
}
