import { supabase } from './supabase'
import type { Plan } from './types'

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/**
 * Confirma um pagamento: regista em `payments` e estende a validade da
 * mensalidade. A nova validade parte da maior data entre hoje e a validade
 * atual (não se perdem dias se renovar cedo). Admin only (garantido por RLS).
 */
export async function confirmPayment(opts: {
  memberId: string
  plan: Plan
  method?: string
  createdBy: string
}): Promise<{ validUntil: string; receiptNo: string }> {
  const today = new Date().toISOString().slice(0, 10)

  const { data: current } = await supabase
    .from('memberships')
    .select('valid_until')
    .eq('member_id', opts.memberId)
    .maybeSingle()

  const base =
    current?.valid_until && current.valid_until > today ? current.valid_until : today
  const validUntil = addDays(base, opts.plan.duration_days)

  const { data: payment, error: payErr } = await supabase
    .from('payments')
    .insert({
      member_id: opts.memberId,
      plan_id: opts.plan.id,
      amount_mzn: opts.plan.price_mzn,
      method: opts.method ?? 'Dinheiro',
      valid_until: validUntil,
      created_by: opts.createdBy,
    })
    .select('receipt_no')
    .single()
  if (payErr) throw payErr

  const { error: memErr } = await supabase
    .from('memberships')
    .upsert(
      { member_id: opts.memberId, plan_id: opts.plan.id, valid_until: validUntil },
      { onConflict: 'member_id' },
    )
  if (memErr) throw memErr

  return { validUntil, receiptNo: payment.receipt_no as string }
}
