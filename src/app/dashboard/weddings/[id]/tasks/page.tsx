import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { Task, WeddingEvent } from '@/lib/types/database'
import TasksClient from './TasksClient'

export default async function TasksPage({
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

  const [{ data: tasks }, { data: events }] = await Promise.all([
    supabase
      .from('tasks')
      .select('*')
      .eq('wedding_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .returns<Task[]>(),
    supabase
      .from('wedding_events')
      .select('*')
      .eq('wedding_id', id)
      .order('event_date', { ascending: true })
      .returns<WeddingEvent[]>(),
  ])

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto">
      <TasksClient weddingId={id} tasks={tasks ?? []} events={events ?? []} />
    </div>
  )
}
