import Store from "electron-store";
import {
  DEFAULT_REMINDERS,
  DEFAULT_SNOOZE_MINUTES,
  type DailyStats,
  type ReminderId,
  type Settings,
  type WeekEntry,
} from "../shared/types";
import { dateKey, getStreak, getWeekStats } from "./stats";

interface StoreData {
  settings: Settings;
  stats: DailyStats;
  firstRun: boolean;
}

function defaultSettings(): Settings {
  return {
    reminders: {
      water: { ...DEFAULT_REMINDERS.water },
      stretch: { ...DEFAULT_REMINDERS.stretch },
      walk: { ...DEFAULT_REMINDERS.walk },
    },
    snoozeMinutes: DEFAULT_SNOOZE_MINUTES,
    paused: false,
    autoStart: false,
  };
}

export class KiboStore {
  private store = new Store<StoreData>({
    defaults: {
      settings: defaultSettings(),
      stats: {},
      firstRun: true,
    },
    clearInvalidConfig: true,
  });

  getSettings(): Settings {
    return this.store.get("settings");
  }

  setSettings(partial: Partial<Settings>): Settings {
    const next = { ...this.getSettings(), ...partial };
    if (partial.reminders) {
      next.reminders = {
        ...this.getSettings().reminders,
        ...partial.reminders,
      };
    }
    this.store.set("settings", next);
    return next;
  }

  recordDone(id: ReminderId, day: string = dateKey()): void {
    const stats = this.store.get("stats");
    const dayStats = stats[day] ?? {};
    const current = dayStats[id] ?? 0;
    this.store.set("stats", {
      ...stats,
      [day]: { ...dayStats, [id]: current + 1 },
    });
  }

  getTodayStats(day: string = dateKey()): Partial<Record<ReminderId, number>> {
    return this.store.get("stats")[day] ?? {};
  }

  getWeekStats(): WeekEntry[] {
    return getWeekStats(this.store.get("stats"));
  }

  getStreak(): number {
    return getStreak(this.store.get("stats"));
  }

  isFirstRun(): boolean {
    return this.store.get("firstRun");
  }

  markSeen(): void {
    this.store.set("firstRun", false);
  }
}
