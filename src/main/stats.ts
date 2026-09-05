import type { DailyStats, ReminderId, WeekEntry } from "../shared/types";

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function shiftDateKey(key: string, offset: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return dateKey(new Date(y, m - 1, d + offset));
}

function hasCompletions(counts: Partial<Record<ReminderId, number>>): boolean {
  return Object.values(counts).some((count) => (count ?? 0) > 0);
}

export function getWeekStats(
  stats: DailyStats,
  today: string = dateKey(),
): WeekEntry[] {
  const entries: WeekEntry[] = [];
  for (let offset = -6; offset <= 0; offset++) {
    const day = shiftDateKey(today, offset);
    entries.push({ day, counts: stats[day] ?? {} });
  }
  return entries;
}

export function getStreak(
  stats: DailyStats,
  today: string = dateKey(),
): number {
  let streak = 0;
  let key = today;
  for (;;) {
    if (hasCompletions(stats[key] ?? {})) {
      streak++;
      key = shiftDateKey(key, -1);
      continue;
    }
    if (key === today) {
      key = shiftDateKey(key, -1);
      continue;
    }
    break;
  }
  return streak;
}
