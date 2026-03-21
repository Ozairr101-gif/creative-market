import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Booking, Wedding } from '@/lib/types/database'

function BookingStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'confirmed':
      return <Badge variant="default" className="bg-blue-100 text-blue-700">Confirmed</Badge>
    case 'deposit_paid':
      return <Badge variant="warning">Deposit Paid</Badge>
    case 'in_progress':
      return <Badge variant="gold">In Progress</Badge>
    case 'completed':
      return <Badge variant="success">Completed</Badge>
    case 'cancelled':
      return <Badge variant="error">Cancelled</Badge>
    case 'disputed':
      return <Badge variant="error">Disputed</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

function DepositStatusBadge({ depositPaid, depositRequired }: { depositPaid: number; depositRequired: number }) {
  if (depositPaid >= depositRequired && depositRequired > 0) {
    return <Badge variant="success">Deposit paid</Badge>
  }
  if (depositPaid > 0) {
    return <Badge variant="warning">Partial deposit</Badge>
  }
  return <Badge variant="default">Deposit pending</Badge>
}

export default async function VendorBookingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/vendor-hub/profile')

  const { data: bookings } = await supabase
    .from('bookings')
    .select(
      '*, wedding:weddings!bookings_wedding_id_fkey(title, bride_name, groom_name), event:wedding_events(type, name, event_date)',
    )
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  type BookingRow = Booking & {
    wedding: Pick<Wedding, 'title' | 'bride_name' | 'groom_name'> | null
    event: { type: string; name: string | null; event_date: string | null } | null
  }

  const activeBookings = (bookings as BookingRow[] | null)?.filter((b) =>
    ['confirmed', 'deposit_paid', 'in_progress'].includes(b.status),
  ) ?? []
  const pastBookings = (bookings as BookingRow[] | null)?.filter((b) =>
    ['completed', 'cancelled', 'disputed'].includes(b.status),
  ) ?? []

  function BookingCard({ booking }: { booking: BookingRow }) {
    const coupleName = [booking.wedding?.bride_name, booking.wedding?.groom_name]
      .filter(Boolean)
      .join(' & ')

    return (
      <Link href={`/vendor-hub/bookings/${booking.id}`}>
        <Card hover>
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">
                  {booking.wedding?.title ?? 'Booking'}
                </p>
                {coupleName && (
                  <span className="text-sm text-gray-400">— {coupleName}</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {booking.event?.type
                  ? EVENT_TYPE_LABELS[booking.event.type as keyof typeof EVENT_TYPE_LABELS] ?? booking.event.type
                  : 'Event TBC'}
                {booking.event?.event_date && ` · ${formatDate(booking.event.event_date)}`}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <BookingStatusBadge status={booking.status} />
                <DepositStatusBadge
                  depositPaid={booking.deposit_paid_gbp}
                  depositRequired={booking.deposit_gbp}
                />
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {formatCurrency(booking.total_gbp * 100)}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Deposit: {formatCurrency(booking.deposit_gbp * 100)}
              </p>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="All confirmed bookings from couples who accepted your quotes."
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Bookings' },
        ]}
      />

      <div className="mt-6 space-y-8">
        {!bookings || bookings.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-gray-700 font-medium mb-1">No bookings yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              Bookings appear here once a couple accepts one of your quotes. Keep responding to
              inquiries to grow your calendar.
            </p>
          </div>
        ) : (
          <>
            {activeBookings.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
                  Active — {activeBookings.length}
                </h2>
                <div className="space-y-3">
                  {activeBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}

            {pastBookings.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
                  Past — {pastBookings.length}
                </h2>
                <div className="space-y-3">
                  {pastBookings.map((b) => (
                    <BookingCard key={b.id} booking={b} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
