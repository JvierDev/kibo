import { Menu, Tray, nativeImage } from "electron";
import { join } from "path";
import { REMINDER_LABELS, type ReminderId } from "../shared/types";
import { ReminderEngine } from "./reminderEngine";

export interface TrayDeps {
  engine: ReminderEngine;
  onTogglePause: () => void;
  onTrigger: (id: ReminderId) => void;
  onOpenSettings: () => void;
  onQuit: () => void;
}

function minutesLabel(next: { secondsRemaining: number }): string {
  if (next.secondsRemaining < 60) return "now";
  return `${Math.ceil(next.secondsRemaining / 60)} min`;
}

export function buildMenu(deps: TrayDeps): Menu {
  const { engine, onTogglePause, onTrigger, onOpenSettings, onQuit } = deps;
  const paused = engine.getPaused();
  const next = engine.nextDue();

  let statusLabel: string;
  if (paused) {
    statusLabel = "Paused";
  } else if (next) {
    statusLabel = `Next: ${REMINDER_LABELS[next.id]} · ${minutesLabel(next)}`;
  } else {
    statusLabel = "All caught up";
  }

  return Menu.buildFromTemplate([
    { label: "Kibo", enabled: false },
    { label: statusLabel, enabled: false },
    { type: "separator" },
    { label: "💧 Drink water", click: () => onTrigger("water") },
    { label: "🙆 Take a stretch", click: () => onTrigger("stretch") },
    { label: "🚶 Take a walk", click: () => onTrigger("walk") },
    { type: "separator" },
    {
      label: paused ? "▶ Resume reminders" : "⏸ Pause reminders",
      click: onTogglePause,
    },
    { type: "separator" },
    { label: "⚙ Settings…", click: onOpenSettings },
    { label: "✕ Quit", click: onQuit },
  ]);
}

export function createTray(deps: TrayDeps): Tray {
  const iconPath = join(__dirname, "../../build/trayTemplate.png");
  const image = nativeImage.createFromPath(iconPath);
  image.setTemplateImage(true);
  const tray = new Tray(image);
  tray.setToolTip("Kibo — healthy-work companion");
  tray.setContextMenu(buildMenu(deps));
  return tray;
}

export function refreshTrayMenu(tray: Tray, deps: TrayDeps): void {
  tray.setContextMenu(buildMenu(deps));
}
