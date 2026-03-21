import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import type { BudgetItem, Wedding, WeddingEvent } from '@/lib/types/database'
import BudgetClient from './BudgetClient'

export default async function BudgetPage({
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

  const [{ data: wedding }, { data: items }, { data: events }] = await Promise.all([
    supabase.from('weddings').select('id, total_budget_gbp').eq('id', id).single<Pick<Wedding, 'id' | 'total_budget_gbp'>>(),
    supabase
      .from('budget_items')
      .select('*')
      .eq('wedding_id', id)
      .order('created_at', { ascending: true })
      .returns<BudgetItem[]>(),
    supabase
      .from('wedding_events')
      .select('*')
      .eq('wedding_id', id)
      .order('event_date', { ascending: true })
      .returns<WeddingEvent[]>(),
  ])

  if (!wedding) notFound()

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <BudgetClient
        weddingId={id}
        totalBudgetPence={wedding.total_budget_gbp ?? 0}
        items={items ?? []}
        events={events ?? []}
      />
    </div>
  )
}
