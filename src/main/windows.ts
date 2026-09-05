import { BrowserWindow, screen } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

export const MASCOT_WIDTH = 340;
export const MASCOT_HEIGHT = 300;

const PRELOAD_PATH = join(__dirname, "../preload/index.mjs");

function loadWindow(window: BrowserWindow, hash: string): void {
  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    void window.loadURL(`${process.env["ELECTRON_RENDERER_URL"]}/${hash}`);
  } else {
    void window.loadFile(join(__dirname, "../renderer/index.html"), { hash });
  }
}

export function createSettingsWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 760,
    height: 640,
    show: false,
    autoHideMenuBar: true,
    title: "Kibo",
    backgroundColor: "#020617",
    webPreferences: {
      preload: PRELOAD_PATH,
      sandbox: false,
    },
  });
  loadWindow(win, "#/dashboard");
  return win;
}

export function createMascotWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: MASCOT_WIDTH,
    height: MASCOT_HEIGHT,
    show: false,
    frame: false,
    transparent: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: false,
    hasShadow: false,
    acceptFirstMouse: true,
    webPreferences: {
      preload: PRELOAD_PATH,
      sandbox: false,
    },
  });
  loadWindow(win, "#/mascot");
  return win;
}

export function positionMascot(win: BrowserWindow): void {
  const { workArea } = screen.getPrimaryDisplay();
  win.setPosition(
    workArea.x + workArea.width - MASCOT_WIDTH,
    workArea.y + workArea.height - MASCOT_HEIGHT,
  );
}
