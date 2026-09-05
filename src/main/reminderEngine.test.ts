import { describe, it, expect } from "vitest";
import { ReminderEngine } from "./reminderEngine";
import { DEFAULT_REMINDERS, type ReminderId } from "../shared/types";

function makeEngine(
  overrides: Partial<
    Record<ReminderId, { enabled?: boolean; interval?: number }>
  > = {},
) {
  const configs = structuredClone(
    DEFAULT_REMINDERS,
  ) as typeof DEFAULT_REMINDERS;
  for (const id of ["water", "stretch", "walk"] as ReminderId[]) {
    const o = overrides[id];
    if (!o) continue;
    if (o.enabled !== undefined) configs[id].enabled = o.enabled;
    if (o.interval !== undefined) configs[id].interval = o.interval;
  }
  let t = 0;
  const engine = new ReminderEngine({
    configs,
    snoozeMinutes: 5,
    now: () => t,
  });
  const advance = (ms: number): void => {
    t += ms;
    engine.checkNow();
  };
  return { engine, advance, getTime: (): number => t };
}

describe("ReminderEngine", () => {
  it("does not fire before the interval elapses", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    advance(9 * 60 * 1000);
    expect(fires).toEqual([]);
  });

  it("fires after the interval elapses", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    advance(10 * 60 * 1000);
    expect(fires).toEqual(["water"]);
  });

  it("fires each reminder independently at its own interval", () => {
    const { engine, advance } = makeEngine({
      water: { interval: 10 },
      stretch: { interval: 20 },
      walk: { interval: 30 },
    });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    advance(30 * 60 * 1000);
    expect(fires).toEqual(["water", "stretch", "walk"]);
  });

  it("does not immediately refire after done and emits done", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    const dones: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    engine.on("done", (id) => dones.push(id));
    advance(10 * 60 * 1000);
    engine.done("water");
    expect(dones).toEqual(["water"]);
    advance(9 * 60 * 1000);
    expect(fires).toEqual(["water"]);
  });

  it("resetClocks prevents an immediate refire after a break", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    advance(10 * 60 * 1000);
    engine.resetClocks();
    advance(9 * 60 * 1000);
    expect(fires).toEqual(["water"]);
  });

  it("re-fires snoozed reminders after the snooze window", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    advance(10 * 60 * 1000);
    expect(fires).toEqual(["water"]);
    engine.snooze("water");
    advance(4 * 60 * 1000);
    expect(fires).toEqual(["water"]);
    advance(60 * 1000);
    expect(fires).toEqual(["water", "water"]);
  });

  it("skip resets without recording a completion", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    const dones: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    engine.on("done", (id) => dones.push(id));
    advance(10 * 60 * 1000);
    engine.skip("water");
    advance(60 * 1000);
    expect(dones).toEqual([]);
    expect(fires).toEqual(["water"]);
  });

  it("pause suppresses firing and unpause resumes", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    engine.setPaused(true);
    advance(10 * 60 * 1000);
    expect(fires).toEqual([]);
    engine.setPaused(false);
    advance(1000);
    expect(fires).toEqual(["water"]);
  });

  it("never fires a disabled reminder", () => {
    const { engine, advance } = makeEngine({
      water: { interval: 10 },
      stretch: { interval: 20 },
      walk: { enabled: false, interval: 30 },
    });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    advance(30 * 60 * 1000);
    expect(fires).toEqual(["water", "stretch"]);
  });

  it("reports the earliest upcoming reminder", () => {
    const { engine, advance } = makeEngine();
    expect(engine.nextDue()).toEqual({
      id: "water",
      secondsRemaining: 45 * 60,
    });
    advance(45 * 60 * 1000);
    expect(engine.nextDue()).toEqual({
      id: "stretch",
      secondsRemaining: 15 * 60,
    });
  });

  it("triggerNow fires immediately but only once while waiting", () => {
    const { engine, advance } = makeEngine({ water: { interval: 10 } });
    const fires: ReminderId[] = [];
    engine.on("fire", (id) => fires.push(id));
    engine.triggerNow("water");
    engine.triggerNow("water");
    expect(fires).toEqual(["water"]);
    engine.done("water");
    advance(10 * 60 * 1000);
    expect(fires).toEqual(["water", "water"]);
  });
});
