import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import VendorProfileForm from './VendorProfileForm'
import type { Vendor } from '@/lib/types/database'

export default async function VendorProfilePage() {
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

  // Fetch event types if vendor exists
  let vendorEventTypes: string[] = []
  if (vendor) {
    const { data: evtTypes } = await supabase
      .from('vendor_event_types')
      .select('event_type')
      .eq('vendor_id', vendor.id)
    vendorEventTypes = (evtTypes ?? []).map((r: { event_type: string }) => r.event_type)
  }

  return (
    <div>
      <PageHeader
        title={vendor ? 'Edit Profile' : 'Set Up Your Profile'}
        subtitle={
          vendor
            ? 'Keep your listing up to date so couples can find and trust you.'
            : 'Create your vendor listing and start receiving inquiries from couples planning their dream weddings.'
        }
        breadcrumbs={[
          { label: 'Vendor Hub', href: '/vendor-hub' },
          { label: 'Profile' },
        ]}
      />
      <div className="mt-8 pb-16">
        <VendorProfileForm
          vendor={vendor as Vendor | null}
          vendorEventTypes={vendorEventTypes}
          userId={user.id}
        />
      </div>
    </div>
  )
}
