import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, VENDOR_CATEGORY_LABELS, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Inquiry, Vendor, Quote } from '@/lib/types/database'

type InquiryRow = Inquiry & {
  vendor: Pick<Vendor, 'id' | 'business_name' | 'category' | 'slug' | 'profile_image_url'> | null
  quote: Pick<Quote, 'id' | 'status' | 'total_gbp'> | null
  booking: { id: string } | null
}

function InquiryStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'sent':
      return <Badge variant="default" className="bg-blue-100 text-blue-700">Awaiting reply</Badge>
    case 'viewed':
      return <Badge variant="warning">Vendor viewed</Badge>
    case 'responded':
      return <Badge variant="success">Quote received</Badge>
    case 'declined':
      return <Badge variant="error">Declined</Badge>
    case 'expired':
      return <Badge variant="default">Expired</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export default async function CoupleInquiriesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  // Get all inquiries sent by this user
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select(
      `id, vendor_id, wedding_id, sent_by, event_date, event_type, estimated_guests, message, budget_gbp, status, created_at, updated_at,
       vendor:vendors!inquiries_vendor_id_fkey(id, business_name, category, slug, profile_image_url)`,
    )
    .eq('sent_by', user.id)
    .order('created_at', { ascending: false })

  // For each inquiry, check if there's a quote and booking
  const inquiryIds = (inquiries ?? []).map((i: { id: string }) => i.id)
  const vendorIds = (inquiries ?? []).map((i: { vendor_id: string }) => i.vendor_id)

  const [{ data: quotes }, { data: bookings }] = await Promise.all([
    inquiryIds.length > 0
      ? supabase
          .from('quotes')
          .select('id, inquiry_id, status, total_gbp')
          .in('inquiry_id', inquiryIds)
      : { data: [] },
    vendorIds.length > 0
      ? supabase
          .from('bookings')
          .select('id, vendor_id, wedding_id, status')
          .in('vendor_id', vendorIds)
          .eq('wedding_id', (inquiries ?? [])[0]?.wedding_id ?? '')
          .limit(20)
      : { data: [] },
  ])

  const quoteByInquiry = Object.fromEntries(
    ((quotes ?? []) as Array<{ id: string; inquiry_id: string; status: string; total_gbp: number }>).map((q) => [
      q.inquiry_id,
      q,
    ]),
  )

  const bookingByVendorWedding = Object.fromEntries(
    ((bookings ?? []) as Array<{ id: string; vendor_id: string; wedding_id: string; status: string }>).map((b) => [
      `${b.vendor_id}:${b.wedding_id}`,
      b,
    ]),
  )

  const enrichedInquiries: InquiryRow[] = ((inquiries ?? []) as unknown as InquiryRow[]).map((inq) => ({
    ...inq,
    quote: (quoteByInquiry[inq.id] ?? null) as InquiryRow['quote'],
    booking: (bookingByVendorWedding[`${inq.vendor_id}:${inq.wedding_id}`] ?? null) as InquiryRow['booking'],
  }))

  const activeInquiries = enrichedInquiries.filter(
    (i) => !['declined', 'expired'].includes(i.status),
  )
  const closedInquiries = enrichedInquiries.filter((i) =>
    ['declined', 'expired'].includes(i.status),
  )

  return (
    <div>
      <PageHeader
        title="My Inquiries"
        subtitle="All the messages you've sent to vendors about your wedding."
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Inquiries' },
        ]}
      >
        <Link href="/vendors">
          <Button variant="primary" size="sm">
            Browse vendors
          </Button>
        </Link>
      </PageHeader>

      <div className="mt-6 space-y-8 pb-16">
        {enrichedInquiries.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-4">🌸</p>
            <p className="text-lg font-medium text-gray-900 mb-2">No inquiries yet</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
              Start browsing vendors to find your perfect team — photographers, caterers, mehndi
              artists, and so much more.
            </p>
            <Link href="/vendors">
              <Button variant="primary" size="lg">
                Browse vendors
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {activeInquiries.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
                  Active — {activeInquiries.length}
                </h2>
                <div className="space-y-3">
                  {activeInquiries.map((inq) => (
                    <InquiryCard key={inq.id} inquiry={inq} />
                  ))}
                </div>
              </div>
            )}

            {closedInquiries.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
                  Closed — {closedInquiries.length}
                </h2>
                <div className="space-y-3 opacity-70">
                  {closedInquiries.map((inq) => (
                    <InquiryCard key={inq.id} inquiry={inq} />
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

function InquiryCard({ inquiry }: { inquiry: InquiryRow }) {
  return (
    <Card>
      <div className="flex items-start gap-4">
        {/* Vendor avatar */}
        <div className="shrink-0">
          {inquiry.vendor?.profile_image_url ? (
            <img
              src={inquiry.vendor.profile_image_url}
              alt={inquiry.vendor.business_name}
              className="h-12 w-12 rounded-lg object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-[#8B1D4F]/10 flex items-center justify-center">
              <span className="text-xl">🎊</span>
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-1">
            <div>
              <p className="font-medium text-gray-900">
                {inquiry.vendor?.business_name ?? 'Vendor'}
              </p>
              {inquiry.vendor?.category && (
                <p className="text-xs text-gray-500">
                  {VENDOR_CATEGORY_LABELS[inquiry.vendor.category as keyof typeof VENDOR_CATEGORY_LABELS]}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <InquiryStatusBadge status={inquiry.status} />
            </div>
          </div>

          <p className="text-sm text-gray-500 mb-2">
            {inquiry.event_type
              ? EVENT_TYPE_LABELS[inquiry.event_type as keyof typeof EVENT_TYPE_LABELS] ??
                inquiry.event_type
              : 'Event type TBC'}
            {inquiry.event_date && ` · ${formatDate(inquiry.event_date)}`}
            {inquiry.estimated_guests && ` · ~${inquiry.estimated_guests} guests`}
            {inquiry.budget_gbp && ` · Budget: ${formatCurrency(inquiry.budget_gbp * 100)}`}
          </p>

          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{inquiry.message}</p>

          {/* Quote info */}
          {inquiry.quote && (
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <div className="rounded-md bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-sm">
                <span className="text-emerald-700 font-medium">
                  Quote received: {formatCurrency(inquiry.quote.total_gbp * 100)}
                </span>
              </div>
              {inquiry.booking && (
                <Badge variant="success">Booking confirmed</Badge>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            {inquiry.booking ? (
              <Link href={`/dashboard/bookings/${inquiry.booking.id}`}>
                <Button variant="primary" size="sm">
                  View booking →
                </Button>
              </Link>
            ) : inquiry.quote ? (
              <Link href={`/dashboard/quotes/${inquiry.quote.id}`}>
                <Button variant="primary" size="sm">
                  Review quote →
                </Button>
              </Link>
            ) : null}
            {inquiry.vendor?.slug && (
              <Link href={`/vendors/${inquiry.vendor.slug}`}>
                <Button variant="ghost" size="sm">
                  View vendor
                </Button>
              </Link>
            )}
            <time className="text-xs text-gray-400 ml-auto" dateTime={inquiry.created_at}>
              Sent {formatDate(inquiry.created_at)}
            </time>
          </div>
        </div>
      </div>
    </Card>
  )
}
