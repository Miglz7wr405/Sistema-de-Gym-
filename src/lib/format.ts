import { format, formatDistanceToNow } from 'date-fns'
import { pt } from 'date-fns/locale'

export function mzn(value: number | null | undefined): string {
  const n = Number(value ?? 0)
  return new Intl.NumberFormat('pt-PT', { maximumFractionDigits: 0 }).format(n) + ' MT'
}

export function dateLabel(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return format(new Date(iso.length === 10 ? iso + 'T00:00:00' : iso), 'dd/MM/yyyy', {
      locale: pt,
    })
  } catch {
    return '—'
  }
}

export function dateTimeLabel(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return format(new Date(iso), "dd/MM/yyyy 'às' HH:mm", { locale: pt })
  } catch {
    return '—'
  }
}

export function fromNow(iso: string | null | undefined): string {
  if (!iso) return '—'
  try {
    return formatDistanceToNow(new Date(iso), { locale: pt, addSuffix: true })
  } catch {
    return '—'
  }
}

const QUOTES = [
  'A consistência cria resultados. Continua.',
  'Um treino de cada vez. Hoje conta.',
  'O corpo alcança o que a mente acredita.',
  'Pequenos progressos ainda são progresso.',
  'Aparece. O resto vem depois.',
  'Disciplina é fazer mesmo sem vontade.',
  'Força não vem do que consegues fazer, mas do que superas.',
]

/** Frase motivacional estável por dia. */
export function quoteOfTheDay(date = new Date()): string {
  const dayIndex = Math.floor(date.getTime() / 86_400_000)
  return QUOTES[dayIndex % QUOTES.length]
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
