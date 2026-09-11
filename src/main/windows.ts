import { BrowserWindow, screen } from "electron";
import { join } from "path";
import { is } from "@electron-toolkit/utils";

export const MASCOT_WIDTH = 420;
export const MASCOT_HEIGHT = 360;

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
    width: 960,
    height: 840,
    minWidth: 960,
    minHeight: 840,
    show: false,
    autoHideMenuBar: true,
    title: "Kibo",
    backgroundColor: "#020817",
    webPreferences: {
      preload: PRELOAD_PATH,
      sandbox: false,
    },
    icon:
      process.platform === "win32"
        ? join(__dirname, "../../build/icon.ico")
        : join(__dirname, "../../build/icon.png"),
  });
  loadWindow(win, "#/home");
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
    icon:
      process.platform === "win32"
        ? join(__dirname, "../../build/icon.ico")
        : join(__dirname, "../../build/icon.png"),
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
