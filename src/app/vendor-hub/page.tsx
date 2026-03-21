import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, VENDOR_CATEGORY_LABELS, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Vendor, Booking, Inquiry, Profile } from '@/lib/types/database'

function getInquiryStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return <Badge variant="default" className="bg-blue-100 text-blue-700">New</Badge>
    case 'viewed':
      return <Badge variant="warning">Viewed</Badge>
    case 'responded':
      return <Badge variant="success">Responded</Badge>
    case 'declined':
      return <Badge variant="error">Declined</Badge>
    case 'expired':
      return <Badge variant="default">Expired</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

function getBookingStatusBadge(status: string) {
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
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export default async function VendorHubPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!vendor) {
    return (
      <div>
        <PageHeader
          title="Vendor Hub"
          subtitle="Your command centre for managing inquiries, quotes, and bookings."
        />
        <div className="mt-8">
          <Card className="max-w-xl mx-auto text-center py-12">
            <div className="text-4xl mb-4">🎊</div>
            <CardTitle className="text-xl mb-3">Welcome to Shaadi HQ for Vendors</CardTitle>
            <CardContent>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                You&apos;re one step away from connecting with hundreds of couples planning their
                dream weddings. Complete your vendor profile to start receiving inquiries.
              </p>
              <Link href="/vendor-hub/profile">
                <Button size="lg" variant="primary">
                  Complete your profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fetch stats
  const [
    { count: newInquiriesCount },
    { count: activeBookingsCount },
    { data: completedBookings },
    { data: recentInquiries },
    { data: recentBookings },
  ] = await Promise.all([
    supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('status', 'sent'),
    supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .in('status', ['confirmed', 'deposit_paid', 'in_progress']),
    supabase
      .from('bookings')
      .select('total_gbp')
      .eq('vendor_id', vendor.id)
      .eq('status', 'completed'),
    supabase
      .from('inquiries')
      .select('*, sender:profiles!inquiries_sent_by_fkey(full_name), wedding:weddings!inquiries_wedding_id_fkey(title)')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(5),
    supabase
      .from('bookings')
      .select('*, wedding:weddings!bookings_wedding_id_fkey(title), event:wedding_events(type, event_date)')
      .eq('vendor_id', vendor.id)
      .order('created_at', { ascending: false })
      .limit(5),
  ])

  const totalEarned = (completedBookings ?? []).reduce(
    (sum: number, b: { total_gbp: number }) => sum + (b.total_gbp ?? 0),
    0,
  )

  const stats = [
    {
      label: 'New Inquiries',
      value: newInquiriesCount ?? 0,
      href: '/vendor-hub/inquiries',
      highlight: (newInquiriesCount ?? 0) > 0,
    },
    {
      label: 'Active Bookings',
      value: activeBookingsCount ?? 0,
      href: '/vendor-hub/bookings',
      highlight: false,
    },
    {
      label: 'Total Earned',
      value: formatCurrency((totalEarned ?? 0) * 100),
      href: '/vendor-hub/payments',
      highlight: false,
    },
    {
      label: 'Rating',
      value: (vendor as Vendor & { avg_rating?: number }).avg_rating
        ? `${((vendor as Vendor & { avg_rating?: number }).avg_rating ?? 0).toFixed(1)} ★`
        : 'No reviews yet',
      href: '#',
      highlight: false,
    },
  ]

  return (
    <div>
      <PageHeader
        title={`Welcome back${vendor.business_name ? `, ${vendor.business_name.split(' ')[0]}` : ''}`}
        subtitle="Here&apos;s what&apos;s happening with your vendor account today."
      >
        <Link href="/vendor-hub/profile">
          <Button variant="secondary" size="sm">
            Edit Profile
          </Button>
        </Link>
        <Link href="/vendor-hub/inquiries">
          <Button variant="primary" size="sm">
            View Inquiries
          </Button>
        </Link>
      </PageHeader>

      <div className="mt-8 space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Link key={stat.label} href={stat.href}>
              <Card
                hover
                className={stat.highlight ? 'border-[#8B1D4F]/30 bg-[#8B1D4F]/5' : ''}
              >
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
                  {stat.label}
                </p>
                <p
                  className={`text-2xl font-bold ${stat.highlight ? 'text-[#8B1D4F]' : 'text-gray-900'}`}
                  style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  {stat.value}
                </p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent inquiries */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Inquiries</CardTitle>
              <Link
                href="/vendor-hub/inquiries"
                className="text-sm font-medium text-[#8B1D4F] hover:text-[#7a1944]"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentInquiries || recentInquiries.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  No inquiries yet — your profile is live and couples can discover you.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentInquiries.map((inquiry: Inquiry & {
                  sender?: { full_name: string } | null
                  wedding?: { title: string } | null
                }) => (
                  <div
                    key={inquiry.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {inquiry.sender?.full_name ?? 'A couple'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {inquiry.wedding?.title ?? 'Their wedding'} ·{' '}
                        {inquiry.event_type
                          ? EVENT_TYPE_LABELS[inquiry.event_type as keyof typeof EVENT_TYPE_LABELS] ?? inquiry.event_type
                          : 'Event TBC'}{' '}
                        · {formatDate(inquiry.event_date)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getInquiryStatusBadge(inquiry.status)}
                      <Link
                        href={`/vendor-hub/inquiries/${inquiry.id}`}
                        className="text-xs font-medium text-[#8B1D4F] hover:text-[#7a1944] whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Bookings</CardTitle>
              <Link
                href="/vendor-hub/bookings"
                className="text-sm font-medium text-[#8B1D4F] hover:text-[#7a1944]"
              >
                View all →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {!recentBookings || recentBookings.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 text-sm">
                  No bookings yet — they&apos;ll appear here once a couple accepts your quote.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recentBookings.map((booking: Booking & {
                  wedding?: { title: string } | null
                  event?: { type: string; event_date: string | null } | null
                }) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between py-3 gap-4"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {booking.wedding?.title ?? 'Booking'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {booking.event?.type
                          ? EVENT_TYPE_LABELS[booking.event.type as keyof typeof EVENT_TYPE_LABELS] ?? booking.event.type
                          : 'Event TBC'}{' '}
                        · {formatDate(booking.event?.event_date ?? null)} ·{' '}
                        {formatCurrency(booking.total_gbp * 100)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getBookingStatusBadge(booking.status)}
                      <Link
                        href={`/vendor-hub/bookings/${booking.id}`}
                        className="text-xs font-medium text-[#8B1D4F] hover:text-[#7a1944] whitespace-nowrap"
                      >
                        View →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
