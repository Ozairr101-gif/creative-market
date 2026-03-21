import { cn } from '@/lib/utils'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

interface BreadcrumbItem {
  label: string
  href?: string
}

interface PageHeaderProps {
  title: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  className?: string
  children?: React.ReactNode
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  className,
  children,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        'border-b border-[#8B1D4F]/10 bg-[#FAF7F5] py-8 sm:py-10',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumbs */}
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-3">
            <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500" role="list">
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1
                return (
                  <li key={index} className="flex items-center gap-1">
                    {index > 0 && (
                      <ChevronRight
                        size={14}
                        className="text-gray-300 shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    {crumb.href && !isLast ? (
                      <Link
                        href={crumb.href}
                        className="hover:text-[#8B1D4F] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span
                        className={cn(isLast && 'text-gray-800 font-medium')}
                        aria-current={isLast ? 'page' : undefined}
                      >
                        {crumb.label}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          </nav>
        )}

        {/* Title + optional actions */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900 sm:text-3xl leading-tight"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-base text-gray-500 max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {children && (
            <div className="flex shrink-0 items-center gap-3">{children}</div>
          )}
        </div>
      </div>
    </div>
  )
}
