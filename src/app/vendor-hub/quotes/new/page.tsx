import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import QuoteBuilder from './QuoteBuilder'
import type { Inquiry, Profile, Wedding, Vendor } from '@/lib/types/database'
import { EVENT_TYPE_LABELS } from '@/lib/utils'

export default async function NewQuotePage({
  searchParams,
}: {
  searchParams: Promise<{ inquiry_id?: string }>
}) {
  const { inquiry_id } = await searchParams
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

  if (!vendor) redirect('/vendor-hub/profile')

  if (!inquiry_id) notFound()

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select(
      '*, sender:profiles!inquiries_sent_by_fkey(full_name), wedding:weddings!inquiries_wedding_id_fkey(id, title, bride_name, groom_name)',
    )
    .eq('id', inquiry_id)
    .eq('vendor_id', vendor.id)
    .single()

  if (!inquiry) notFound()

  const inq = inquiry as Inquiry & {
    sender: Pick<Profile, 'full_name'> | null
    wedding: Pick<Wedding, 'id' | 'title' | 'bride_name' | 'groom_name'> | null
  }

  const eventLabel = inq.event_type
    ? EVENT_TYPE_LABELS[inq.event_type as keyof typeof EVENT_TYPE_LABELS] ?? inq.event_type
    : 'event'

  return (
    <div>
      <PageHeader
        title="Create Quote"
        subtitle={`For ${inq.sender?.full_name ?? 'the couple'} — ${inq.wedding?.title ?? ''} ${eventLabel}`}
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Inquiries', href: '/vendor-hub/inquiries' },
          { label: inq.sender?.full_name ?? 'Inquiry', href: `/vendor-hub/inquiries/${inquiry_id}` },
          { label: 'New Quote' },
        ]}
      />
      <div className="mt-6 pb-16">
        <QuoteBuilder
          inquiryId={inquiry_id}
          vendorId={vendor.id as string}
          weddingId={inq.wedding_id}
          coupleName={inq.sender?.full_name ?? 'The couple'}
          weddingTitle={inq.wedding?.title ?? ''}
          eventType={eventLabel}
          eventDate={inq.event_date}
          estimatedGuests={inq.estimated_guests}
        />
      </div>
    </div>
  )
}
