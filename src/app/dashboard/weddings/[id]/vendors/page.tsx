import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Booking, Vendor, WeddingEvent, VendorShortlistEntry } from '@/lib/types/database'
import { formatCurrency, EVENT_TYPE_LABELS, VENDOR_CATEGORY_LABELS } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Store, CheckCircle2, BookmarkPlus } from 'lucide-react'

type BookingWithVendorAndEvent = Booking & {
  vendor: Vendor | null
  event: WeddingEvent | null
}

type ShortlistWithVendor = VendorShortlistEntry & {
  vendor: Vendor | null
}

const BOOKING_STATUS_CONFIG: Record<
  string,
  { label: string; variant: 'success' | 'warning' | 'error' | 'default' | 'gold' }
> = {
  confirmed: { label: 'Confirmed', variant: 'success' },
  deposit_paid: { label: 'Deposit Paid', variant: 'gold' },
  in_progress: { label: 'In Progress', variant: 'default' },
  completed: { label: 'Completed', variant: 'success' },
  cancelled: { label: 'Cancelled', variant: 'error' },
  disputed: { label: 'Disputed', variant: 'error' },
}

export default async function VendorsPage({
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
    .select('id, title')
    .eq('id', id)
    .single()

  if (!wedding) notFound()

  const [{ data: bookings }, { data: shortlist }] = await Promise.all([
    supabase
      .from('bookings')
      .select('*, vendor:vendors(*), event:wedding_events(*)')
      .eq('wedding_id', id)
      .order('created_at', { ascending: false })
      .returns<BookingWithVendorAndEvent[]>(),
    supabase
      .from('vendor_shortlist')
      .select('*, vendor:vendors(*)')
      .eq('wedding_id', id)
      .order('created_at', { ascending: false })
      .returns<ShortlistWithVendor[]>(),
  ])

  const confirmedBookings = (bookings ?? []).filter(
    (b) => b.status !== 'cancelled',
  )
  const shortlistItems = shortlist ?? []

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto space-y-10">
      {/* Confirmed Bookings */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Confirmed Bookings
            </h2>
            <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
              {confirmedBookings.length}
            </span>
          </div>
          <Link href="/vendors">
            <Button size="sm" variant="secondary">
              <Store size={13} />
              Browse Vendors
            </Button>
          </Link>
        </div>

        {confirmedBookings.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-emerald-100">
            <p className="text-gray-500 text-sm">No confirmed bookings yet.</p>
            <Link href="/vendors" className="mt-2 inline-block text-sm text-[#8B1D4F] font-medium hover:underline">
              Find vendors →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {confirmedBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))}
          </div>
        )}
      </section>

      {/* Shortlist */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BookmarkPlus size={18} className="text-[#C9973F]" />
          <h2 className="text-base font-semibold text-gray-900">Shortlist</h2>
          <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2 py-0.5">
            {shortlistItems.length}
          </span>
        </div>

        {shortlistItems.length === 0 ? (
          <div className="text-center py-12 rounded-2xl border-2 border-dashed border-[#C9973F]/20">
            <p className="text-gray-500 text-sm">No vendors shortlisted yet.</p>
            <Link href="/vendors" className="mt-2 inline-block text-sm text-[#8B1D4F] font-medium hover:underline">
              Browse vendors and save favourites →
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {shortlistItems.map((entry) =>
              entry.vendor ? (
                <ShortlistCard key={entry.id} entry={entry} />
              ) : null,
            )}
          </div>
        )}
      </section>
    </div>
  )
}

function BookingCard({ booking }: { booking: BookingWithVendorAndEvent }) {
  const config = BOOKING_STATUS_CONFIG[booking.status] ?? {
    label: booking.status,
    variant: 'default' as const,
  }

  return (
    <Card className="overflow-hidden">
      <div className="h-0.5 -mx-6 -mt-6 mb-4 bg-gradient-to-r from-[#8B1D4F] to-[#C9973F]" />

      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">
            {booking.vendor?.business_name ?? 'Unknown vendor'}
          </p>
          {booking.vendor?.category && (
            <p className="text-xs text-gray-500 mt-0.5">
              {VENDOR_CATEGORY_LABELS[booking.vendor.category]}
            </p>
          )}
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </div>

      {booking.event && (
        <p className="text-xs text-[#8B1D4F] mb-3">
          {EVENT_TYPE_LABELS[booking.event.type]}
          {booking.event.event_date &&
            ` · ${new Date(booking.event.event_date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
            })}`}
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-xs text-gray-400">Total</span>
          <p className="font-semibold text-gray-900">{formatCurrency(booking.total_gbp)}</p>
        </div>
        {booking.deposit_paid_gbp > 0 && (
          <div>
            <span className="text-xs text-gray-400">Deposit paid</span>
            <p className="font-medium text-emerald-700">{formatCurrency(booking.deposit_paid_gbp)}</p>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100">
        <Link
          href={`/dashboard/bookings/${booking.id}`}
          className="text-xs text-[#8B1D4F] font-medium hover:underline"
        >
          View booking details →
        </Link>
      </div>
    </Card>
  )
}

function ShortlistCard({ entry }: { entry: ShortlistWithVendor }) {
  const vendor = entry.vendor!
  return (
    <Card hover>
      <div className="flex items-start gap-3">
        {vendor.profile_image_url ? (
          <img
            src={vendor.profile_image_url}
            alt={vendor.business_name}
            className="w-12 h-12 rounded-lg object-cover shrink-0"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-[#8B1D4F]/10 flex items-center justify-center shrink-0 text-[#8B1D4F] font-bold text-lg">
            {vendor.business_name[0]}
          </div>
        )}
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{vendor.business_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{VENDOR_CATEGORY_LABELS[vendor.category]}</p>
          {entry.notes && (
            <p className="text-xs text-gray-400 mt-1 italic truncate">{entry.notes}</p>
          )}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-gray-100">
        <Link
          href={`/vendors/${vendor.slug}`}
          className="text-xs text-[#8B1D4F] font-medium hover:underline"
        >
          View profile →
        </Link>
      </div>
    </Card>
  )
}
