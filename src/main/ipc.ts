import { ipcMain } from "electron";
import { IPC } from "../shared/ipc";
import type {
  KiboState,
  ReminderAction,
  ReminderConfig,
  ReminderId,
} from "../shared/types";
import { ReminderEngine } from "./reminderEngine";
import { KiboStore } from "./store";

export interface IpcDeps {
  engine: ReminderEngine;
  store: KiboStore;
  broadcast: (channel: string, payload?: unknown) => void;
  setAutoStart: (enabled: boolean) => boolean;
  quit: () => void;
  hideSettings: () => void;
  hideMascot: () => void;
}

export function registerIpc(deps: IpcDeps): void {
  const {
    engine,
    store,
    broadcast,
    setAutoStart,
    quit,
    hideSettings,
    hideMascot,
  } = deps;

  const buildState = (): KiboState => ({
    settings: store.getSettings(),
    today: store.getTodayStats(),
    week: store.getWeekStats(),
    streak: store.getStreak(),
    nextReminder: engine.nextDue(),
    activeReminder: engine.getActiveReminder(),
  });

  ipcMain.handle(IPC.GET_STATE, () => buildState());

  ipcMain.handle(
    IPC.SET_REMINDER,
    (_event, id: ReminderId, patch: Partial<ReminderConfig>): KiboState => {
      const settings = store.getSettings();
      settings.reminders[id] = { ...settings.reminders[id], ...patch };
      store.setSettings({ reminders: settings.reminders });
      engine.setConfigs(settings.reminders);
      const state = buildState();
      broadcast(IPC.EVT_STATE, state);
      return state;
    },
  );

  ipcMain.handle(IPC.SET_SNOOZE, (_event, minutes: number): KiboState => {
    store.setSettings({ snoozeMinutes: minutes });
    engine.setSnoozeMinutes(minutes);
    const state = buildState();
    broadcast(IPC.EVT_STATE, state);
    return state;
  });

  ipcMain.handle(IPC.SET_PAUSED, (_event, paused: boolean): KiboState => {
    store.setSettings({ paused });
    engine.setPaused(paused);
    const state = buildState();
    broadcast(IPC.EVT_STATE, state);
    return state;
  });

  ipcMain.handle(IPC.SET_AUTOSTART, (_event, enabled: boolean): KiboState => {
    store.setSettings({ autoStart: enabled });
    setAutoStart(enabled);
    const state = buildState();
    broadcast(IPC.EVT_STATE, state);
    return state;
  });

  ipcMain.handle(IPC.TRIGGER_NOW, (_event, id: ReminderId): void => {
    engine.triggerNow(id);
  });

  ipcMain.handle(
    IPC.RESPOND,
    (_event, id: ReminderId, action: ReminderAction): void => {
      if (action === "done") {
        engine.done(id);
        store.recordDone(id);
      } else if (action === "snooze") {
        engine.snooze(id);
      } else {
        engine.skip(id);
      }
      const state = buildState();
      broadcast(IPC.EVT_STATE, state);
      broadcast(IPC.EVT_REACTION, { id, action, count: state.today[id] ?? 0 });
      setTimeout(hideMascot, 1500);
    },
  );

  ipcMain.handle(IPC.HIDE_SETTINGS, () => hideSettings());
  ipcMain.handle(IPC.QUIT, () => quit());
}
