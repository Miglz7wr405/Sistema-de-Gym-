import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/AppShell'
import { Avatar, Card, MembershipBadge, Spinner } from '@/components/ui'
import { QrScanner } from '@/components/QrScanner'
import { useMembers } from '@/lib/queries'
import { verifyByMemberId, verifyCheckin } from '@/lib/checkin'
import { dateLabel } from '@/lib/format'
import type { CheckinResponse } from '@/lib/types'

type Mode = 'scan' | 'manual'

export default function AdminAttendance() {
  const [mode, setMode] = useState<Mode>('scan')
  const [result, setResult] = useState<CheckinResponse | null>(null)
  const [busy, setBusy] = useState(false)
  const qc = useQueryClient()

  async function handleToken(text: string) {
    if (busy) return
    setBusy(true)
    const res = await verifyCheckin(text)
    setResult(res)
    if (res.member) qc.invalidateQueries({ queryKey: ['attendances', res.member.id] })
    setBusy(false)
  }

  return (
    <>
      <PageHeader title="Presenças" subtitle="Lê o QR do membro à entrada" />

      <div className="mb-4 flex gap-2">
        <button
          className={mode === 'scan' ? 'btn-primary flex-1' : 'btn-ghost flex-1'}
          onClick={() => setMode('scan')}
        >
          📷 Câmara
        </button>
        <button
          className={mode === 'manual' ? 'btn-primary flex-1' : 'btn-ghost flex-1'}
          onClick={() => setMode('manual')}
        >
          🔎 Procurar nome
        </button>
      </div>

      {mode === 'scan' ? (
        <QrScanner onResult={handleToken} />
      ) : (
        <ManualSearch
          onPick={async (id) => {
            setBusy(true)
            setResult(await verifyByMemberId(id))
            setBusy(false)
          }}
        />
      )}

      {busy && <Spinner />}

      {result && <ResultSheet result={result} onClose={() => setResult(null)} />}
    </>
  )
}

function ResultSheet({
  result,
  onClose,
}: {
  result: CheckinResponse
  onClose: () => void
}) {
  const granted = result.result === 'granted'
  const notFound = result.result === 'not_found'

  const toneBg = notFound
    ? 'bg-slate-800'
    : granted
      ? 'bg-emerald-600'
      : 'bg-rose-600'

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 p-4 sm:items-center"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 text-center dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Foto em destaque — o porteiro confirma que é mesmo a pessoa */}
        {result.member && (
          <div className="mb-4 flex justify-center">
            <Avatar
              name={result.member.full_name}
              url={result.member.photo_url}
              size={110}
            />
          </div>
        )}

        {result.member ? (
          <>
            <h2 className="text-xl font-bold">{result.member.full_name}</h2>
            <div className="mt-2 flex justify-center">
              <MembershipBadge state={result.member.membership_state} />
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Válida até {dateLabel(result.member.valid_until)}
            </p>
          </>
        ) : (
          <h2 className="text-lg font-semibold text-slate-500">QR não reconhecido</h2>
        )}

        <div
          className={`mt-5 rounded-2xl ${toneBg} px-4 py-3 text-lg font-bold text-white`}
        >
          {notFound ? '❓ ' : granted ? '🟢 ' : '🔴 '}
          {result.message}
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
      <input
        className="input mb-3"
        placeholder="Procurar membro pelo nome…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      {members.isLoading ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {(members.data ?? []).map((m) => (
            <button
              key={m.id}
              className="w-full"
              onClick={() => onPick(m.id)}
            >
              <Card className="flex items-center gap-3 py-3 text-left">
                <Avatar name={m.full_name} url={m.photo_url} size={40} />
                <div>
                  <p className="font-semibold">{m.full_name}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
              </Card>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
