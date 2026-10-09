import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Desenha um QR a partir de um valor. O valor é SEMPRE um token opaco
 * (ex.: "gymcheck:<uuid>") — nunca o nome ou dados pessoais do membro.
 * O QR fica sobre fundo branco (necessário para a leitura).
 */
export function QrImage({ value, size = 240 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size * 2,
      color: { dark: '#0b0f1a', light: '#ffffff' },
    })
      .then((url) => active && setDataUrl(url))
      .catch(() => active && setDataUrl(null))
    return () => {
      active = false
    }
  }, [value, size])

  return (
    <div className="rounded-3xl bg-white p-4 shadow-glow" style={{ width: size, height: size }}>
      {dataUrl ? (
        <img src={dataUrl} alt="QR Code" className="h-full w-full" />
      ) : (
        <div className="h-full w-full animate-pulse rounded-xl bg-slate-200" />
      )}
    </div>
  )
}
