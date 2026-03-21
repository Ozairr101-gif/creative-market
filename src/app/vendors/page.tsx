import Link from 'next/link'
import { MapPin, Star, Shield, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { PageHeader } from '@/components/shared/page-header'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import {
  cn,
  VENDOR_CATEGORY_LABELS,
  VENDOR_CATEGORY_ICONS,
  VENDOR_CATEGORIES,
  formatCurrencyRange,
  UK_CITIES,
} from '@/lib/utils'
import type { Vendor, VendorCategory } from '@/lib/types/database'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Find Wedding Vendors — Shaadi HQ',
  description:
    'Browse 2,000+ verified Asian wedding vendors. Venues, caterers, photographers, mehndi artists and more across the UK.',
}

interface VendorCardProps {
  vendor: Vendor
}

function VendorCard({ vendor }: VendorCardProps) {
  const categoryLabel = VENDOR_CATEGORY_LABELS[vendor.category]
  const categoryIcon = VENDOR_CATEGORY_ICONS[vendor.category]

  return (
    <Link
      href={`/vendors/${vendor.slug}`}
      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded-xl"
    >
      <Card
        hover
        className="p-0 overflow-hidden h-full flex flex-col"
      >
        {/* Image / gradient placeholder */}
        <div className="relative aspect-square w-full overflow-hidden rounded-t-xl">
          {vendor.profile_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.profile_image_url}
              alt={vendor.business_name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div
              className="h-full w-full flex items-center justify-center text-5xl"
              style={{
                background: `linear-gradient(135deg, rgba(139,29,79,0.12) 0%, rgba(201,151,63,0.15) 100%)`,
              }}
              aria-hidden="true"
            >
              {categoryIcon}
            </div>
          )}
          {/* Verified badge overlay */}
          {vendor.verified && (
            <div className="absolute top-2.5 right-2.5">
              <span
                className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold shadow-sm"
                style={{
                  backgroundColor: 'rgba(201,151,63,0.92)',
                  color: 'white',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <Shield size={10} aria-hidden="true" />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Card body */}
        <div className="flex flex-col flex-1 p-4 gap-2">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-semibold text-gray-900 text-base leading-snug group-hover:text-[#8B1D4F] transition-colors"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              {vendor.business_name}
            </h3>
          </div>

          {/* Category badge */}
          <div>
            <Badge className="text-[10px]">
              {categoryIcon} {categoryLabel}
            </Badge>
          </div>

          {/* Service areas */}
          {vendor.service_areas && vendor.service_areas.length > 0 && (
            <div className="flex items-center gap-1 text-xs text-gray-500 flex-wrap">
              <MapPin size={11} className="shrink-0 text-[#8B1D4F]/60" aria-hidden="true" />
              {vendor.service_areas.slice(0, 2).join(', ')}
              {vendor.service_areas.length > 2 && (
                <span className="text-gray-400">+{vendor.service_areas.length - 2}</span>
              )}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Footer row: price + rating */}
          <div className="flex items-center justify-between pt-2 border-t border-[#8B1D4F]/08">
            <span className="text-sm font-semibold text-[#8B1D4F]">
              {formatCurrencyRange(vendor.price_from_gbp, vendor.price_to_gbp)}
            </span>
            <span
              className="inline-flex items-center gap-1 text-xs font-medium rounded-full px-2 py-0.5"
              style={{
                backgroundColor: 'rgba(201,151,63,0.12)',
                color: '#9a711e',
              }}
            >
              <Star size={10} aria-hidden="true" />
              {(vendor as Vendor & { avg_rating?: number }).avg_rating
                ? String((vendor as Vendor & { avg_rating?: number }).avg_rating!.toFixed(1))
                : '5.0 (New)'}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function VendorsPage({ searchParams }: Props) {
  const { category, area, q, price } = await searchParams

  const supabase = await createClient()

  // Build query
  let query = supabase
    .from('vendors')
    .select('*')
    .eq('status', 'active')
    .order('featured', { ascending: false })
    .order('created_at', { ascending: false })

  if (category && typeof category === 'string' && VENDOR_CATEGORIES.includes(category as VendorCategory)) {
    query = query.eq('category', category)
  }

  if (area && typeof area === 'string') {
    query = query.contains('service_areas', [area])
  }

  if (q && typeof q === 'string' && q.trim()) {
    query = query.ilike('business_name', `%${q.trim()}%`)
  }

  // Price filter (values are in GBP pounds, DB stores pence)
  if (price === 'under_1000') {
    query = query.lt('price_from_gbp', 100000)
  } else if (price === '1000_5000') {
    query = query.gte('price_from_gbp', 100000).lte('price_from_gbp', 500000)
  } else if (price === 'over_5000') {
    query = query.gt('price_from_gbp', 500000)
  }

  const { data: vendors } = await query

  const activeVendors: Vendor[] = vendors ?? []
  const activeCategory = (category && VENDOR_CATEGORIES.includes(category as VendorCategory))
    ? (category as VendorCategory)
    : null

  return (
    <main className="min-h-screen bg-[#FAF7F5]">
      <PageHeader
        title="Find Your Perfect Wedding Vendors"
        subtitle="Browse verified specialists for every part of your Asian wedding — from mehndi artists to grand venues."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Vendors' }]}
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar filters ────────────────────────────────────────── */}
          <aside className="w-full lg:w-64 shrink-0">
            <div
              className="rounded-2xl p-5 sticky top-4"
              style={{
                backgroundColor: 'white',
                border: '1px solid rgba(139,29,79,0.08)',
                boxShadow: '0 1px 4px 0 rgba(139,29,79,0.06)',
              }}
            >
              {/* Search */}
              <div className="mb-5">
                <label htmlFor="search-input" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Search
                </label>
                <form method="GET" action="/vendors">
                  {/* Preserve other params */}
                  {category && <input type="hidden" name="category" value={String(category)} />}
                  {area && <input type="hidden" name="area" value={String(area)} />}
                  {price && <input type="hidden" name="price" value={String(price)} />}
                  <input
                    id="search-input"
                    name="q"
                    type="search"
                    defaultValue={typeof q === 'string' ? q : ''}
                    placeholder="Business name…"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-[#8B1D4F] focus:outline-none focus:ring-1 focus:ring-[#8B1D4F]"
                  />
                </form>
              </div>

              {/* Category */}
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Category
                </p>
                <nav className="space-y-0.5">
                  <Link
                    href="/vendors"
                    className={cn(
                      'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                      !activeCategory
                        ? 'bg-[#8B1D4F] text-white font-semibold'
                        : 'text-gray-700 hover:bg-[#8B1D4F]/06',
                    )}
                  >
                    <span aria-hidden="true">✨</span>
                    All Categories
                  </Link>
                  {VENDOR_CATEGORIES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/vendors?category=${cat}${area ? `&area=${area}` : ''}${price ? `&price=${price}` : ''}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                        activeCategory === cat
                          ? 'bg-[#8B1D4F] text-white font-semibold'
                          : 'text-gray-700 hover:bg-[#8B1D4F]/06',
                      )}
                    >
                      <span aria-hidden="true">{VENDOR_CATEGORY_ICONS[cat]}</span>
                      {VENDOR_CATEGORY_LABELS[cat]}
                    </Link>
                  ))}
                </nav>
              </div>

              {/* Location */}
              <div className="mb-5">
                <label htmlFor="area-select" className="block text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Location
                </label>
                <form method="GET" action="/vendors">
                  {category && <input type="hidden" name="category" value={String(category)} />}
                  {q && <input type="hidden" name="q" value={String(q)} />}
                  {price && <input type="hidden" name="price" value={String(price)} />}
                  <select
                    id="area-select"
                    name="area"
                    defaultValue={typeof area === 'string' ? area : ''}
                    onChange={undefined}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:border-[#8B1D4F] focus:outline-none focus:ring-1 focus:ring-[#8B1D4F] bg-white"
                  >
                    <option value="">Any location</option>
                    {UK_CITIES.map((city) => (
                      <option key={city} value={city}>{city}</option>
                    ))}
                  </select>
                </form>
              </div>

              {/* Price range */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
                  Price Range
                </p>
                <div className="space-y-0.5">
                  {[
                    { value: '', label: 'Any price' },
                    { value: 'under_1000', label: 'Under £1,000' },
                    { value: '1000_5000', label: '£1,000 – £5,000' },
                    { value: 'over_5000', label: '£5,000+' },
                  ].map(({ value, label }) => (
                    <Link
                      key={value}
                      href={`/vendors?${new URLSearchParams({
                        ...(activeCategory ? { category: activeCategory } : {}),
                        ...(area && typeof area === 'string' ? { area } : {}),
                        ...(q && typeof q === 'string' ? { q } : {}),
                        ...(value ? { price: value } : {}),
                      }).toString()}`}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors',
                        (price === value || (!price && !value))
                          ? 'bg-[#8B1D4F] text-white font-semibold'
                          : 'text-gray-700 hover:bg-[#8B1D4F]/06',
                      )}
                    >
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Main content ───────────────────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {/* Results count + active filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <p className="text-sm text-gray-600 font-medium">
                <span className="text-[#8B1D4F] font-bold">{activeVendors.length}</span>{' '}
                {activeVendors.length === 1 ? 'vendor' : 'vendors'} found
              </p>
              {activeCategory && (
                <Badge className="gap-1">
                  {VENDOR_CATEGORY_ICONS[activeCategory]} {VENDOR_CATEGORY_LABELS[activeCategory]}
                  <Link href="/vendors" className="ml-1 text-gray-500 hover:text-gray-700" aria-label="Remove category filter">×</Link>
                </Badge>
              )}
              {area && typeof area === 'string' && (
                <Badge className="gap-1">
                  <MapPin size={10} aria-hidden="true" /> {area}
                  <Link href={`/vendors?${activeCategory ? `category=${activeCategory}` : ''}`} className="ml-1 text-gray-500 hover:text-gray-700" aria-label="Remove location filter">×</Link>
                </Badge>
              )}
              {q && typeof q === 'string' && (
                <Badge className="gap-1">
                  &ldquo;{q}&rdquo;
                  <Link href={`/vendors?${activeCategory ? `category=${activeCategory}` : ''}${area ? `&area=${area}` : ''}`} className="ml-1 text-gray-500 hover:text-gray-700" aria-label="Remove search filter">×</Link>
                </Badge>
              )}
            </div>

            {activeVendors.length === 0 ? (
              /* Empty state */
              <div
                className="rounded-2xl flex flex-col items-center justify-center py-24 px-8 text-center"
                style={{
                  border: '1.5px dashed rgba(139,29,79,0.2)',
                  backgroundColor: 'rgba(139,29,79,0.02)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4"
                  style={{ backgroundColor: 'rgba(139,29,79,0.08)' }}
                  aria-hidden="true"
                >
                  🔍
                </div>
                <h3
                  className="text-xl font-bold mb-2"
                  style={{ color: '#1a0a12', fontFamily: 'Playfair Display, Georgia, serif' }}
                >
                  No vendors found
                </h3>
                <p className="text-gray-500 text-sm max-w-sm mb-6">
                  We couldn&apos;t find any vendors matching your filters. Try broadening your search or removing a filter.
                </p>
                <Link
                  href="/vendors"
                  className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
                  style={{ backgroundColor: '#8B1D4F' }}
                >
                  Clear all filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                {activeVendors.map((vendor) => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
