import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'
import type { Quote, Wedding } from '@/lib/types/database'

type QuoteRow = Quote & {
  wedding: Pick<Wedding, 'title' | 'bride_name' | 'groom_name'> | null
}

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

export default async function VendorQuotesPage() {
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

  const { data: quotes } = await supabase
    .from('quotes')
    .select(
      '*, wedding:weddings!quotes_wedding_id_fkey(title, bride_name, groom_name)',
    )
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const activeQuotes = ((quotes as QuoteRow[] | null) ?? []).filter((q) =>
    ['draft', 'sent'].includes(q.status),
  )
  const closedQuotes = ((quotes as QuoteRow[] | null) ?? []).filter((q) =>
    ['accepted', 'declined', 'expired'].includes(q.status),
  )

  function QuoteCard({ quote }: { quote: QuoteRow }) {
    const coupleName = [quote.wedding?.bride_name, quote.wedding?.groom_name]
      .filter(Boolean)
      .join(' & ')

    return (
      <Link href={`/vendor-hub/quotes/${quote.id}`}>
        <Card hover>
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <p className="font-medium text-gray-900">
                  {quote.wedding?.title ?? 'Quote'}
                </p>
                {coupleName && (
                  <span className="text-sm text-gray-400">— {coupleName}</span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <QuoteStatusBadge status={quote.status} />
                <span className="text-xs text-gray-400">Sent {formatDate(quote.created_at)}</span>
                {quote.validity_date && (
                  <span className="text-xs text-gray-400">
                    Valid until {formatDate(quote.validity_date)}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <p
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {formatCurrency(quote.total_gbp * 100)}
              </p>
              <p className="text-xs text-gray-400">
                Deposit: {formatCurrency(quote.deposit_gbp * 100)}
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
        title="Quotes"
        subtitle="All quotes you have sent to couples."
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Quotes' },
        ]}
      />

      <div className="mt-6 space-y-8">
        {!quotes || quotes.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">📋</p>
            <p className="text-gray-700 font-medium mb-1">No quotes yet</p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              When you respond to an inquiry with a quote, it will appear here. Head to your
              inquiries inbox to get started.
            </p>
            <div className="mt-4">
              <Link href="/vendor-hub/inquiries">
                <span className="text-sm font-medium text-[#8B1D4F] hover:text-[#7a1944] underline underline-offset-2">
                  View inquiries →
                </span>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {activeQuotes.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
                  Active — {activeQuotes.length}
                </h2>
                <div className="space-y-3">
                  {activeQuotes.map((q) => (
                    <QuoteCard key={q.id} quote={q} />
                  ))}
                </div>
              </div>
            )}
            {closedQuotes.length > 0 && (
              <div>
                <h2 className="text-sm font-medium uppercase tracking-wider text-gray-400 mb-3">
                  Closed — {closedQuotes.length}
                </h2>
                <div className="space-y-3 opacity-70">
                  {closedQuotes.map((q) => (
                    <QuoteCard key={q.id} quote={q} />
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
