export type ReminderId = "water" | "stretch" | "walk";

export type ReminderAction = "done" | "snooze" | "skip";

export interface ReminderConfig {
  enabled: boolean;
  interval: number;
}

export type ReminderConfigs = Record<ReminderId, ReminderConfig>;

export interface Settings {
  reminders: ReminderConfigs;
  snoozeMinutes: number;
  paused: boolean;
  autoStart: boolean;
}

export type DailyStats = Record<string, Partial<Record<ReminderId, number>>>;

export interface WeekEntry {
  day: string;
  counts: Partial<Record<ReminderId, number>>;
}

export interface NextReminder {
  id: ReminderId;
  secondsRemaining: number;
}

export interface KiboState {
  settings: Settings;
  today: Partial<Record<ReminderId, number>>;
  week: WeekEntry[];
  streak: number;
  nextReminder: NextReminder | null;
  activeReminder: ReminderId | null;
}

export interface ReactionEvent {
  id: ReminderId;
  action: ReminderAction;
  count?: number;
}

export interface KiboApi {
  getState(): Promise<KiboState>;
  setReminder(
    id: ReminderId,
    patch: Partial<ReminderConfig>,
  ): Promise<Settings>;
  setSnoozeMinutes(minutes: number): Promise<Settings>;
  setPaused(paused: boolean): Promise<Settings>;
  setAutoStart(enabled: boolean): Promise<boolean>;
  triggerNow(id: ReminderId): Promise<void>;
  respondReminder(id: ReminderId, action: ReminderAction): Promise<void>;
  hideSettings(): Promise<void>;
  quit(): Promise<void>;
  onReminder(cb: (id: ReminderId) => void): () => void;
  onReaction(cb: (event: ReactionEvent) => void): () => void;
  onState(cb: () => void): () => void;
}

export const DEFAULT_REMINDERS: ReminderConfigs = {
  water: { enabled: true, interval: 45 },
  stretch: { enabled: true, interval: 60 },
  walk: { enabled: true, interval: 90 },
};

export const DEFAULT_SNOOZE_MINUTES = 5;

export const IDLE_RESET_SECONDS = 5 * 60;

export const REMINDER_LABELS: Record<ReminderId, string> = {
  water: "Water",
  stretch: "Stretch",
  walk: "Walk",
};
