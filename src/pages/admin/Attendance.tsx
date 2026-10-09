import { useCallback, useState } from 'react'
import { ScanLine, Search, CheckCircle2, XCircle, HelpCircle } from 'lucide-react'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, Spinner, StatusPill } from '@/components/ui'
import { QrScanner } from '@/components/QrScanner'
import { useMembers, useActions } from '@/lib/store'
import { dateLabel } from '@/lib/format'
import type { CheckinResponse } from '@/lib/types'

type Mode = 'scan' | 'manual'

export default function AdminAttendance() {
  const [mode, setMode] = useState<Mode>('scan')
  const [result, setResult] = useState<CheckinResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const actions = useActions()

  const handleToken = useCallback(
    async (text: string) => {
      setBusy(true)
      setResult(await actions.verifyToken(text))
      setBusy(false)
    },
    [actions],
  )

  return (
    <>
      <PageHeader title="Entradas" subtitle="Lê o QR do membro à porta" />

      <div className="mb-4 flex gap-2">
        <button className={mode === 'scan' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setMode('scan')}>
          <ScanLine size={18} /> Câmara
        </button>
        <button className={mode === 'manual' ? 'btn-primary flex-1' : 'btn-ghost flex-1'} onClick={() => setMode('manual')}>
          <Search size={18} /> Por nome
        </button>
      </div>

      {mode === 'scan' ? (
        <QrScanner onResult={handleToken} />
      ) : (
        <ManualSearch
          onPick={async (id) => {
            setBusy(true)
            setResult(await actions.verifyByMemberId(id))
            setBusy(false)
          }}
        />
      )}

      {busy && <Spinner />}
      {result && <ResultSheet result={result} onClose={() => setResult(null)} />}
    </>
  )
}

function ResultSheet({ result, onClose }: { result: CheckinResponse; onClose: () => void }) {
  const granted = result.result === 'granted'
  const notFound = result.result === 'not_found'
  const tone = notFound ? 'bg-slate-700' : granted ? 'bg-lime text-ink-950' : 'bg-rose-600'
  const Icon = notFound ? HelpCircle : granted ? CheckCircle2 : XCircle

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/75 p-3 backdrop-blur-sm sm:items-center" onClick={onClose}>
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-ink-850 p-6 text-center" onClick={(e) => e.stopPropagation()}>
        {result.member && (
          <div className="mb-4 flex justify-center">
            <Avatar name={result.member.full_name} url={result.member.photo} size={128} />
          </div>
        )}
        {result.member ? (
          <>
            <h2 className="text-2xl font-bold">{result.member.full_name}</h2>
            <div className="mt-2 flex justify-center">
              <StatusPill profile={result.member} />
            </div>
            <p className="mt-1 text-xs text-slate-500">Válido até {dateLabel(result.member.valid_until)}</p>
          </>
        ) : (
          <h2 className="text-lg font-semibold text-slate-400">QR não reconhecido</h2>
        )}

        <div className={`mt-5 flex items-center justify-center gap-2 rounded-2xl ${tone} px-4 py-3.5 text-lg font-bold ${granted ? '' : 'text-white'}`}>
          <Icon size={22} /> {result.message}
        </div>

        <button className="btn-ghost mt-4 w-full" onClick={onClose}>
          Ler próximo
        </button>
      </div>
    </div>
  )
}

function ManualSearch({ onPick }: { onPick: (memberId: string) => void }) {
  const [search, setSearch] = useState('')
  const members = useMembers(search)
  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
        <input className="input pl-10" placeholder="Procurar membro pelo nome…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>
      {members.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {(members.data ?? []).map((m) => (
            <button key={m.id} className="w-full" onClick={() => onPick(m.id)}>
              <Card className="flex items-center gap-3 py-3 text-left">
                <Avatar name={m.full_name} url={m.photo} size={42} />
                <div className="flex-1">
                  <p className="font-semibold">{m.full_name}</p>
                  <p className="text-xs text-slate-400">{m.phone || '—'}</p>
                </div>
                <StatusPill profile={m} />
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
