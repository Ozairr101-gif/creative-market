import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import type { Wedding } from '@/lib/types/database'
import { formatShortDate } from '@/lib/utils'
import { CalendarDays } from 'lucide-react'

const tabs = [
  { label: 'Overview', href: '' },
  { label: 'Events', href: '/events' },
  { label: 'Vendors', href: '/vendors' },
  { label: 'Tasks', href: '/tasks' },
  { label: 'Budget', href: '/budget' },
  { label: 'Guests', href: '/guests' },
]

export default async function WeddingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const { data: wedding } = await supabase
    .from('weddings')
    .select('*')
    .eq('id', id)
    .single<Wedding>()

  if (!wedding) notFound()

  const baseHref = `/dashboard/weddings/${id}`

  return (
    <div>
      {/* Wedding sub-header */}
      <div className="bg-white border-b border-[#8B1D4F]/10 sticky top-16 z-20">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Wedding name + date */}
          <div className="py-3 flex items-center gap-3">
            <div>
              <h2
                className="text-base font-semibold text-gray-900 leading-tight"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                {wedding.title}
              </h2>
              {wedding.main_date && (
                <p className="text-xs text-[#C9973F] font-medium flex items-center gap-1 mt-0.5">
                  <CalendarDays size={11} />
                  {formatShortDate(wedding.main_date)}
                </p>
              )}
            </div>
          </div>

          {/* Tab navigation */}
          <nav className="-mb-px flex gap-0 overflow-x-auto scrollbar-none">
            {tabs.map((tab) => {
              const href = baseHref + tab.href
              return (
                <TabLink key={tab.href} href={href} label={tab.label} baseHref={baseHref} tabHref={tab.href} />
              )
            })}
          </nav>
        </div>
      </div>

      {children}
    </div>
  )
}

// TabLink needs to be a server component but we need to know if it's active.
// We use a client wrapper to read the pathname.
import WeddingTabLink from './WeddingTabLink'

function TabLink({
  href,
  label,
  baseHref,
  tabHref,
}: {
  href: string
  label: string
  baseHref: string
  tabHref: string
}) {
  return <WeddingTabLink href={href} label={label} baseHref={baseHref} tabHref={tabHref} />
}
