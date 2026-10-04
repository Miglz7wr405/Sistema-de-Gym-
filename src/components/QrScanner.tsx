import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'

/**
 * Lê QR da câmara e chama onResult(texto) uma vez por leitura.
 * Ignora leituras repetidas durante `cooldownMs` para evitar duplicados.
 */
export function QrScanner({
  onResult,
  cooldownMs = 2500,
}: {
  onResult: (text: string) => void
  cooldownMs?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const lastRef = useRef<{ text: string; at: number }>({ text: '', at: 0 })

  useEffect(() => {
    const reader = new BrowserQRCodeReader()
    let controls: { stop: () => void } | null = null
    let cancelled = false

    reader
      .decodeFromVideoDevice(undefined, videoRef.current!, (result) => {
        if (!result) return
        const text = result.getText()
        const now = Date.now()
        if (text === lastRef.current.text && now - lastRef.current.at < cooldownMs) return
        lastRef.current = { text, at: now }
        onResult(text)
      })
      .then((c) => {
        if (cancelled) c.stop()
        else controls = c
      })
      .catch(() => {
        setError('Não foi possível aceder à câmara. Verifica as permissões.')
      })

    return () => {
      cancelled = true
      controls?.stop()
    }
  }, [onResult, cooldownMs])

  return (
    <div className="relative overflow-hidden rounded-2xl bg-black">
      <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-48 w-48 rounded-2xl border-2 border-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]" />
      </div>
      {error && (
        <div className="absolute inset-x-0 bottom-0 bg-rose-600 p-2 text-center text-xs text-white">
          {error}
        </div>
      )}
    </div>
  )
}
