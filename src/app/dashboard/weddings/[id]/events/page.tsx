import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { WeddingEvent } from '@/lib/types/database'
import EventsClient from './EventsClient'

export default async function EventsPage({
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

  const { data: events } = await supabase
    .from('wedding_events')
    .select('*')
    .eq('wedding_id', id)
    .order('event_date', { ascending: true })
    .returns<WeddingEvent[]>()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <EventsClient weddingId={id} events={events ?? []} />
    </div>
  )
}
