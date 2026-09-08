import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { IPC } from "../shared/ipc";
import type {
  AppRoute,
  KiboApi,
  ReactionEvent,
  ReminderAction,
  ReminderConfig,
  ReminderId,
} from "../shared/types";

const api: KiboApi = {
  getState: () => ipcRenderer.invoke(IPC.GET_STATE),
  setReminder: (id: ReminderId, patch: Partial<ReminderConfig>) =>
    ipcRenderer.invoke(IPC.SET_REMINDER, id, patch),
  setSnoozeMinutes: (minutes: number) =>
    ipcRenderer.invoke(IPC.SET_SNOOZE, minutes),
  setPaused: (paused: boolean) => ipcRenderer.invoke(IPC.SET_PAUSED, paused),
  setAutoStart: (enabled: boolean) =>
    ipcRenderer.invoke(IPC.SET_AUTOSTART, enabled),
  triggerNow: (id: ReminderId) => ipcRenderer.invoke(IPC.TRIGGER_NOW, id),
  respondReminder: (id: ReminderId, action: ReminderAction) =>
    ipcRenderer.invoke(IPC.RESPOND, id, action),
  hideSettings: () => ipcRenderer.invoke(IPC.HIDE_SETTINGS),
  quit: () => ipcRenderer.invoke(IPC.QUIT),
  onReminder: (cb: (id: ReminderId) => void) => {
    const listener = (_: unknown, id: ReminderId): void => cb(id);
    ipcRenderer.on(IPC.EVT_REMINDER, listener);
    return () => ipcRenderer.removeListener(IPC.EVT_REMINDER, listener);
  },
  onReaction: (cb: (event: ReactionEvent) => void) => {
    const listener = (_: unknown, event: ReactionEvent): void => cb(event);
    ipcRenderer.on(IPC.EVT_REACTION, listener);
    return () => ipcRenderer.removeListener(IPC.EVT_REACTION, listener);
  },
  onState: (cb: () => void) => {
    const listener = (): void => cb();
    ipcRenderer.on(IPC.EVT_STATE, listener);
    return () => ipcRenderer.removeListener(IPC.EVT_STATE, listener);
  },
  onNavigate: (cb: (route: AppRoute) => void) => {
    const listener = (_: unknown, route: AppRoute): void => cb(route);
    ipcRenderer.on(IPC.NAVIGATE, listener);
    return () => ipcRenderer.removeListener(IPC.NAVIGATE, listener);
  },
};

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("kibo", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-expect-error fallback when context isolation is disabled
  window.electron = electronAPI;
  // @ts-expect-error fallback when context isolation is disabled
  window.kibo = api;
}
