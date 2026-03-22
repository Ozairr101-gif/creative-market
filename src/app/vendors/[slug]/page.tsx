import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  MapPin,
  Star,
  Shield,
  CheckCircle,
  Camera,
  Package,
  ChevronRight,
  Heart,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  cn,
  VENDOR_CATEGORY_LABELS,
  VENDOR_CATEGORY_ICONS,
  VENDOR_CATEGORIES,
  formatCurrency,
  formatCurrencyRange,
  EVENT_TYPE_LABELS,
  EVENT_TYPE_COLORS,
} from '@/lib/utils'
import type {
  Vendor,
  VendorGalleryItem,
  VendorPackage,
  VendorCategory,
  EventType,
} from '@/lib/types/database'
import { ShortlistButton } from './page-client'
import type { Metadata } from 'next'

const PUBLIC_VENDOR_STATUSES = ['active', 'pending_review'] as const

// ─────────────────────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: vendor } = await supabase
    .from('vendors')
    .select('business_name, tagline, category')
    .eq('slug', slug)
    .in('status', [...PUBLIC_VENDOR_STATUSES])
    .single()

  if (!vendor) return {}

  return {
    title: `${vendor.business_name} — ${VENDOR_CATEGORY_LABELS[vendor.category as VendorCategory]} | Shaadi HQ`,
    description: vendor.tagline ?? `View the profile, gallery and packages of ${vendor.business_name} on Shaadi HQ.`,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────────────────────

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-2xl px-5 py-4 gap-0.5"
      style={{
        backgroundColor: 'rgba(139,29,79,0.05)',
        border: '1px solid rgba(139,29,79,0.10)',
      }}
    >
      <span className="text-xl font-bold text-[#8B1D4F]">{value}</span>
      <span className="text-xs text-gray-500">{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section anchor heading
// ─────────────────────────────────────────────────────────────────────────────

function SectionHeading({
  id,
  icon: Icon,
  label,
}: {
  id: string
  icon: React.ElementType
  label: string
}) {
  return (
    <div id={id} className="flex items-center gap-3 mb-6 scroll-mt-6">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: 'rgba(139,29,79,0.08)' }}
        aria-hidden="true"
      >
        <Icon size={18} style={{ color: '#8B1D4F' }} />
      </div>
      <h2
        className="text-2xl font-bold text-gray-900"
        style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
      >
        {label}
      </h2>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────

interface Props {
  params: Promise<{ slug: string }>
}

export default async function VendorProfilePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch vendor + related data in parallel
  const [vendorRes, galleryRes, packagesRes] = await Promise.all([
    supabase
      .from('vendors')
      .select('*')
      .eq('slug', slug)
      .in('status', [...PUBLIC_VENDOR_STATUSES])
      .single(),
    supabase
      .from('vendor_gallery')
      .select('*')
      .eq('vendor_id', slug) // will re-fetch with real ID below
      .order('sort_order'),
    supabase
      .from('vendor_packages')
      .select('*')
      .eq('vendor_id', slug)
      .order('sort_order'),
  ])

  const vendor = vendorRes.data as Vendor | null

  if (!vendor) {
    notFound()
  }

  // Re-fetch gallery/packages with real vendor ID
  const [galleryFinal, packagesFinal, eventTypesFinal] = await Promise.all([
    supabase
      .from('vendor_gallery')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('sort_order'),
    supabase
      .from('vendor_packages')
      .select('*')
      .eq('vendor_id', vendor.id)
      .order('sort_order'),
    supabase
      .from('vendor_event_types')
      .select('event_type')
      .eq('vendor_id', vendor.id),
  ])

  const gallery: VendorGalleryItem[] = galleryFinal.data ?? []
  const packages: VendorPackage[] = packagesFinal.data ?? []
  const eventTypes: EventType[] = (eventTypesFinal.data ?? []).map(
    (r: { event_type: string }) => r.event_type as EventType,
  )

  // Related vendors (same category, different vendor, limit 3)
  const { data: relatedRaw } = await supabase
    .from('vendors')
    .select('id, business_name, slug, category, profile_image_url, price_from_gbp, price_to_gbp, verified, service_areas')
    .in('status', [...PUBLIC_VENDOR_STATUSES])
    .eq('category', vendor.category)
    .neq('id', vendor.id)
    .order('featured', { ascending: false })
    .limit(3)
  const relatedVendors = (relatedRaw ?? []) as Partial<Vendor>[]

  // Auth — check if user has a wedding for shortlist
  const {
    data: { user },
  } = await supabase.auth.getUser()
  let weddingId: string | null = null
  let isShortlisted = false

  if (user) {
    const { data: wedding } = await supabase
      .from('weddings')
      .select('id')
      .eq('created_by', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    weddingId = wedding?.id ?? null

    if (weddingId) {
      const { data: shortlistEntry } = await supabase
        .from('vendor_shortlist')
        .select('id')
        .eq('vendor_id', vendor.id)
        .eq('wedding_id', weddingId)
        .single()
      isShortlisted = !!shortlistEntry
    }
  }

  const categoryLabel = VENDOR_CATEGORY_LABELS[vendor.category]
  const categoryIcon = VENDOR_CATEGORY_ICONS[vendor.category]
  const priceDisplay = formatCurrencyRange(vendor.price_from_gbp, vendor.price_to_gbp)

  return (
    <main className="min-h-screen bg-[#FAF7F5]">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section
        className="relative"
        style={{ minHeight: '360px' }}
        aria-label="Vendor hero"
      >
        {/* Cover image or gradient */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            background: vendor.profile_image_url
              ? undefined
              : 'linear-gradient(135deg, #8B1D4F 0%, #C9973F 100%)',
          }}
          aria-hidden="true"
        >
          {vendor.profile_image_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={vendor.profile_image_url}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
          {/* Dark overlay for readability */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)' }}
          />
        </div>

        {/* Breadcrumb */}
        <div className="relative z-10 pt-5 px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-1 text-xs text-white/80">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><ChevronRight size={12} aria-hidden="true" /></li>
              <li><Link href="/vendors" className="hover:text-white transition-colors">Vendors</Link></li>
              <li><ChevronRight size={12} aria-hidden="true" /></li>
              <li><Link href={`/vendors?category=${vendor.category}`} className="hover:text-white transition-colors">{categoryLabel}</Link></li>
              <li><ChevronRight size={12} aria-hidden="true" /></li>
              <li className="text-white font-medium" aria-current="page">{vendor.business_name}</li>
            </ol>
          </nav>
        </div>

        {/* Vendor identity */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-10 pt-8 flex flex-col sm:flex-row items-start sm:items-end gap-5">
          {/* Profile image circle */}
          <div
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-4xl shadow-xl"
            style={{
              border: '3px solid white',
              backgroundColor: 'rgba(139,29,79,0.12)',
            }}
            aria-hidden={!vendor.profile_image_url}
          >
            {vendor.profile_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={vendor.profile_image_url}
                alt={vendor.business_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{categoryIcon}</span>
            )}
          </div>

          <div className="text-white flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Badge
                className="text-xs"
                style={{ backgroundColor: 'rgba(255,255,255,0.18)', color: 'white' } as React.CSSProperties}
              >
                {categoryIcon} {categoryLabel}
              </Badge>
              {vendor.verified && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: 'rgba(201,151,63,0.90)', color: 'white' }}
                >
                  <Shield size={11} aria-hidden="true" />
                  Verified
                </span>
              )}
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight mb-1"
              style={{ fontFamily: 'Playfair Display, Georgia, serif', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
              {vendor.business_name}
            </h1>
            {vendor.tagline && (
              <p className="text-white/85 text-base mb-2 max-w-xl">{vendor.tagline}</p>
            )}
            {vendor.service_areas && vendor.service_areas.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 text-sm text-white/80">
                <MapPin size={13} aria-hidden="true" />
                {vendor.service_areas.slice(0, 4).map((area) => (
                  <span key={area} className="after:content-['·'] after:mx-1 last:after:content-[''] last:after:mx-0">
                    {area}
                  </span>
                ))}
                {vendor.service_areas.length > 4 && (
                  <span>+{vendor.service_areas.length - 4} more</span>
                )}
              </div>
            )}
          </div>

          {/* Desktop CTA in hero */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <Link
              href={`/vendors/${vendor.slug}/inquire`}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl"
              style={{ backgroundColor: '#8B1D4F' }}
            >
              Send Inquiry
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sticky nav tabs ───────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-20 border-b"
        style={{
          backgroundColor: 'white',
          borderColor: 'rgba(139,29,79,0.10)',
          boxShadow: '0 1px 6px rgba(139,29,79,0.06)',
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-0 overflow-x-auto" aria-label="Profile sections">
            {[
              { href: '#overview', label: 'Overview' },
              { href: '#gallery', label: 'Gallery' },
              { href: '#packages', label: 'Packages' },
              { href: '#reviews', label: 'Reviews' },
            ].map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="shrink-0 px-4 py-3.5 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-[#8B1D4F] hover:border-[#8B1D4F]/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] focus-visible:ring-inset"
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">

          {/* ── Main column ──────────────────────────────────────────── */}
          <div className="flex-1 min-w-0 space-y-14">

            {/* OVERVIEW */}
            <section aria-labelledby="overview-heading">
              <SectionHeading id="overview" icon={CheckCircle} label="Overview" />

              {/* About */}
              {vendor.description ? (
                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed mb-8 whitespace-pre-line">
                  {vendor.description}
                </div>
              ) : (
                <p className="text-gray-400 italic mb-8">No description provided yet.</p>
              )}

              {/* Stats */}
              {(vendor.years_experience || vendor.team_size || vendor.min_guests || vendor.max_guests || vendor.price_from_gbp) && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
                  {vendor.years_experience != null && (
                    <StatPill label="Years Experience" value={String(vendor.years_experience)} />
                  )}
                  {vendor.team_size != null && (
                    <StatPill label="Team Size" value={String(vendor.team_size)} />
                  )}
                  {(vendor.min_guests != null || vendor.max_guests != null) && (
                    <StatPill
                      label="Guest Range"
                      value={
                        vendor.min_guests != null && vendor.max_guests != null
                          ? `${vendor.min_guests}–${vendor.max_guests}`
                          : vendor.min_guests != null
                          ? `${vendor.min_guests}+`
                          : `Up to ${vendor.max_guests}`
                      }
                    />
                  )}
                  {vendor.price_from_gbp != null && (
                    <StatPill label="Price From" value={formatCurrency(vendor.price_from_gbp)} />
                  )}
                </div>
              )}

              {/* Service areas */}
              {vendor.service_areas && vendor.service_areas.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Service Areas
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {vendor.service_areas.map((area) => (
                      <span
                        key={area}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm"
                        style={{
                          backgroundColor: 'rgba(139,29,79,0.07)',
                          color: '#5a1a35',
                          border: '1px solid rgba(139,29,79,0.12)',
                        }}
                      >
                        <MapPin size={12} aria-hidden="true" />
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Event types */}
              {eventTypes.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
                    Serves These Events
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {eventTypes.map((type) => (
                      <span
                        key={type}
                        className={cn(
                          'inline-flex items-center rounded-full px-3 py-1.5 text-sm font-medium',
                          EVENT_TYPE_COLORS[type],
                        )}
                      >
                        {EVENT_TYPE_LABELS[type]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Map placeholder */}
              <div
                className="rounded-2xl overflow-hidden flex items-center justify-center h-40"
                style={{
                  background: 'linear-gradient(135deg, rgba(139,29,79,0.04) 0%, rgba(201,151,63,0.06) 100%)',
                  border: '1px solid rgba(139,29,79,0.10)',
                }}
                aria-label="Service area map placeholder"
              >
                <div className="text-center">
                  <MapPin size={28} className="mx-auto mb-2 text-[#8B1D4F]/40" aria-hidden="true" />
                  <p className="text-sm text-gray-500 font-medium">
                    {vendor.service_areas && vendor.service_areas.length > 0
                      ? vendor.service_areas.join(', ') + ' & surrounding areas'
                      : 'Service area map coming soon'}
                  </p>
                </div>
              </div>
            </section>

            {/* GALLERY */}
            <section aria-labelledby="gallery-heading">
              <SectionHeading id="gallery" icon={Camera} label="Gallery" />
              {gallery.length === 0 ? (
                <div
                  className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
                  style={{
                    border: '1.5px dashed rgba(139,29,79,0.18)',
                    backgroundColor: 'rgba(139,29,79,0.02)',
                  }}
                >
                  <Camera size={32} className="text-[#8B1D4F]/30 mb-3" aria-hidden="true" />
                  <p className="text-gray-400 text-sm">No gallery photos yet.</p>
                </div>
              ) : (
                <div
                  className="columns-2 sm:columns-3 gap-3 space-y-3"
                  style={{ columnFill: 'balance' }}
                >
                  {gallery.map((item) => (
                    <div
                      key={item.id}
                      className="break-inside-avoid rounded-xl overflow-hidden group"
                      style={{ border: '1px solid rgba(139,29,79,0.06)' }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.url}
                        alt={item.caption ?? `${vendor.business_name} gallery photo`}
                        className="w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {item.caption && (
                        <p className="px-3 py-2 text-xs text-gray-500 bg-white">{item.caption}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* PACKAGES */}
            <section aria-labelledby="packages-heading">
              <SectionHeading id="packages" icon={Package} label="Packages" />
              {packages.length === 0 ? (
                <div
                  className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
                  style={{
                    border: '1.5px dashed rgba(139,29,79,0.18)',
                    backgroundColor: 'rgba(139,29,79,0.02)',
                  }}
                >
                  <Package size={32} className="text-[#8B1D4F]/30 mb-3" aria-hidden="true" />
                  <p className="text-gray-400 text-sm">No packages listed. Contact vendor for pricing.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {packages.map((pkg) => (
                    <Card key={pkg.id} className="flex flex-col h-full">
                      <CardHeader className="mb-3">
                        <CardTitle>{pkg.name}</CardTitle>
                        <div className="mt-1.5">
                          {pkg.price_gbp != null ? (
                            <span className="text-2xl font-bold text-[#8B1D4F]">
                              {formatCurrency(pkg.price_gbp)}
                              {pkg.price_type === 'per_head' && (
                                <span className="text-sm font-normal text-gray-500 ml-1">/ head</span>
                              )}
                              {pkg.price_type === 'from' && (
                                <span className="text-sm font-normal text-gray-500 ml-1">from</span>
                              )}
                            </span>
                          ) : (
                            <span className="text-sm font-semibold text-[#C9973F]">
                              Price on Application
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1">
                        {pkg.description && (
                          <p className="text-sm text-gray-600 mb-4 leading-relaxed">{pkg.description}</p>
                        )}
                        {pkg.includes && pkg.includes.length > 0 && (
                          <ul className="space-y-1.5">
                            {pkg.includes.map((item, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                                <CheckCircle
                                  size={14}
                                  className="shrink-0 mt-0.5 text-emerald-600"
                                  aria-hidden="true"
                                />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                      </CardContent>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <Link
                          href={`/vendors/${vendor.slug}/inquire?package=${encodeURIComponent(pkg.name)}`}
                          className="block w-full text-center rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90"
                          style={{ backgroundColor: '#8B1D4F' }}
                        >
                          Inquire about this package
                        </Link>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {/* REVIEWS */}
            <section aria-labelledby="reviews-heading">
              <SectionHeading id="reviews" icon={Star} label="Reviews" />
              <div
                className="rounded-2xl flex flex-col items-center justify-center py-16 text-center"
                style={{
                  border: '1.5px dashed rgba(139,29,79,0.18)',
                  backgroundColor: 'rgba(139,29,79,0.02)',
                }}
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: 'rgba(201,151,63,0.10)' }}
                  aria-hidden="true"
                >
                  <Star size={24} style={{ color: '#C9973F' }} />
                </div>
                <p className="text-gray-700 font-medium mb-1">No reviews yet</p>
                <p className="text-gray-400 text-sm max-w-xs">
                  Reviews from couples who have booked this vendor will appear here.
                </p>
              </div>
            </section>

            {/* RELATED VENDORS */}
            {relatedVendors.length > 0 && (
              <section aria-labelledby="related-heading">
                <div className="flex items-center justify-between mb-6">
                  <h2
                    className="text-xl font-bold text-gray-900"
                    style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                  >
                    Similar {VENDOR_CATEGORY_LABELS[vendor.category]}
                  </h2>
                  <Link
                    href={`/vendors?category=${vendor.category}`}
                    className="text-sm text-[#8B1D4F] font-medium hover:underline flex items-center gap-1"
                  >
                    View all <ChevronRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {relatedVendors.map((rel) => (
                    <Link
                      key={rel.id}
                      href={`/vendors/${rel.slug}`}
                      className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded-xl"
                    >
                      <Card hover className="p-0 overflow-hidden">
                        <div
                          className="aspect-video w-full overflow-hidden rounded-t-xl flex items-center justify-center text-3xl"
                          style={{
                            background: rel.profile_image_url
                              ? undefined
                              : 'linear-gradient(135deg, rgba(139,29,79,0.10) 0%, rgba(201,151,63,0.12) 100%)',
                          }}
                        >
                          {rel.profile_image_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rel.profile_image_url}
                              alt={rel.business_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <span aria-hidden="true">{VENDOR_CATEGORY_ICONS[rel.category as VendorCategory]}</span>
                          )}
                        </div>
                        <div className="p-3">
                          <p
                            className="font-semibold text-sm text-gray-900 group-hover:text-[#8B1D4F] transition-colors leading-snug mb-1"
                            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
                          >
                            {rel.business_name}
                          </p>
                          {rel.service_areas && (rel.service_areas as string[]).length > 0 && (
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <MapPin size={10} aria-hidden="true" />
                              {(rel.service_areas as string[]).slice(0, 2).join(', ')}
                            </p>
                          )}
                          <p className="text-xs font-semibold text-[#8B1D4F] mt-1.5">
                            {formatCurrencyRange(rel.price_from_gbp ?? null, rel.price_to_gbp ?? null)}
                          </p>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* ── Sticky right sidebar (desktop) ───────────────────────── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-20 space-y-4">
              {/* CTA card */}
              <div
                className="rounded-2xl p-6"
                style={{
                  backgroundColor: 'white',
                  border: '1px solid rgba(139,29,79,0.10)',
                  boxShadow: '0 2px 12px rgba(139,29,79,0.08)',
                }}
              >
                {vendor.price_from_gbp != null && (
                  <p className="text-sm text-gray-500 mb-1">Starting from</p>
                )}
                <p className="text-3xl font-bold text-[#8B1D4F] mb-4">
                  {priceDisplay}
                </p>

                <Link
                  href={`/vendors/${vendor.slug}/inquire`}
                  className="block w-full text-center rounded-xl px-5 py-3 text-base font-semibold text-white transition-all hover:opacity-90 hover:shadow-lg mb-3"
                  style={{ backgroundColor: '#8B1D4F' }}
                >
                  Request a Quote
                </Link>

                <ShortlistButton
                  vendorId={vendor.id}
                  initialShortlisted={isShortlisted}
                  weddingId={weddingId}
                />

                {/* Social links */}
                {(vendor.website_url || vendor.instagram_url || vendor.facebook_url) && (
                  <div className="mt-5 pt-5 border-t border-gray-100 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">Links</p>
                    {vendor.website_url && (
                      <a
                        href={vendor.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-[#8B1D4F] hover:underline truncate"
                      >
                        🌐 Website
                      </a>
                    )}
                    {vendor.instagram_url && (
                      <a
                        href={vendor.instagram_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-[#8B1D4F] hover:underline truncate"
                      >
                        📷 Instagram
                      </a>
                    )}
                    {vendor.facebook_url && (
                      <a
                        href={vendor.facebook_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm text-[#8B1D4F] hover:underline truncate"
                      >
                        👤 Facebook
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Verified trust badge */}
              {vendor.verified && (
                <div
                  className="rounded-2xl p-4 flex items-start gap-3"
                  style={{
                    backgroundColor: 'rgba(201,151,63,0.07)',
                    border: '1px solid rgba(201,151,63,0.20)',
                  }}
                >
                  <Shield size={18} style={{ color: '#C9973F' }} className="shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">Verified Vendor</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Identity and business credentials have been verified by Shaadi HQ.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>

      {/* ── Mobile sticky CTA ─────────────────────────────────────────── */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-30 px-4 py-3 flex items-center gap-3"
        style={{
          backgroundColor: 'white',
          borderTop: '1px solid rgba(139,29,79,0.10)',
          boxShadow: '0 -4px 16px rgba(139,29,79,0.08)',
        }}
      >
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500">Starting from</p>
          <p className="text-base font-bold text-[#8B1D4F]">{priceDisplay}</p>
        </div>
        <ShortlistButton
          vendorId={vendor.id}
          initialShortlisted={isShortlisted}
          weddingId={weddingId}
        />
        <Link
          href={`/vendors/${vendor.slug}/inquire`}
          className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 shrink-0"
          style={{ backgroundColor: '#8B1D4F' }}
        >
          <Heart size={14} aria-hidden="true" />
          Send Inquiry
        </Link>
      </div>
    </main>
  )
}
