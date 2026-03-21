import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, VENDOR_CATEGORY_LABELS, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Booking, Quote, QuoteLineItem, Vendor, Payment } from '@/lib/types/database'

const BOOKING_TIMELINE: Array<{ key: string; label: string; description: string }> = [
  { key: 'confirmed', label: 'Confirmed', description: 'Booking created' },
  { key: 'deposit_paid', label: 'Deposit Paid', description: 'Deposit received' },
  { key: 'in_progress', label: 'Service Delivered', description: 'Event day' },
  { key: 'completed', label: 'Complete', description: 'All done!' },
]

const STATUS_ORDER: Record<string, number> = {
  confirmed: 0,
  deposit_paid: 1,
  in_progress: 2,
  completed: 3,
  cancelled: -1,
  disputed: -1,
}

export default async function CoupleBookingDetailPage({
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

  // Fetch booking with vendor and wedding
  const { data: booking } = await supabase
    .from('bookings')
    .select(
      '*, vendor:vendors!bookings_vendor_id_fkey(id, business_name, category, profile_image_url, tagline, slug), wedding:weddings!bookings_wedding_id_fkey(id, title, created_by), event:wedding_events(type, name, event_date)',
    )
    .eq('id', id)
    .single()

  if (!booking) notFound()

  // Ensure couple owns this wedding
  const b = booking as Booking & {
    vendor: Pick<Vendor, 'id' | 'business_name' | 'category' | 'profile_image_url' | 'tagline' | 'slug'> | null
    wedding: { id: string; title: string; created_by: string } | null
    event: { type: string; name: string | null; event_date: string | null } | null
  }

  if (b.wedding?.created_by !== user.id) {
    // Check if user is a collaborator
    const { data: collab } = await supabase
      .from('wedding_collaborators')
      .select('id')
      .eq('wedding_id', b.wedding_id)
      .eq('user_id', user.id)
      .single()
    if (!collab) notFound()
  }

  // Fetch the quote
  const { data: quote } = b.quote_id
    ? await supabase
        .from('quotes')
        .select('*')
        .eq('id', b.quote_id)
        .single()
    : { data: null }

  const q = quote as Quote | null

  // Fetch payments
  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('booking_id', id)
    .order('created_at', { ascending: true })

  const currentStatusOrder = STATUS_ORDER[b.status] ?? 0

  return (
    <div>
      <PageHeader
        title={b.vendor?.business_name ?? 'Booking'}
        subtitle={
          b.vendor?.category
            ? VENDOR_CATEGORY_LABELS[b.vendor.category as keyof typeof VENDOR_CATEGORY_LABELS]
            : undefined
        }
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Bookings', href: '/dashboard/bookings' },
          { label: b.vendor?.business_name ?? 'Booking' },
        ]}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-3 pb-16">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vendor card */}
          <Card>
            <CardHeader>
              <CardTitle>Your vendor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                {b.vendor?.profile_image_url ? (
                  <img
                    src={b.vendor.profile_image_url}
                    alt={b.vendor.business_name}
                    className="h-16 w-16 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-[#8B1D4F]/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">🎊</span>
                  </div>
                )}
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 text-lg leading-tight">
                    {b.vendor?.business_name}
                  </p>
                  {b.vendor?.category && (
                    <p className="text-sm text-gray-500 mb-1">
                      {VENDOR_CATEGORY_LABELS[b.vendor.category as keyof typeof VENDOR_CATEGORY_LABELS]}
                    </p>
                  )}
                  {b.vendor?.tagline && (
                    <p className="text-sm text-gray-600 italic">&ldquo;{b.vendor.tagline}&rdquo;</p>
                  )}
                  {b.vendor?.slug && (
                    <Link
                      href={`/vendors/${b.vendor.slug}`}
                      className="text-xs text-[#8B1D4F] font-medium hover:text-[#7a1944] mt-1 inline-block"
                    >
                      View profile →
                    </Link>
                  )}
                </div>
              </div>

              {b.event && (
                <div className="mt-4 border-t border-gray-100 pt-4 flex flex-wrap gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Event</p>
                    <p className="font-medium text-gray-900">
                      {b.event.name ??
                        (b.event.type
                          ? EVENT_TYPE_LABELS[b.event.type as keyof typeof EVENT_TYPE_LABELS] ??
                            b.event.type
                          : 'TBC')}
                    </p>
                  </div>
                  {b.event.event_date && (
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Date</p>
                      <p className="font-medium text-gray-900">{formatDate(b.event.event_date)}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Wedding</p>
                    <p className="font-medium text-gray-900">{b.wedding?.title}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking status timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Booking progress</CardTitle>
            </CardHeader>
            <CardContent>
              {b.status === 'cancelled' || b.status === 'disputed' ? (
                <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <p className="font-medium mb-0.5">
                    Booking {b.status === 'cancelled' ? 'cancelled' : 'disputed'}
                  </p>
                  {b.cancelled_reason && (
                    <p className="text-red-600">{b.cancelled_reason}</p>
                  )}
                  {b.cancelled_at && (
                    <p className="text-xs text-red-400 mt-1">{formatDate(b.cancelled_at)}</p>
                  )}
                </div>
              ) : (
                <ol className="relative flex flex-col gap-0">
                  {BOOKING_TIMELINE.map((step, idx) => {
                    const isDone = currentStatusOrder > idx
                    const isCurrent = currentStatusOrder === idx
                    const isUpcoming = currentStatusOrder < idx

                    return (
                      <li key={step.key} className="flex gap-4 pb-6 last:pb-0 relative">
                        {/* Connector line */}
                        {idx < BOOKING_TIMELINE.length - 1 && (
                          <div
                            className={`absolute left-3.5 top-7 bottom-0 w-0.5 ${
                              isDone ? 'bg-[#8B1D4F]' : 'bg-gray-200'
                            }`}
                          />
                        )}
                        {/* Dot */}
                        <div
                          className={`relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ring-2 ring-white ${
                            isDone
                              ? 'bg-[#8B1D4F] text-white'
                              : isCurrent
                              ? 'bg-[#8B1D4F] text-white ring-[#8B1D4F]/20 ring-4'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {isDone ? '✓' : idx + 1}
                        </div>
                        <div className="pt-0.5">
                          <p
                            className={`text-sm font-medium ${
                              isDone || isCurrent ? 'text-gray-900' : 'text-gray-400'
                            }`}
                          >
                            {step.label}
                            {isCurrent && (
                              <span className="ml-2 text-xs font-normal text-[#8B1D4F]">
                                ← Current
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-gray-400">{step.description}</p>
                        </div>
                      </li>
                    )
                  })}
                </ol>
              )}
            </CardContent>
          </Card>

          {/* Quote breakdown */}
          {q && (
            <Card>
              <CardHeader>
                <CardTitle>Quote breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto -mx-6">
                  <table className="w-full text-sm min-w-[400px]">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 pl-6">
                          Item
                        </th>
                        <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 w-12">
                          Qty
                        </th>
                        <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 w-24 pr-6">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {(q.line_items as QuoteLineItem[]).map((item, idx) => (
                        <tr key={idx}>
                          <td className="py-2.5 pl-6 text-gray-900">{item.description}</td>
                          <td className="py-2.5 text-right text-gray-500">{item.quantity}</td>
                          <td className="py-2.5 text-right font-medium text-gray-900 pr-6">
                            {formatCurrency(item.total_gbp * 100)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-gray-200">
                        <td colSpan={2} className="pt-3 pl-6 text-right text-sm text-gray-500">
                          Subtotal
                        </td>
                        <td className="pt-3 text-right font-medium pr-6">
                          {formatCurrency(q.subtotal_gbp * 100)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={2} className="pt-1 pl-6 text-right text-xs text-gray-400">
                          Platform fee (2%)
                        </td>
                        <td className="pt-1 text-right text-gray-500 text-xs pr-6">
                          {formatCurrency(q.platform_fee_gbp * 100)}
                        </td>
                      </tr>
                      <tr className="border-t border-gray-200">
                        <td colSpan={2} className="pt-3 pb-3 pl-6 text-right font-bold text-gray-900">
                          Total
                        </td>
                        <td className="pt-3 pb-3 text-right font-bold text-[#8B1D4F] pr-6">
                          {formatCurrency(q.total_gbp * 100)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {q.notes && (
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Notes from vendor
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{q.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Payments */}
          <Card>
            <CardHeader>
              <CardTitle>Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Deposit info */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Total</p>
                  <p className="font-bold text-gray-900 text-lg">
                    {formatCurrency(b.total_gbp * 100)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Deposit required</p>
                  <p className="font-semibold text-[#C9973F]">
                    {formatCurrency(b.deposit_gbp * 100)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Deposit paid</p>
                  <p className={`font-semibold ${b.deposit_paid_gbp >= b.deposit_gbp ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {formatCurrency(b.deposit_paid_gbp * 100)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Balance</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(b.balance_gbp * 100)}
                  </p>
                </div>
                {q?.deposit_due_date && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Deposit due</p>
                    <p className="font-medium text-gray-900">{formatDate(q.deposit_due_date)}</p>
                  </div>
                )}
                {q?.balance_due_date && (
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">Balance due</p>
                    <p className="font-medium text-gray-900">{formatDate(q.balance_due_date)}</p>
                  </div>
                )}
              </div>

              {/* Payment history */}
              {payments && payments.length > 0 && (
                <div className="border-t border-gray-100 pt-4 mb-4">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">
                    Payment history
                  </p>
                  <div className="space-y-2">
                    {(payments as Payment[]).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2 text-sm"
                      >
                        <div>
                          <p className="font-medium text-gray-900 capitalize">
                            {payment.description ?? payment.type}
                          </p>
                          {payment.paid_at && (
                            <p className="text-xs text-gray-400">{formatDate(payment.paid_at)}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            {formatCurrency(payment.amount_gbp * 100)}
                          </p>
                          <Badge
                            variant={
                              payment.status === 'paid'
                                ? 'success'
                                : payment.status === 'pending'
                                ? 'warning'
                                : payment.status === 'failed'
                                ? 'error'
                                : 'default'
                            }
                          >
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pay deposit CTA */}
              {b.deposit_paid_gbp < b.deposit_gbp && b.status !== 'cancelled' && (
                <div className="rounded-xl border-2 border-dashed border-[#C9973F]/40 bg-[#C9973F]/5 p-5 text-center">
                  <p className="text-sm font-medium text-gray-800 mb-1">
                    Secure your booking with a deposit
                  </p>
                  <p className="text-sm text-gray-600 mb-3">
                    Pay {formatCurrency(b.deposit_gbp * 100)} to lock in{' '}
                    {b.vendor?.business_name} for your big day.
                  </p>
                  <Button variant="gold" size="lg" disabled className="w-full sm:w-auto">
                    Pay deposit — {formatCurrency(b.deposit_gbp * 100)}
                  </Button>
                  <p className="mt-3 text-xs text-gray-400">
                    Secure deposit payment powered by Stripe — launching soon. We&apos;ll notify you
                    when online payments go live.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notes */}
          {(b.vendor_notes || b.couple_notes) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {b.vendor_notes && (
                  <div className="mb-3">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                      From vendor
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{b.vendor_notes}</p>
                  </div>
                )}
                {b.couple_notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">
                      Your notes
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{b.couple_notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Booking summary</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-400">Status</dt>
                  <dd>
                    <Badge
                      variant={
                        b.status === 'completed'
                          ? 'success'
                          : b.status === 'cancelled' || b.status === 'disputed'
                          ? 'error'
                          : b.status === 'deposit_paid'
                          ? 'warning'
                          : 'default'
                      }
                      className={
                        b.status === 'confirmed' || b.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-700'
                          : ''
                      }
                    >
                      {b.status.replace('_', ' ')}
                    </Badge>
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Total</dt>
                  <dd className="font-semibold text-gray-900">{formatCurrency(b.total_gbp * 100)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Deposit</dt>
                  <dd className="font-semibold text-[#C9973F]">{formatCurrency(b.deposit_gbp * 100)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Balance</dt>
                  <dd className="font-semibold text-gray-700">{formatCurrency(b.balance_gbp * 100)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-400">Booked</dt>
                  <dd className="text-gray-700">{formatDate(b.created_at)}</dd>
                </div>
                {b.contract_url && (
                  <div className="pt-2">
                    <a
                      href={b.contract_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-medium text-[#8B1D4F] underline underline-offset-2 hover:text-[#7a1944]"
                    >
                      View contract →
                    </a>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {b.wedding && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Part of</CardTitle>
              </CardHeader>
              <CardContent>
                <Link
                  href={`/dashboard/weddings/${b.wedding.id}`}
                  className="text-sm font-medium text-[#8B1D4F] hover:text-[#7a1944]"
                >
                  {b.wedding.title} →
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
