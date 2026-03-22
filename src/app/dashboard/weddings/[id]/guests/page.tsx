import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { GuestListEntry } from '@/lib/types/database'
import GuestsClient from './GuestsClient'

export default async function GuestsPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('id')
    .eq('id', id)
    .single()

  if (!wedding) notFound()

  const { data: guests } = await supabase
    .from('guest_list')
    .select('*')
    .eq('wedding_id', id)
    .order('full_name', { ascending: true })
    .returns<GuestListEntry[]>()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <GuestsClient weddingId={id} guests={guests ?? []} />
    </div>
  )
}
