import { powerMonitor } from "electron";
import { IDLE_RESET_SECONDS } from "../shared/types";

export type ActivityStatus = "active" | "idle" | "locked" | "suspended";

const POLL_INTERVAL_MS = 15_000;

export class ActivityMonitor {
  private timer: NodeJS.Timeout | null = null;
  private status: ActivityStatus = "active";

  /** Fired once when the user transitions into a break (idle, lock, display off, sleep). */
  onBreak?: () => void;
  onStatusChange?: (status: ActivityStatus) => void;

  start(): void {
    this.timer = setInterval(() => this.poll(), POLL_INTERVAL_MS);
    powerMonitor.on("lock-screen", this.handleLock);
    powerMonitor.on("unlock-screen", this.handleUnlock);
    powerMonitor.on("suspend", this.handleSuspend);
    powerMonitor.on("resume", this.handleResume);
  }

  stop(): void {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    powerMonitor.removeListener("lock-screen", this.handleLock);
    powerMonitor.removeListener("unlock-screen", this.handleUnlock);
    powerMonitor.removeListener("suspend", this.handleSuspend);
    powerMonitor.removeListener("resume", this.handleResume);
  }

  getStatus(): ActivityStatus {
    return this.status;
  }

  private poll(): void {
    const idleSeconds = powerMonitor.getSystemIdleTime();
    if (idleSeconds >= IDLE_RESET_SECONDS) {
      this.setStatus("idle", true);
      return;
    }
    this.setStatus("active", false);
  }

  private handleLock = (): void => {
    this.setStatus("locked", true);
  };

  private handleUnlock = (): void => {
    this.setStatus("active", false);
  };

  private handleSuspend = (): void => {
    this.setStatus("suspended", true);
  };

  private handleResume = (): void => {
    this.setStatus("active", false);
  };

  private setStatus(status: ActivityStatus, breakTaken: boolean): void {
    const transitioning = this.status !== status;
    if (transitioning) {
      this.status = status;
      this.onStatusChange?.(status);
    }
    if (breakTaken && transitioning) {
      this.onBreak?.();
    }
  }
}
