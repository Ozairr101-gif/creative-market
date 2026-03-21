import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, EVENT_TYPE_LABELS, VENDOR_CATEGORY_LABELS } from '@/lib/utils'
import type { Inquiry, Profile, Wedding, Vendor } from '@/lib/types/database'

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'sent':
      return <Badge variant="default" className="bg-blue-100 text-blue-700">New</Badge>
    case 'viewed':
      return <Badge variant="warning">Viewed</Badge>
    case 'responded':
      return <Badge variant="success">Responded</Badge>
    case 'declined':
      return <Badge variant="error">Declined</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export default async function VendorInquiryDetailPage({
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

  const { data: vendorRecord } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendorRecord) redirect('/vendor-hub/profile')

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select(
      '*, sender:profiles!inquiries_sent_by_fkey(full_name, phone), wedding:weddings!inquiries_wedding_id_fkey(id, title, bride_name, groom_name, estimated_guests, main_date)',
    )
    .eq('id', id)
    .eq('vendor_id', vendorRecord.id)
    .single()

  if (!inquiry) notFound()

  // Mark as viewed if it was just 'sent'
  if (inquiry.status === 'sent') {
    await supabase
      .from('inquiries')
      .update({ status: 'viewed', updated_at: new Date().toISOString() })
      .eq('id', id)
    revalidatePath(`/vendor-hub/inquiries/${id}`)
    revalidatePath('/vendor-hub/inquiries')
    revalidatePath('/vendor-hub')
  }

  // Get other bookings for this wedding (context)
  const { data: otherBookings } = await supabase
    .from('bookings')
    .select('id, vendor_id, vendor:vendors(business_name, category)')
    .eq('wedding_id', inquiry.wedding_id)
    .in('status', ['confirmed', 'deposit_paid', 'in_progress', 'completed'])
    .limit(5)

  const inq = inquiry as Inquiry & {
    sender: Pick<Profile, 'full_name' | 'phone'> | null
    wedding: Pick<Wedding, 'id' | 'title' | 'bride_name' | 'groom_name' | 'estimated_guests' | 'main_date'> | null
  }

  async function declineInquiry() {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: v } = await supabase
      .from('vendors')
      .select('id')
      .eq('user_id', user.id)
      .single()
    if (!v) return

    await supabase
      .from('inquiries')
      .update({ status: 'declined', updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('vendor_id', v.id)

    revalidatePath(`/vendor-hub/inquiries/${id}`)
    revalidatePath('/vendor-hub/inquiries')
    redirect('/vendor-hub/inquiries')
  }

  return (
    <div>
      <PageHeader
        title="Inquiry Details"
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Inquiries', href: '/vendor-hub/inquiries' },
          { label: inq.sender?.full_name ?? 'Inquiry' },
        ]}
      >
        <StatusBadge status={inq.status} />
      </PageHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Main inquiry details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>From {inq.sender?.full_name ?? 'A couple'}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm mb-5">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Event type</dt>
                  <dd className="font-medium text-gray-900">
                    {inq.event_type
                      ? EVENT_TYPE_LABELS[inq.event_type as keyof typeof EVENT_TYPE_LABELS] ??
                        inq.event_type
                      : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Preferred date</dt>
                  <dd className="font-medium text-gray-900">{formatDate(inq.event_date)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Estimated guests</dt>
                  <dd className="font-medium text-gray-900">
                    {inq.estimated_guests ? `~${inq.estimated_guests}` : '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Budget</dt>
                  <dd className="font-medium text-gray-900">
                    {inq.budget_gbp ? formatCurrency(inq.budget_gbp * 100) : 'Not specified'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Received</dt>
                  <dd className="font-medium text-gray-900">{formatDate(inq.created_at)}</dd>
                </div>
                {inq.sender?.phone && (
                  <div>
                    <dt className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Phone</dt>
                    <dd className="font-medium text-gray-900">{inq.sender.phone}</dd>
                  </div>
                )}
              </dl>

              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">Message</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {inq.message}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {inq.status !== 'declined' && (
            <div className="flex flex-wrap gap-3">
              {inq.status !== 'responded' && (
                <Link href={`/vendor-hub/quotes/new?inquiry_id=${id}`}>
                  <Button variant="primary" size="lg">
                    Create Quote
                  </Button>
                </Link>
              )}
              <form action={declineInquiry}>
                <Button
                  type="submit"
                  variant="secondary"
                  size="lg"
                  className="border-red-300 text-red-600 hover:bg-red-50"
                >
                  Decline inquiry
                </Button>
              </form>
            </div>
          )}

          {inq.status === 'declined' && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              You declined this inquiry. The couple has been notified.
            </div>
          )}

          {inq.status === 'responded' && (
            <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
              You&apos;ve already sent a quote for this inquiry.{' '}
              <Link href="/vendor-hub/quotes" className="underline font-medium">
                View your quotes →
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar: wedding context */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Wedding context</CardTitle>
            </CardHeader>
            <CardContent>
              {inq.wedding ? (
                <dl className="space-y-2 text-sm">
                  <div>
                    <dt className="text-xs text-gray-400 mb-0.5">Wedding</dt>
                    <dd className="font-medium text-gray-900">{inq.wedding.title}</dd>
                  </div>
                  {(inq.wedding.bride_name || inq.wedding.groom_name) && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Couple</dt>
                      <dd className="font-medium text-gray-900">
                        {[inq.wedding.bride_name, inq.wedding.groom_name]
                          .filter(Boolean)
                          .join(' & ')}
                      </dd>
                    </div>
                  )}
                  {inq.wedding.main_date && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Main date</dt>
                      <dd className="font-medium text-gray-900">
                        {formatDate(inq.wedding.main_date)}
                      </dd>
                    </div>
                  )}
                  {inq.wedding.estimated_guests && (
                    <div>
                      <dt className="text-xs text-gray-400 mb-0.5">Est. guests</dt>
                      <dd className="font-medium text-gray-900">
                        ~{inq.wedding.estimated_guests}
                      </dd>
                    </div>
                  )}
                </dl>
              ) : (
                <p className="text-sm text-gray-400">No wedding details available.</p>
              )}
            </CardContent>
          </Card>

          {otherBookings && otherBookings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Already booked</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 mb-3">
                  Other vendors confirmed for this wedding
                </p>
                <ul className="space-y-2">
                  {(otherBookings as unknown as Array<{ id: string; vendor: { business_name: string; category: string } | null }>).map((b) => (
                    <li key={b.id} className="text-sm text-gray-700 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span className="font-medium">{b.vendor?.business_name}</span>
                      <span className="text-gray-400">
                        ({b.vendor?.category
                          ? VENDOR_CATEGORY_LABELS[b.vendor.category as keyof typeof VENDOR_CATEGORY_LABELS] ?? b.vendor.category
                          : ''})
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
