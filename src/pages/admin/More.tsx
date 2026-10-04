import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/AppShell'
import { Card } from '@/components/ui'
import { exportBackup, importBackup } from '@/lib/backup'

const SOON = [
  { icon: '🎉', label: 'Eventos' },
  { icon: '👨‍🏫', label: 'Instrutores' },
  { icon: '📅', label: 'Aulas' },
  { icon: '📈', label: 'Finanças' },
  { icon: '🔔', label: 'Notificações' },
]

export default function More() {
  const qc = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [msg, setMsg] = useState<string | null>(null)

  async function onImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importBackup(file)
      qc.invalidateQueries()
      setMsg('✅ Dados importados com sucesso.')
    } catch {
      setMsg('❌ Ficheiro inválido.')
    }
    e.target.value = ''
  }

  return (
    <>
      <PageHeader title="Mais" />

      <Link to="/planos">
        <Card className="mb-3 flex items-center gap-3 py-3.5">
          <span className="text-xl">🏷️</span>
          <span className="flex-1 font-medium">Planos</span>
          <span className="text-slate-300">›</span>
        </Card>
      </Link>

      <p className="mb-2 mt-5 text-sm font-semibold text-slate-500">Cópia de segurança</p>
      <Card className="mb-2">
        <p className="mb-3 text-xs text-slate-500">
          Os dados ficam guardados neste aparelho. Faz cópias regulares e usa a cópia para
          mudar de aparelho.
        </p>
        <div className="flex gap-2">
          <button className="btn-primary flex-1" onClick={() => exportBackup()}>
            ⬇️ Exportar
          </button>
          <button className="btn-ghost flex-1" onClick={() => fileRef.current?.click()}>
            ⬆️ Importar
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onImport}
        />
        {msg && <p className="mt-3 text-center text-sm">{msg}</p>}
      </Card>

      <p className="mb-2 mt-5 text-sm font-semibold text-slate-500">Em breve</p>
      <div className="space-y-2">
        {SOON.map((item) => (
          <div key={item.label} className="opacity-70">
            <Card className="flex items-center gap-3 py-3.5">
              <span className="text-xl">{item.icon}</span>
              <span className="flex-1 font-medium">{item.label}</span>
              <span className="badge bg-slate-100 text-slate-400 dark:bg-slate-800">
                em breve
              </span>
            </Card>
          </div>
        ))}
      </div>
    </>
  )
}
