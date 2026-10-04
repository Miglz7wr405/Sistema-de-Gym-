import { supabase } from './supabase'
import type { CheckinResponse } from './types'

/**
 * Valida um QR/token chamando a Edge Function `checkin` (lado servidor).
 * O token nunca é validado no cliente — a função decide granted/expired.
 */
export async function verifyCheckin(token: string): Promise<CheckinResponse> {
  const { data, error } = await supabase.functions.invoke<CheckinResponse>('checkin', {
    body: { token },
  })
  if (error || !data) {
    return { result: 'not_found', message: 'Erro ao validar. Tenta novamente.' }
  }
  return data
}

/**
 * Check-in manual por id de membro (pesquisa pelo nome). Resolve o token do
 * membro e passa pela mesma Edge Function, para registar a presença igual.
 */
export async function verifyByMemberId(memberId: string): Promise<CheckinResponse> {
  const { data } = await supabase
    .from('member_tokens')
    .select('token')
    .eq('member_id', memberId)
    .maybeSingle()
  if (!data?.token) {
    return { result: 'not_found', message: 'Membro sem QR associado.' }
  }
  return verifyCheckin(data.token as string)
}
