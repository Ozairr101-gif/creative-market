import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Wedding, WeddingEvent, Task, Booking } from '@/lib/types/database'
import { formatDate, formatShortDate, formatCurrency, EVENT_TYPE_LABELS, EVENT_TYPE_COLORS } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  CalendarDays,
  Users,
  CheckCircle2,
  PiggyBank,
  CalendarPlus,
  Store,
  ListChecks,
  CircleDot,
} from 'lucide-react'

export default async function WeddingOverviewPage({
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
    .select('*')
    .eq('id', id)
    .single<Wedding>()

  if (!wedding) notFound()

  const [
    { data: events },
    { data: tasks },
    { data: bookings },
    { data: budgetItems },
  ] = await Promise.all([
    supabase
      .from('wedding_events')
      .select('*')
      .eq('wedding_id', id)
      .order('event_date', { ascending: true })
      .returns<WeddingEvent[]>(),
    supabase
      .from('tasks')
      .select('*')
      .eq('wedding_id', id)
      .returns<Task[]>(),
    supabase
      .from('bookings')
      .select('*')
      .eq('wedding_id', id)
      .returns<Booking[]>(),
    supabase
      .from('budget_items')
      .select('*')
      .eq('wedding_id', id)
      .returns<{ estimated_gbp: number; actual_gbp: number }[]>(),
  ])

  const allEvents = events ?? []
  const allTasks = tasks ?? []
  const allBookings = bookings ?? []
  const allBudgetItems = budgetItems ?? []

  const now = new Date()
  const upcomingEvents = allEvents
    .filter((e) => e.event_date && new Date(e.event_date) >= now)
    .slice(0, 3)

  const pendingTasks = allTasks.filter((t) => t.status === 'todo').slice(0, 5)
  const confirmedBookings = allBookings.filter(
    (b) => b.status === 'confirmed' || b.status === 'deposit_paid',
  ).length

  const tasksRemaining = allTasks.filter((t) => t.status !== 'done').length

  const totalBudgetPence = wedding.total_budget_gbp ?? 0
  const actualSpendPence = allBudgetItems.reduce((s, i) => s + i.actual_gbp, 0)
  const budgetPct = totalBudgetPence > 0 ? Math.min(100, (actualSpendPence / totalBudgetPence) * 100) : 0

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-8">
      {/* Wedding Details Card */}
      <Card>
        <CardHeader>
          <CardTitle style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
            {wedding.title}
          </CardTitle>
          {wedding.bride_name && wedding.groom_name && (
            <p className="text-sm text-[#8B1D4F] font-medium mt-0.5">
              {wedding.bride_name} & {wedding.groom_name}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            {wedding.main_date && (
              <div className="flex items-center gap-2">
                <CalendarDays size={15} className="text-[#C9973F]" />
                <span className="text-sm text-gray-700">{formatDate(wedding.main_date)}</span>
              </div>
            )}
            {wedding.estimated_guests && (
              <div className="flex items-center gap-2">
                <Users size={15} className="text-[#C9973F]" />
                <span className="text-sm text-gray-700">{wedding.estimated_guests.toLocaleString()} guests</span>
              </div>
            )}
            {totalBudgetPence > 0 && (
              <div className="flex items-center gap-2">
                <PiggyBank size={15} className="text-[#C9973F]" />
                <span className="text-sm text-gray-700">{formatCurrency(totalBudgetPence)} budget</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          label="Events"
          value={allEvents.length}
          icon={<CalendarDays size={18} className="text-[#8B1D4F]" />}
        />
        <StatCard
          label="Confirmed bookings"
          value={confirmedBookings}
          icon={<CheckCircle2 size={18} className="text-emerald-600" />}
        />
        <StatCard
          label="Tasks remaining"
          value={tasksRemaining}
          icon={<ListChecks size={18} className="text-amber-600" />}
        />
        <StatCard
          label="Budget spent"
          value={`${Math.round(budgetPct)}%`}
          icon={<PiggyBank size={18} className="text-[#C9973F]" />}
          sub={totalBudgetPence > 0 ? `of ${formatCurrency(totalBudgetPence)}` : undefined}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Link href={`/dashboard/weddings/${id}/events`} className="text-xs text-[#8B1D4F] font-medium hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-400 text-sm italic">No upcoming events yet.</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${EVENT_TYPE_COLORS[event.type]}`}
                    >
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                    <div className="flex-1 min-w-0">
                      {event.name && (
                        <p className="text-sm font-medium text-gray-800 truncate">{event.name}</p>
                      )}
                      {event.venue_name && (
                        <p className="text-xs text-gray-500 truncate">{event.venue_name}</p>
                      )}
                    </div>
                    {event.event_date && (
                      <span className="text-xs text-[#C9973F] font-medium shrink-0">
                        {formatShortDate(event.event_date)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Tasks */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Pending Tasks</CardTitle>
              <Link href={`/dashboard/weddings/${id}/tasks`} className="text-xs text-[#8B1D4F] font-medium hover:underline">
                View all
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {pendingTasks.length === 0 ? (
              <p className="text-gray-400 text-sm italic">All caught up!</p>
            ) : (
              <div className="space-y-2">
                {pendingTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-3">
                    <CircleDot
                      size={14}
                      className={
                        task.priority === 'high'
                          ? 'text-red-500'
                          : task.priority === 'medium'
                          ? 'text-amber-500'
                          : 'text-gray-400'
                      }
                    />
                    <p className="text-sm text-gray-700 flex-1 truncate">{task.title}</p>
                    {task.due_date && (
                      <span className="text-xs text-gray-400 shrink-0">
                        {formatShortDate(task.due_date)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-4">
          Quick actions
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link href={`/dashboard/weddings/${id}/events`}>
            <Button variant="secondary" size="sm">
              <CalendarPlus size={14} />
              Add Event
            </Button>
          </Link>
          <Link href={`/vendors`}>
            <Button variant="secondary" size="sm">
              <Store size={14} />
              Browse Vendors
            </Button>
          </Link>
          <Link href={`/dashboard/weddings/${id}/tasks`}>
            <Button variant="secondary" size="sm">
              <ListChecks size={14} />
              Add Task
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  sub,
}: {
  label: string
  value: number | string
  icon: React.ReactNode
  sub?: string
}) {
  return (
    <Card className="text-center">
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#FAF7F5] flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          {sub && <p className="text-xs text-gray-400">{sub}</p>}
        </div>
      </div>
    </Card>
  )
}
