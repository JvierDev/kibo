import { describe, it, expect } from "vitest";
import { dateKey, shiftDateKey, getWeekStats, getStreak } from "./stats";
import type { DailyStats } from "../shared/types";

describe("date helpers", () => {
  it("formats a date as YYYY-MM-DD", () => {
    expect(dateKey(new Date(2026, 8, 4))).toBe("2026-09-04");
  });

  it("shifts a key forward and backward across months", () => {
    expect(shiftDateKey("2026-09-04", -1)).toBe("2026-09-03");
    expect(shiftDateKey("2026-09-01", -1)).toBe("2026-08-31");
    expect(shiftDateKey("2026-09-30", 1)).toBe("2026-10-01");
  });
});

describe("getWeekStats", () => {
  it("returns the last seven days ending today, oldest first", () => {
    const stats: DailyStats = { "2026-09-04": { water: 2 } };
    const week = getWeekStats(stats, "2026-09-04");
    expect(week).toHaveLength(7);
    expect(week[6]).toEqual({ day: "2026-09-04", counts: { water: 2 } });
    expect(week[0].day).toBe("2026-08-29");
  });

  it("defaults empty days to empty counts", () => {
    const week = getWeekStats({}, "2026-09-04");
    for (const entry of week) {
      expect(entry.counts).toEqual({});
    }
  });
});

describe("getStreak", () => {
  it("counts consecutive days ending today", () => {
    const stats: DailyStats = {
      "2026-09-02": { water: 1 },
      "2026-09-03": { water: 1 },
      "2026-09-04": { water: 2, stretch: 1 },
    };
    expect(getStreak(stats, "2026-09-04")).toBe(3);
  });

  it("treats an empty today as still in progress through yesterday", () => {
    const stats: DailyStats = {
      "2026-09-03": { water: 1 },
      "2026-09-04": {},
    };
    expect(getStreak(stats, "2026-09-04")).toBe(1);
  });

  it("breaks the streak on a gap", () => {
    const stats: DailyStats = {
      "2026-09-02": { water: 1 },
      "2026-09-04": { water: 1 },
    };
    expect(getStreak(stats, "2026-09-04")).toBe(1);
  });

  it("returns zero when nothing was completed recently", () => {
    const stats: DailyStats = { "2026-08-01": { water: 1 } };
    expect(getStreak(stats, "2026-09-04")).toBe(0);
  });
});
