import Store from 'electron-store'
import {
  DEFAULT_REMINDERS,
  DEFAULT_SNOOZE_MINUTES,
  type DailyStats,
  type ReminderId,
  type Settings
} from '../shared/types'

interface StoreData {
  settings: Settings
  stats: DailyStats
}

function defaultSettings(): Settings {
  return {
    reminders: {
      water: { ...DEFAULT_REMINDERS.water },
      stretch: { ...DEFAULT_REMINDERS.stretch },
      walk: { ...DEFAULT_REMINDERS.walk }
    },
    snoozeMinutes: DEFAULT_SNOOZE_MINUTES,
    paused: false,
    autoStart: false
  }
}

export function dateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export class KiboStore {
  private store = new Store<StoreData>({
    defaults: {
      settings: defaultSettings(),
      stats: {}
    },
    clearInvalidConfig: true
  })

  getSettings(): Settings {
    return this.store.get('settings')
  }

  setSettings(partial: Partial<Settings>): Settings {
    const next = { ...this.getSettings(), ...partial }
    if (partial.reminders) {
      next.reminders = { ...this.getSettings().reminders, ...partial.reminders }
    }
    this.store.set('settings', next)
    return next
  }

  recordDone(id: ReminderId, day: string = dateKey()): void {
    const stats = this.store.get('stats')
    const dayStats = stats[day] ?? {}
    const current = dayStats[id] ?? 0
    this.store.set('stats', { ...stats, [day]: { ...dayStats, [id]: current + 1 } })
  }

  getTodayStats(day: string = dateKey()): Partial<Record<ReminderId, number>> {
    return this.store.get('stats')[day] ?? {}
  }
}