import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDate, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Inquiry, Profile, Wedding } from '@/lib/types/database'

type InquiryRow = Inquiry & {
  sender: Pick<Profile, 'full_name'> | null
  wedding: Pick<Wedding, 'title'> | null
}

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
    case 'expired':
      return <Badge variant="default">Expired</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export default async function VendorInquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>
}) {
  const { filter } = await searchParams
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

  let query = supabase
    .from('inquiries')
    .select(
      'id, vendor_id, wedding_id, event_id, sent_by, event_date, event_type, estimated_guests, message, budget_gbp, status, vendor_note, created_at, updated_at, sender:profiles!inquiries_sent_by_fkey(full_name), wedding:weddings!inquiries_wedding_id_fkey(title)',
    )
    .eq('vendor_id', vendor.id)
    .order('created_at', { ascending: false })

  const activeFilter = filter ?? 'all'
  if (activeFilter === 'new') query = query.eq('status', 'sent')
  else if (activeFilter === 'responded') query = query.in('status', ['responded', 'viewed'])
  else if (activeFilter === 'declined') query = query.eq('status', 'declined')

  const { data: inquiries } = await query

  const tabs = [
    { key: 'all', label: 'All' },
    { key: 'new', label: 'New' },
    { key: 'responded', label: 'Responded' },
    { key: 'declined', label: 'Declined' },
  ]

  return (
    <div>
      <PageHeader
        title="Inquiries"
        subtitle="Couples interested in booking you for their special day."
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Inquiries' },
        ]}
      />

      <div className="mt-6">
        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          {tabs.map((tab) => (
            <Link
              key={tab.key}
              href={`/vendor-hub/inquiries${tab.key !== 'all' ? `?filter=${tab.key}` : ''}`}
              className={
                activeFilter === tab.key
                  ? 'border-b-2 border-[#8B1D4F] px-4 py-2 text-sm font-medium text-[#8B1D4F] -mb-px'
                  : 'px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700'
              }
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Inquiries list */}
        {!inquiries || inquiries.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-3xl mb-3">✉️</p>
            <p className="text-gray-700 font-medium mb-1">
              {activeFilter === 'new'
                ? 'No new inquiries right now'
                : activeFilter === 'declined'
                ? 'No declined inquiries'
                : activeFilter === 'responded'
                ? 'No responded inquiries yet'
                : 'No inquiries yet'}
            </p>
            <p className="text-sm text-gray-500 max-w-xs mx-auto">
              {activeFilter === 'all'
                ? 'Once couples discover your profile and send inquiries, they&apos;ll appear here.'
                : 'Switch to "All" to see your full inbox.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {(inquiries as unknown as InquiryRow[]).map((inquiry) => (
              <Card key={inquiry.id} hover className="group">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900">
                        {inquiry.sender?.full_name ?? 'A couple'}
                      </p>
                      <StatusBadge status={inquiry.status} />
                      {inquiry.status === 'sent' && (
                        <span className="h-2 w-2 rounded-full bg-blue-500 inline-block" aria-label="Unread" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {inquiry.wedding?.title ?? 'Their wedding'} ·{' '}
                      {inquiry.event_type
                        ? EVENT_TYPE_LABELS[inquiry.event_type as keyof typeof EVENT_TYPE_LABELS] ??
                          inquiry.event_type
                        : 'Event type TBC'}{' '}
                      {inquiry.event_date && `· ${formatDate(inquiry.event_date)}`}
                      {inquiry.estimated_guests && ` · ~${inquiry.estimated_guests} guests`}
                    </p>
                    <p className="text-sm text-gray-500 line-clamp-2">{inquiry.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-3 shrink-0">
                    <time className="text-xs text-gray-400" dateTime={inquiry.created_at}>
                      {formatDate(inquiry.created_at)}
                    </time>
                    <Link href={`/vendor-hub/inquiries/${inquiry.id}`}>
                      <Button variant="secondary" size="sm">
                        View &amp; Respond
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
