import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { VENDOR_CATEGORY_LABELS } from '@/lib/utils'
import type { Vendor, Profile } from '@/lib/types/database'
import InquireForm from './InquireForm'

export default async function InquireVendorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: vendor } = await supabase
    .from('vendors')
    .select('id, business_name, slug, category, tagline, profile_image_url, status')
    .eq('slug', slug)
    .eq('status', 'active')
    .single()

  if (!vendor) notFound()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: Pick<Profile, 'id' | 'role' | 'full_name'> | null = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('id, role, full_name')
      .eq('id', user.id)
      .single()
    profile = data
  }

  // Vendors can't send inquiries
  if (profile?.role === 'vendor') {
    return (
      <div>
        <PageHeader
          title={`Inquire with ${vendor.business_name}`}
          breadcrumbs={[
            { label: 'Vendors', href: '/vendors' },
            { label: vendor.business_name, href: `/vendors/${slug}` },
            { label: 'Inquire' },
          ]}
        />
        <div className="mt-8 max-w-lg mx-auto text-center">
          <Card>
            <CardContent>
              <p className="text-4xl mb-4">🌸</p>
              <p className="font-medium text-gray-900 mb-2">
                Vendors can&apos;t send inquiries
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Only couples planning their weddings can send inquiries. If you&apos;re a couple,
                please sign in with your couple account.
              </p>
              <Link href={`/vendors/${slug}`}>
                <Button variant="secondary" size="sm">
                  Back to profile
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Not logged in
  if (!user || !profile) {
    return (
      <div>
        <PageHeader
          title={`Inquire with ${vendor.business_name}`}
          subtitle={VENDOR_CATEGORY_LABELS[vendor.category as keyof typeof VENDOR_CATEGORY_LABELS]}
          breadcrumbs={[
            { label: 'Vendors', href: '/vendors' },
            { label: vendor.business_name, href: `/vendors/${slug}` },
            { label: 'Inquire' },
          ]}
        />
        <div className="mt-8 max-w-lg mx-auto text-center">
          <Card>
            <CardContent>
              <p className="text-4xl mb-4">✉️</p>
              <p className="font-semibold text-gray-900 mb-2 text-lg">
                Sign in to send an inquiry
              </p>
              <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
                Create a free account or sign in to send your inquiry to{' '}
                <strong>{vendor.business_name}</strong>. They typically respond within 48 hours.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href={`/auth/login?redirect=/vendors/${slug}/inquire`}>
                  <Button variant="primary">Sign in</Button>
                </Link>
                <Link href={`/auth/signup?redirect=/vendors/${slug}/inquire`}>
                  <Button variant="secondary">Create account</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Fetch weddings for the logged-in couple
  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, title, main_date')
    .eq('created_by', user.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <PageHeader
        title={`Inquire with ${vendor.business_name}`}
        subtitle={`${VENDOR_CATEGORY_LABELS[vendor.category as keyof typeof VENDOR_CATEGORY_LABELS]} — they typically respond within 48 hours`}
        breadcrumbs={[
          { label: 'Vendors', href: '/vendors' },
          { label: vendor.business_name, href: `/vendors/${slug}` },
          { label: 'Send inquiry' },
        ]}
      />
      <div className="mt-6 pb-16">
        <InquireForm
          vendor={vendor as Vendor}
          userId={user.id}
          weddings={(weddings ?? []) as { id: string; title: string; main_date: string | null }[]}
        />
      </div>
    </div>
  )
}
