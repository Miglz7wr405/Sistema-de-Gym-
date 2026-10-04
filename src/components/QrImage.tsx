import { useEffect, useState } from 'react'
import QRCode from 'qrcode'

/**
 * Desenha um QR a partir de um valor. O valor passado é SEMPRE um token opaco
 * (ex.: "gymcheck:<uuid>") — nunca o nome ou dados pessoais do membro.
 */
export function QrImage({ value, size = 240 }: { value: string; size?: number }) {
  const [dataUrl, setDataUrl] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    QRCode.toDataURL(value, {
      errorCorrectionLevel: 'M',
      margin: 1,
      width: size * 2,
      color: { dark: '#0f172a', light: '#ffffff' },
    })
      .then((url) => active && setDataUrl(url))
      .catch(() => active && setDataUrl(null))
    return () => {
      active = false
    }
  }, [value, size])

  if (!dataUrl) {
    return (
      <div
        className="animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800"
        style={{ width: size, height: size }}
      />
    )
  }

  return (
    <img
      src={dataUrl}
      alt="QR Code"
      width={size}
      height={size}
      className="rounded-2xl bg-white p-3 shadow-sm"
      style={{ width: size, height: size }}
    />
  )
}
