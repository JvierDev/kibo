import { describe, it, expect } from 'vitest'
import { ReminderEngine } from './reminderEngine'
import { DEFAULT_REMINDERS, type ReminderId } from '../shared/types'

function makeEngine(overrides: Partial<Record<ReminderId, { enabled?: boolean; interval?: number }>> = {}) {
  const configs = structuredClone(DEFAULT_REMINDERS) as typeof DEFAULT_REMINDERS
  for (const id of ['water', 'stretch', 'walk'] as ReminderId[]) {
    const o = overrides[id]
    if (!o) continue
    if (o.enabled !== undefined) configs[id].enabled = o.enabled
    if (o.interval !== undefined) configs[id].interval = o.interval
  }
  return new ReminderEngine({ configs, snoozeMinutes: 5 })
}

describe('ReminderEngine', () => {
  it('does not fire before the interval elapses', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.tick(9 * 60)
    expect(fires).toEqual([])
  })

  it('fires after the interval elapses in active time', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.tick(10 * 60)
    expect(fires).toEqual(['water'])
  })

  it('fires each reminder independently at its own interval', () => {
    const engine = makeEngine({ water: { interval: 10 }, stretch: { interval: 20 }, walk: { interval: 30 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.tick(30 * 60)
    expect(fires).toEqual(['water', 'stretch', 'walk'])
  })

  it('does not immediately refire after done and emits done', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    const dones: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.on('done', (id) => dones.push(id))
    engine.tick(10 * 60)
    engine.done('water')
    expect(dones).toEqual(['water'])
    engine.tick(9 * 60)
    expect(fires).toEqual(['water'])
  })

  it('resetClocks prevents an immediate refire after a break', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.tick(10 * 60)
    engine.resetClocks()
    engine.tick(9 * 60)
    expect(fires).toEqual(['water'])
  })

  it('re-fires snoozed reminders after the snooze window', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.tick(10 * 60)
    expect(fires).toEqual(['water'])
    engine.snooze('water')
    engine.tick(4 * 60)
    expect(fires).toEqual(['water'])
    engine.tick(60)
    expect(fires).toEqual(['water', 'water'])
  })

  it('skip resets without recording a completion', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    const dones: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.on('done', (id) => dones.push(id))
    engine.tick(10 * 60)
    engine.skip('water')
    engine.tick(60)
    expect(dones).toEqual([])
    expect(fires).toEqual(['water'])
  })

  it('pause suppresses firing and unpause resumes', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.setPaused(true)
    engine.tick(10 * 60)
    expect(fires).toEqual([])
    engine.setPaused(false)
    engine.tick(1)
    expect(fires).toEqual(['water'])
  })

  it('never fires a disabled reminder', () => {
    const engine = makeEngine({
      water: { interval: 10 },
      stretch: { interval: 20 },
      walk: { enabled: false, interval: 30 }
    })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.tick(30 * 60)
    expect(fires).toEqual(['water', 'stretch'])
  })

  it('reports the earliest upcoming reminder', () => {
    const engine = makeEngine()
    expect(engine.nextDue()).toEqual({ id: 'water', secondsRemaining: 45 * 60 })
    engine.tick(45 * 60)
    expect(engine.nextDue()).toEqual({ id: 'stretch', secondsRemaining: 15 * 60 })
  })

  it('triggerNow fires immediately but only once while waiting', () => {
    const engine = makeEngine({ water: { interval: 10 } })
    const fires: ReminderId[] = []
    engine.on('fire', (id) => fires.push(id))
    engine.triggerNow('water')
    engine.triggerNow('water')
    expect(fires).toEqual(['water'])
    engine.done('water')
    engine.tick(10 * 60)
    expect(fires).toEqual(['water', 'water'])
  })
})