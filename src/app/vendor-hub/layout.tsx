import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Vendor } from '@/lib/types/database'
import { VENDOR_CATEGORY_LABELS } from '@/lib/utils'

async function getVendorData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null, vendor: null, inquiryCount: 0 }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role, full_name')
    .eq('id', user.id)
    .single()

  if (!profile) return { user, profile: null, vendor: null, inquiryCount: 0 }

  const { data: vendor } = await supabase
    .from('vendors')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let inquiryCount = 0
  if (vendor) {
    const { count } = await supabase
      .from('inquiries')
      .select('*', { count: 'exact', head: true })
      .eq('vendor_id', vendor.id)
      .eq('status', 'sent')
    inquiryCount = count ?? 0
  }

  return { user, profile, vendor: vendor as Vendor | null, inquiryCount }
}

const navLinks = [
  { href: '/vendor-hub', label: 'Overview', icon: '▦' },
  { href: '/vendor-hub/profile', label: 'Profile', icon: '✎' },
  { href: '/vendor-hub/inquiries', label: 'Inquiries', icon: '✉' },
  { href: '/vendor-hub/quotes', label: 'Quotes', icon: '📋' },
  { href: '/vendor-hub/bookings', label: 'Bookings', icon: '📅' },
  { href: '/vendor-hub/payments', label: 'Payments', icon: '£' },
]

export default async function VendorHubLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, vendor, inquiryCount } = await getVendorData()

  if (!user) {
    redirect('/auth/login')
  }

  if (profile?.role === 'couple') {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex gap-8 py-8">
          {/* Sidebar */}
          <aside className="hidden lg:flex lg:flex-col lg:w-60 shrink-0">
            <div className="sticky top-8">
              {/* Business name */}
              <div className="mb-6 px-3">
                {vendor ? (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
                      Vendor Hub
                    </p>
                    <p
                      className="font-semibold text-gray-900 leading-tight truncate"
                      style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                      title={vendor.business_name}
                    >
                      {vendor.business_name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {VENDOR_CATEGORY_LABELS[vendor.category]}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-1">
                      Vendor Hub
                    </p>
                    <p className="text-sm text-gray-500 italic">Set up your profile</p>
                  </>
                )}
              </div>

              {/* No vendor banner */}
              {!vendor && (
                <div className="mb-4 rounded-lg bg-[#8B1D4F]/5 border border-[#8B1D4F]/20 p-3">
                  <p className="text-xs text-[#8B1D4F] font-medium mb-1">
                    Complete your profile
                  </p>
                  <p className="text-xs text-gray-600 mb-2">
                    Start receiving inquiries from couples by setting up your vendor profile.
                  </p>
                  <Link
                    href="/vendor-hub/profile"
                    className="text-xs font-medium text-[#8B1D4F] underline underline-offset-2 hover:text-[#7a1944]"
                  >
                    Get started →
                  </Link>
                </div>
              )}

              {/* Nav links */}
              <nav className="space-y-0.5" aria-label="Vendor hub navigation">
                {navLinks.map((link) => (
                  <SidebarLink
                    key={link.href}
                    href={link.href}
                    label={link.label}
                    icon={link.icon}
                    badge={link.label === 'Inquiries' && inquiryCount > 0 ? inquiryCount : undefined}
                  />
                ))}
              </nav>
            </div>
          </aside>

          {/* Mobile top nav */}
          <div className="lg:hidden w-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                {vendor ? (
                  <p className="font-semibold text-gray-900 truncate max-w-[200px]">
                    {vendor.business_name}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">Set up your profile</p>
                )}
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-2 mb-4 -mx-4 px-4 scrollbar-hide">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="shrink-0 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-[#8B1D4F]/30 hover:text-[#8B1D4F] transition-colors whitespace-nowrap"
                >
                  {link.label}
                  {link.label === 'Inquiries' && inquiryCount > 0 && (
                    <span className="ml-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#8B1D4F] text-[10px] font-bold text-white">
                      {inquiryCount}
                    </span>
                  )}
                </Link>
              ))}
            </div>

            {!vendor && (
              <div className="mb-4 rounded-lg bg-[#8B1D4F]/5 border border-[#8B1D4F]/20 p-3">
                <p className="text-sm text-[#8B1D4F] font-medium mb-1">Complete your profile</p>
                <p className="text-sm text-gray-600 mb-2">
                  Start receiving inquiries from couples by setting up your vendor profile.
                </p>
                <Link
                  href="/vendor-hub/profile"
                  className="text-sm font-medium text-[#8B1D4F] underline underline-offset-2 hover:text-[#7a1944]"
                >
                  Get started →
                </Link>
              </div>
            )}

            {children}
          </div>

          {/* Main content (desktop) */}
          <main className="hidden lg:block flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}

function SidebarLink({
  href,
  label,
  icon,
  badge,
}: {
  href: string
  label: string
  icon: string
  badge?: number
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#8B1D4F]/5 hover:text-[#8B1D4F] transition-colors duration-150"
    >
      <span className="flex items-center gap-2.5">
        <span className="text-base leading-none" aria-hidden="true">
          {icon}
        </span>
        {label}
      </span>
      {badge !== undefined && (
        <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8B1D4F] px-1 text-[10px] font-bold text-white">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  )
}
