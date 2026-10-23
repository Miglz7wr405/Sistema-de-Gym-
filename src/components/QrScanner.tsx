import { useEffect, useRef, useState } from 'react'
import { BrowserQRCodeReader } from '@zxing/browser'
import { CameraOff } from 'lucide-react'

/**
 * Lê QR da câmara (traseira por omissão) e chama onResult(texto).
 * A câmara arranca UMA vez: o callback fica numa ref para que novos renders
 * não reiniciem o vídeo (isso impedia a leitura).
 */
export function QrScanner({
  onResult,
  cooldownMs = 3000,
}: {
  onResult: (text: string) => void
  cooldownMs?: number
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)
  const lastRef = useRef<{ text: string; at: number }>({ text: '', at: 0 })

  // Mantém sempre o callback mais recente sem reiniciar a câmara.
  const onResultRef = useRef(onResult)
  onResultRef.current = onResult
  const cooldownRef = useRef(cooldownMs)
  cooldownRef.current = cooldownMs

  useEffect(() => {
    const reader = new BrowserQRCodeReader()
    let controls: { stop: () => void } | null = null
    let cancelled = false

    const handle = (text: string) => {
      const now = Date.now()
      if (text === lastRef.current.text && now - lastRef.current.at < cooldownRef.current) return
      lastRef.current = { text, at: now }
      onResultRef.current(text)
    }

    async function start() {
      const video = videoRef.current
      if (!video) return
      try {
        // Câmara traseira (ideal para ler o QR à porta)
        controls = await reader.decodeFromConstraints(
          { video: { facingMode: { ideal: 'environment' } } },
          video,
          (result) => {
            if (result) handle(result.getText())
          },
        )
      } catch {
        try {
          // Fallback: câmara por omissão
          controls = await reader.decodeFromVideoDevice(undefined, video, (result) => {
            if (result) handle(result.getText())
          })
        } catch {
          if (!cancelled) setError('Não foi possível aceder à câmara. Permite o acesso no navegador.')
          return
        }
      }
      if (cancelled) controls?.stop()
    }

    start()
    return () => {
      cancelled = true
      controls?.stop()
    }
    // arranca uma única vez
  }, [])

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black">
      <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline autoPlay />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-52 w-52 rounded-3xl border-2 border-brand/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.45)]" />
      </div>
      {error && (
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-2 bg-rose-600 p-2.5 text-center text-xs font-medium text-white">
          <CameraOff size={14} /> {error}
        </div>
      )}
    </div>
  )
}
