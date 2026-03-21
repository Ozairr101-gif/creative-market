'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function WeddingTabLink({
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
  const pathname = usePathname()

  // Active: exact match for overview (tabHref === ''), prefix match for others
  const isActive =
    tabHref === ''
      ? pathname === baseHref || pathname === baseHref + '/'
      : pathname.startsWith(baseHref + tabHref)

  return (
    <Link
      href={href}
      className={cn(
        'whitespace-nowrap px-4 py-2.5 text-sm font-medium border-b-2 transition-colors',
        isActive
          ? 'border-[#8B1D4F] text-[#8B1D4F]'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
      )}
    >
      {label}
    </Link>
  )
}
