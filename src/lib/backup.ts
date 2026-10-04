import { getDB } from './db'
import type { Attendance, Member, Payment, Plan, Settings } from './types'

interface Backup {
  app: 'gym-local'
  version: 1
  exported_at: string
  members: Member[]
  plans: Plan[]
  payments: Payment[]
  attendances: Attendance[]
  settings: Settings[]
}

export async function exportBackup(): Promise<void> {
  const db = await getDB()
  const data: Backup = {
    app: 'gym-local',
    version: 1,
    exported_at: new Date().toISOString(),
    members: await db.getAll('members'),
    plans: await db.getAll('plans'),
    payments: await db.getAll('payments'),
    attendances: await db.getAll('attendances'),
    settings: await db.getAll('settings'),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `ginasio-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

/** Importa um backup, SUBSTITUINDO os dados atuais. */
export async function importBackup(file: File): Promise<void> {
  const text = await file.text()
  const data = JSON.parse(text) as Backup
  if (data.app !== 'gym-local') throw new Error('Ficheiro de backup inválido.')

  const db = await getDB()
  const stores = ['members', 'plans', 'payments', 'attendances', 'settings'] as const
  const tx = db.transaction(stores, 'readwrite')
  await Promise.all(stores.map((s) => tx.objectStore(s).clear()))
  for (const m of data.members ?? []) await tx.objectStore('members').put(m)
  for (const p of data.plans ?? []) await tx.objectStore('plans').put(p)
  for (const p of data.payments ?? []) await tx.objectStore('payments').put(p)
  for (const a of data.attendances ?? []) await tx.objectStore('attendances').put(a)
  for (const s of data.settings ?? []) await tx.objectStore('settings').put(s)
  await tx.done
}
