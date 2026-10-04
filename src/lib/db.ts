import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Attendance, Member, Payment, Plan, Settings } from './types'

interface GymDB extends DBSchema {
  members: {
    key: string
    value: Member
    indexes: { by_token: string; by_name: string }
  }
  plans: { key: string; value: Plan }
  payments: { key: string; value: Payment; indexes: { by_member: string } }
  attendances: {
    key: string
    value: Attendance
    indexes: { by_member: string; by_date: string }
  }
  settings: { key: string; value: Settings }
}

const DB_NAME = 'gym-local'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<GymDB>> | null = null

export function getDB(): Promise<IDBPDatabase<GymDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GymDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const members = db.createObjectStore('members', { keyPath: 'id' })
        members.createIndex('by_token', 'token', { unique: true })
        members.createIndex('by_name', 'full_name')

        db.createObjectStore('plans', { keyPath: 'id' })

        const payments = db.createObjectStore('payments', { keyPath: 'id' })
        payments.createIndex('by_member', 'member_id')

        const att = db.createObjectStore('attendances', { keyPath: 'id' })
        att.createIndex('by_member', 'member_id')
        att.createIndex('by_date', 'checked_in_at')

        db.createObjectStore('settings', { keyPath: 'id' })
      },
    })
  }
  return dbPromise
}

export function uid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

/** Semeia planos e definições na primeira utilização. */
export async function seedIfEmpty(): Promise<void> {
  const db = await getDB()

  const settings = await db.get('settings', 'app')
  if (!settings) {
    await db.put('settings', { id: 'app', gym_name: 'O Meu Ginásio' })
  }

  const planCount = await db.count('plans')
  if (planCount === 0) {
    const now = new Date().toISOString()
    const defaults: Omit<Plan, 'id' | 'created_at'>[] = [
      { name: 'Mensal', price_mzn: 1500, duration_days: 30, active: true },
      { name: 'Trimestral', price_mzn: 4000, duration_days: 90, active: true },
      { name: 'Semestral', price_mzn: 7500, duration_days: 180, active: true },
      { name: 'Anual', price_mzn: 14000, duration_days: 365, active: true },
    ]
    const tx = db.transaction('plans', 'readwrite')
    await Promise.all(
      defaults.map((p) => tx.store.put({ ...p, id: uid(), created_at: now })),
    )
    await tx.done
  }
}
