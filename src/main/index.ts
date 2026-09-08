import { app, BrowserWindow, Notification, shell } from "electron";
import { join } from "path";
import { electronApp, optimizer } from "@electron-toolkit/utils";
import { IPC } from "../shared/ipc";
import {
  REMINDER_LABELS,
  type AppRoute,
  type ReminderId,
} from "../shared/types";
import { ActivityMonitor } from "./activityMonitor";
import { registerIpc } from "./ipc";
import { ReminderEngine } from "./reminderEngine";
import { KiboStore } from "./store";
import { createTray, refreshTrayMenu, type TrayDeps } from "./tray";
import {
  createMascotWindow,
  createSettingsWindow,
  positionMascot,
} from "./windows";

let settingsWindow: BrowserWindow | null = null;
let mascotWindow: BrowserWindow | null = null;
let isQuitting = false;

function getSettingsWindow(): BrowserWindow {
  if (!settingsWindow || settingsWindow.isDestroyed()) {
    settingsWindow = createSettingsWindow();
    settingsWindow.on("close", (event) => {
      if (!isQuitting) {
        event.preventDefault();
        settingsWindow?.hide();
      }
    });
    settingsWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });
  }
  return settingsWindow;
}

function showSettings(route: AppRoute = "home"): void {
  const win = getSettingsWindow();
  win.webContents.send(IPC.NAVIGATE, route);
  win.show();
}

function hideSettings(): void {
  settingsWindow?.hide();
}

function broadcast(channel: string, payload?: unknown): void {
  for (const win of BrowserWindow.getAllWindows()) {
    win.webContents.send(channel, payload);
  }
}

function showMascot(id: ReminderId): void {
  if (!mascotWindow || mascotWindow.isDestroyed()) {
    mascotWindow = createMascotWindow();
    mascotWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url);
      return { action: "deny" };
    });
    let revealed = false;
    const reveal = (): void => {
      if (revealed || !mascotWindow || mascotWindow.isDestroyed()) return;
      revealed = true;
      positionMascot(mascotWindow);
      mascotWindow.webContents.send(IPC.EVT_REMINDER, id);
      mascotWindow.show();
    };
    mascotWindow.once("ready-to-show", reveal);
    mascotWindow.webContents.once("did-finish-load", reveal);
    return;
  }
  positionMascot(mascotWindow);
  mascotWindow.webContents.send(IPC.EVT_REMINDER, id);
  mascotWindow.show();
}

function hideMascot(): void {
  if (mascotWindow && !mascotWindow.isDestroyed()) {
    mascotWindow.hide();
    mascotWindow.webContents.reload();
  }
}

const NOTIFICATION_BODY: Record<ReminderId, string> = {
  water: "Grab some water.",
  stretch: "Time to stretch your legs.",
  walk: "How about a quick walk?",
};

const gotSingleInstanceLock = app.requestSingleInstanceLock();

if (!gotSingleInstanceLock) {
  app.quit();
} else {
  if (process.platform === "darwin" && !app.isPackaged) {
    app.dock?.setIcon(join(__dirname, "../../build/icon.png"));
  }

  app.on("second-instance", () => {
    showSettings();
  });

  app.whenReady().then(() => {
    electronApp.setAppUserModelId("com.kibo.app");
    app.on("browser-window-created", (_, window) => {
      optimizer.watchWindowShortcuts(window);
    });

    const store = new KiboStore();
    const settings = store.getSettings();
    const engine = new ReminderEngine({
      configs: settings.reminders,
      paused: settings.paused,
      snoozeMinutes: settings.snoozeMinutes,
    });
    const monitor = new ActivityMonitor();

    let tray: ReturnType<typeof createTray> | null = null;

    const trayDeps: TrayDeps = {
      engine,
      onTogglePause: () => {
        const paused = !engine.getPaused();
        engine.setPaused(paused);
        store.setSettings({ paused });
        broadcast(IPC.EVT_STATE);
      },
      onTrigger: (id) => engine.triggerNow(id),
      onOpenApp: () => showSettings("home"),
      onOpenSettings: () => showSettings("settings"),
      onQuit: () => {
        isQuitting = true;
        app.quit();
      },
    };

    engine.on("fire", (id: ReminderId) => {
      showMascot(id);
      if (monitor.getStatus() !== "active" && Notification.isSupported()) {
        new Notification({
          title: `Time for ${REMINDER_LABELS[id].toLowerCase()}`,
          body: NOTIFICATION_BODY[id],
        }).show();
      }
    });
    engine.on("change", () => {
      if (tray) refreshTrayMenu(tray, trayDeps);
    });

    monitor.onBreak = () => engine.resetClocks();

    const applyAutoStart = (enabled: boolean): boolean => {
      const options =
        process.platform === "darwin" && enabled ? { openAsHidden: true } : {};
      app.setLoginItemSettings({ openAtLogin: enabled, ...options });
      return app.getLoginItemSettings().openAtLogin;
    };

    registerIpc({
      engine,
      store,
      broadcast,
      setAutoStart: applyAutoStart,
      quit: () => {
        isQuitting = true;
        app.quit();
      },
      hideSettings,
      hideMascot,
    });

    tray = createTray(trayDeps);

    setInterval(() => {
      engine.checkNow();
      if (tray) refreshTrayMenu(tray, trayDeps);
    }, 15_000);

    monitor.start();

    if (store.isFirstRun()) {
      store.markSeen();
      showSettings();
    }

    app.on("activate", () => showSettings());
  });

  app.on("before-quit", () => {
    isQuitting = true;
  });

  app.on("window-all-closed", () => {
    // Tray app: keep running until the user quits from the tray.
  });
}
