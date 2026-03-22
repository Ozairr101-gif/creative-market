import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Quote, QuoteLineItem, Booking } from '@/lib/types/database'

function QuoteStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'draft':
      return <Badge variant="default">Draft</Badge>
    case 'sent':
      return <Badge variant="default" className="bg-blue-100 text-blue-700">Sent</Badge>
    case 'accepted':
      return <Badge variant="success">Accepted</Badge>
    case 'declined':
      return <Badge variant="error">Declined</Badge>
    case 'expired':
      return <Badge variant="default">Expired</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export default async function VendorQuoteDetailPage({
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

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!vendor) redirect('/vendor-hub/profile')

  const { data: quote } = await supabase
    .from('quotes')
    .select('*, wedding:weddings!quotes_wedding_id_fkey(id, title, bride_name, groom_name)')
    .eq('id', id)
    .eq('vendor_id', vendor.id)
    .single()

  if (!quote) notFound()

  // Check for linked booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('id, status')
    .eq('quote_id', id)
    .single()

  const q = quote as Quote & {
    wedding: { id: string; title: string; bride_name: string | null; groom_name: string | null } | null
  }
  const b = booking as Pick<Booking, 'id' | 'status'> | null

  return (
    <div>
      <PageHeader
        title="Quote Details"
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Quotes', href: '/vendor-hub/quotes' },
          { label: q.wedding?.title ?? 'Quote' },
        ]}
      >
        <QuoteStatusBadge status={q.status} />
      </PageHeader>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Quote breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {/* Wedding context */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle>
                  {q.wedding?.title ?? 'Quote'}
                  {(q.wedding?.bride_name || q.wedding?.groom_name) && (
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      — {[q.wedding.bride_name, q.wedding.groom_name].filter(Boolean).join(' & ')}
                    </span>
                  )}
                </CardTitle>
                <p className="text-xs text-gray-400">Sent {formatDate(q.created_at)}</p>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Status</p>
                  <QuoteStatusBadge status={q.status} />
                </div>
                {q.validity_date && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Valid until</p>
                    <p className="font-medium text-gray-900">{formatDate(q.validity_date)}</p>
                  </div>
                )}
                {q.deposit_due_date && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Deposit due</p>
                    <p className="font-medium text-gray-900">{formatDate(q.deposit_due_date)}</p>
                  </div>
                )}
                {q.balance_due_date && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-0.5">Balance due</p>
                    <p className="font-medium text-gray-900">{formatDate(q.balance_due_date)}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Line items */}
          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto -mx-6">
                <table className="w-full text-sm min-w-[480px] px-6">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 pl-6">
                        Description
                      </th>
                      <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 w-16">
                        Qty
                      </th>
                      <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 w-28">
                        Unit price
                      </th>
                      <th className="text-right text-xs font-medium uppercase tracking-wider text-gray-400 pb-2 w-28 pr-6">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {(q.line_items as QuoteLineItem[]).map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3 pl-6 text-gray-900">{item.description}</td>
                        <td className="py-3 text-right text-gray-600">{item.quantity}</td>
                        <td className="py-3 text-right text-gray-600">
                          {formatCurrency(item.unit_price_gbp * 100)}
                        </td>
                        <td className="py-3 text-right font-medium text-gray-900 pr-6">
                          {formatCurrency(item.total_gbp * 100)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="pt-3 pl-6 text-right text-sm text-gray-500">
                        Subtotal
                      </td>
                      <td className="pt-3 text-right font-medium text-gray-900 pr-6">
                        {formatCurrency(q.subtotal_gbp * 100)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="pt-1 pl-6 text-right text-sm text-gray-400">
                        Platform fee (2%)
                      </td>
                      <td className="pt-1 text-right text-gray-500 pr-6">
                        {formatCurrency(q.platform_fee_gbp * 100)}
                      </td>
                    </tr>
                    <tr className="border-t border-gray-200">
                      <td colSpan={3} className="pt-3 pb-3 pl-6 text-right text-base font-bold text-gray-900">
                        Total
                      </td>
                      <td className="pt-3 pb-3 text-right text-base font-bold text-[#8B1D4F] pr-6">
                        {formatCurrency(q.total_gbp * 100)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="pt-1 pl-6 text-right text-sm text-gray-500">
                        Deposit
                      </td>
                      <td className="pt-1 text-right font-semibold text-[#C9973F] pr-6">
                        {formatCurrency(q.deposit_gbp * 100)}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="pt-1 pb-3 pl-6 text-right text-sm text-gray-500">
                        Balance
                      </td>
                      <td className="pt-1 pb-3 text-right font-semibold text-gray-700 pr-6">
                        {formatCurrency((q.total_gbp - q.deposit_gbp) * 100)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {(q.notes || q.terms) && (
            <Card>
              <CardHeader>
                <CardTitle>Notes &amp; Terms</CardTitle>
              </CardHeader>
              <CardContent>
                {q.notes && (
                  <div className="mb-4">
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Notes to couple
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {q.notes}
                    </p>
                  </div>
                )}
                {q.terms && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-gray-400 mb-1.5">
                      Terms &amp; conditions
                    </p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                      {q.terms}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Actions for sent quotes */}
          {q.status === 'sent' && (
            <div className="flex gap-3">
              <Link href={`/vendor-hub/quotes/new?inquiry_id=${q.inquiry_id}`}>
                <Button variant="secondary" size="sm">
                  Edit / resend quote
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Booking link if accepted */}
          {b && (
            <Card className="border-emerald-200 bg-emerald-50">
              <CardHeader>
                <CardTitle className="text-emerald-800 text-base">Booking confirmed</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-emerald-700 mb-3">
                  The couple accepted this quote. A booking has been created.
                </p>
                <Link href={`/vendor-hub/bookings/${b.id}`}>
                  <Button variant="primary" size="sm" className="w-full bg-emerald-700 hover:bg-emerald-800">
                    View booking →
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {/* Quote status help */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">About this quote</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  <strong className="text-gray-900">Reference:</strong>{' '}
                  <code className="bg-gray-100 px-1 rounded text-xs">{q.id.slice(0, 8).toUpperCase()}</code>
                </p>
                <p>
                  <strong className="text-gray-900">Created:</strong> {formatDate(q.created_at)}
                </p>
                <p>
                  <strong className="text-gray-900">Last updated:</strong> {formatDate(q.updated_at)}
                </p>
              </div>
              {q.status === 'sent' && !b && (
                <p className="mt-3 text-xs text-gray-400">
                  Waiting for the couple to review and accept. You&apos;ll be notified when they respond.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
