import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { HydrationLog, DailySummary, AppSettings } from '../../modules/hydration/types'

interface DailyMeDB extends DBSchema {
  hydration_logs: {
    key: string
    value: HydrationLog
    indexes: { 'by-date': string }
  }
  daily_summaries: {
    key: string
    value: DailySummary
  }
  settings: {
    key: string
    value: AppSettings
  }
}

let dbPromise: Promise<IDBPDatabase<DailyMeDB>> | null = null

async function getDB(): Promise<IDBPDatabase<DailyMeDB>> {
  if (!dbPromise) {
    dbPromise = openDB<DailyMeDB>('daily-me-db', 1, {
      upgrade(db) {
        const hydrationStore = db.createObjectStore('hydration_logs', {
          keyPath: 'id',
        })
        hydrationStore.createIndex('by-date', 'date')

        db.createObjectStore('daily_summaries', { keyPath: 'date' })
        db.createObjectStore('settings', { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

// --- Hydration logs ---

export async function addHydrationLog(entry: HydrationLog): Promise<void> {
  const db = await getDB()
  await db.put('hydration_logs', entry)
}

export async function deleteHydrationLog(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('hydration_logs', id)
}

export async function getLogsByDate(date: string): Promise<HydrationLog[]> {
  const db = await getDB()
  const logs = await db.getAllFromIndex('hydration_logs', 'by-date', date)
  return logs.sort((a, b) => a.timestamp - b.timestamp)
}

export async function getAllLogs(): Promise<HydrationLog[]> {
  const db = await getDB()
  return db.getAll('hydration_logs')
}

// --- Daily summaries ---

export async function upsertDailySummary(summary: DailySummary): Promise<void> {
  const db = await getDB()
  await db.put('daily_summaries', summary)
}

export async function getDailySummary(date: string): Promise<DailySummary | undefined> {
  const db = await getDB()
  return db.get('daily_summaries', date)
}

export async function getDailySummaries(dates: string[]): Promise<(DailySummary | undefined)[]> {
  const db = await getDB()
  const tx = db.transaction('daily_summaries', 'readonly')
  return Promise.all(dates.map((d) => tx.store.get(d)))
}

export async function deleteAllLogsForDate(date: string): Promise<void> {
  const db = await getDB()
  const logs = await db.getAllFromIndex('hydration_logs', 'by-date', date)
  const tx = db.transaction('hydration_logs', 'readwrite')
  await Promise.all(logs.map((l) => tx.store.delete(l.id)))
  await tx.done
}

// --- Settings ---

export async function getSetting<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  const row = await db.get('settings', key)
  return row?.value as T | undefined
}

export async function setSetting(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put('settings', { key, value })
}

export async function initDefaultSettings(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction('settings', 'readwrite')
  const existing = await tx.store.get('daily_goal_ml')
  if (!existing) {
    await tx.store.put({ key: 'daily_goal_ml', value: 2500 })
    await tx.store.put({ key: 'cup_size_ml', value: 250 })
    await tx.store.put({ key: 'theme', value: 'system' })
  }
  await tx.done
}

// --- Aggregation helper ---

export async function recalculateSummary(
  date: string,
  goalMl: number
): Promise<DailySummary> {
  const logs = await getLogsByDate(date)
  const total_ml = logs.reduce((sum, e) => sum + e.amount_ml, 0)
  const summary: DailySummary = {
    date,
    total_ml,
    goal_ml: goalMl,
    entries_count: logs.length,
    goal_reached: total_ml >= goalMl,
    last_updated: Date.now(),
  }
  await upsertDailySummary(summary)
  return summary
}
