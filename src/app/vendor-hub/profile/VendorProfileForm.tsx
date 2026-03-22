'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn, slugify, VENDOR_CATEGORIES, VENDOR_CATEGORY_LABELS, UK_CITIES, EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Vendor, VendorCategory, EventType } from '@/lib/types/database'

type Step = 0 | 1 | 2 | 3

interface VendorProfileFormProps {
  vendor: Vendor | null
  vendorEventTypes: string[]
  userId: string
}

export default function VendorProfileForm({
  vendor,
  vendorEventTypes,
  userId,
}: VendorProfileFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [currentStep, setCurrentStep] = useState<Step>(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Form state
  const [businessName, setBusinessName] = useState(vendor?.business_name ?? '')
  const [category, setCategory] = useState<VendorCategory | ''>(vendor?.category ?? '')
  const [tagline, setTagline] = useState(vendor?.tagline ?? '')
  const [description, setDescription] = useState(vendor?.description ?? '')
  const [serviceAreas, setServiceAreas] = useState<string[]>(vendor?.service_areas ?? [])
  const [priceFrom, setPriceFrom] = useState(vendor?.price_from_gbp?.toString() ?? '')
  const [priceTo, setPriceTo] = useState(vendor?.price_to_gbp?.toString() ?? '')
  const [minGuests, setMinGuests] = useState(vendor?.min_guests?.toString() ?? '')
  const [maxGuests, setMaxGuests] = useState(vendor?.max_guests?.toString() ?? '')
  const [yearsExperience, setYearsExperience] = useState(vendor?.years_experience?.toString() ?? '')
  const [teamSize, setTeamSize] = useState(vendor?.team_size?.toString() ?? '')
  const [selectedEventTypes, setSelectedEventTypes] = useState<string[]>(vendorEventTypes)
  const [websiteUrl, setWebsiteUrl] = useState(vendor?.website_url ?? '')
  const [instagramUrl, setInstagramUrl] = useState(vendor?.instagram_url ?? '')
  const [facebookUrl, setFacebookUrl] = useState(vendor?.facebook_url ?? '')

  const steps = [
    { label: 'Business Basics', number: 1 },
    { label: 'Service Details', number: 2 },
    { label: 'Event Types', number: 3 },
    { label: 'Contact & Links', number: 4 },
  ]

  function toggleServiceArea(city: string) {
    setServiceAreas((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city],
    )
  }

  function toggleEventType(type: string) {
    setSelectedEventTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!businessName.trim()) {
      setError('Business name is required.')
      setCurrentStep(0)
      return
    }
    if (!category) {
      setError('Please select a category.')
      setCurrentStep(0)
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()
        const slug = slugify(businessName)

        const vendorData = {
          user_id: userId,
          business_name: businessName.trim(),
          slug,
          category: category as VendorCategory,
          tagline: tagline.trim() || null,
          description: description.trim() || null,
          service_areas: serviceAreas,
          price_from_gbp: priceFrom ? parseFloat(priceFrom) : null,
          price_to_gbp: priceTo ? parseFloat(priceTo) : null,
          min_guests: minGuests ? parseInt(minGuests) : null,
          max_guests: maxGuests ? parseInt(maxGuests) : null,
          years_experience: yearsExperience ? parseInt(yearsExperience) : null,
          team_size: teamSize ? parseInt(teamSize) : null,
          website_url: websiteUrl.trim() || null,
          instagram_url: instagramUrl.trim() || null,
          facebook_url: facebookUrl.trim() || null,
          updated_at: new Date().toISOString(),
        }

        let vendorId: string

        if (vendor) {
          const { error: updateError } = await supabase
            .from('vendors')
            .update({
              ...vendorData,
              status: vendor.status === 'pending_review' ? 'active' : vendor.status,
            })
            .eq('id', vendor.id)
          if (updateError) throw updateError
          vendorId = vendor.id
        } else {
          const { data: newVendor, error: insertError } = await supabase
            .from('vendors')
            .insert({ ...vendorData, status: 'active', verified: false, featured: false, verification_tier: 'none' })
            .select('id')
            .single()
          if (insertError) throw insertError
          vendorId = newVendor.id
        }

        // Upsert event types: delete existing then insert
        await supabase.from('vendor_event_types').delete().eq('vendor_id', vendorId)
        if (selectedEventTypes.length > 0) {
          const { error: evtError } = await supabase.from('vendor_event_types').insert(
            selectedEventTypes.map((et) => ({ vendor_id: vendorId, event_type: et })),
          )
          if (evtError) throw evtError
        }

        setSuccess(true)
        router.refresh()
        setTimeout(() => router.push(vendor ? '/vendor-hub/profile' : '/vendor-hub'), 1200)
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        setError(message)
      }
    })
  }

  const stepComplete: Record<number, boolean> = {
    0: !!businessName.trim() && !!category,
    1: true,
    2: true,
    3: true,
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="flex items-center gap-0">
          {steps.map((step, idx) => (
            <div key={step.number} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                onClick={() => setCurrentStep(idx as Step)}
                className="flex items-center gap-2 group"
                aria-current={currentStep === idx ? 'step' : undefined}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors',
                    currentStep === idx
                      ? 'bg-[#8B1D4F] text-white'
                      : stepComplete[idx]
                      ? 'bg-[#8B1D4F]/15 text-[#8B1D4F]'
                      : 'bg-gray-100 text-gray-400',
                  )}
                >
                  {step.number}
                </span>
                <span
                  className={cn(
                    'hidden sm:block text-xs font-medium transition-colors',
                    currentStep === idx ? 'text-[#8B1D4F]' : 'text-gray-400',
                  )}
                >
                  {step.label}
                </span>
              </button>
              {idx < steps.length - 1 && (
                <div
                  className={cn(
                    'mx-2 h-px flex-1',
                    stepComplete[idx] ? 'bg-[#8B1D4F]/30' : 'bg-gray-200',
                  )}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Error / Success */}
      {error && (
        <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700">
          Profile saved successfully! Redirecting…
        </div>
      )}

      {/* Step 0: Business Basics */}
      {currentStep === 0 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Business Basics
            </h2>
            <p className="text-sm text-gray-500">
              Tell couples who you are and what makes you special.
            </p>
          </div>
          <Input
            label="Business name *"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="e.g. Aisha Photography"
            required
          />
          <Select
            label="Category *"
            value={category}
            onChange={(e) => setCategory(e.target.value as VendorCategory)}
            placeholder="Select a category"
            required
          >
            <option value="" disabled>Select a category</option>
            {VENDOR_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {VENDOR_CATEGORY_LABELS[cat]}
              </option>
            ))}
          </Select>
          <Input
            label="Tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="e.g. Capturing your love story with timeless elegance"
            helperText="A short, punchy line shown on your listing card (max 100 chars)"
            maxLength={100}
          />
          <Textarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell couples about your background, your style, what makes you unique…"
            rows={5}
            helperText="This is your main bio shown on your profile page."
          />
        </div>
      )}

      {/* Step 1: Service Details */}
      {currentStep === 1 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Service Details
            </h2>
            <p className="text-sm text-gray-500">
              Help couples understand what you offer and where you work.
            </p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Service areas</p>
            <div className="flex flex-wrap gap-2">
              {UK_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleServiceArea(city)}
                  className={cn(
                    'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                    serviceAreas.includes(city)
                      ? 'bg-[#8B1D4F] border-[#8B1D4F] text-white'
                      : 'border-gray-300 text-gray-700 hover:border-[#8B1D4F]/40 hover:text-[#8B1D4F]',
                  )}
                >
                  {city}
                </button>
              ))}
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Select all cities where you offer services</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price from (GBP)"
              type="number"
              value={priceFrom}
              onChange={(e) => setPriceFrom(e.target.value)}
              placeholder="e.g. 500"
              min={0}
              helperText="Starting price shown on your listing"
            />
            <Input
              label="Price to (GBP)"
              type="number"
              value={priceTo}
              onChange={(e) => setPriceTo(e.target.value)}
              placeholder="e.g. 2000"
              min={0}
              helperText="Leave blank for open-ended or POA"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min guests"
              type="number"
              value={minGuests}
              onChange={(e) => setMinGuests(e.target.value)}
              placeholder="e.g. 50"
              min={0}
            />
            <Input
              label="Max guests"
              type="number"
              value={maxGuests}
              onChange={(e) => setMaxGuests(e.target.value)}
              placeholder="e.g. 500"
              min={0}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Years of experience"
              type="number"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              placeholder="e.g. 8"
              min={0}
            />
            <Input
              label="Team size"
              type="number"
              value={teamSize}
              onChange={(e) => setTeamSize(e.target.value)}
              placeholder="e.g. 3"
              min={1}
            />
          </div>
        </div>
      )}

      {/* Step 2: Event Types */}
      {currentStep === 2 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Event Types Served
            </h2>
            <p className="text-sm text-gray-500">
              Which celebrations do you cater for? Select all that apply.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(EVENT_TYPES.filter(t => t !== 'custom') as EventType[]).map((type) => (
              <label
                key={type}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                  selectedEventTypes.includes(type)
                    ? 'border-[#8B1D4F] bg-[#8B1D4F]/5'
                    : 'border-gray-200 hover:border-[#8B1D4F]/40',
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedEventTypes.includes(type)}
                  onChange={() => toggleEventType(type)}
                  className="h-4 w-4 rounded border-gray-300 text-[#8B1D4F] accent-[#8B1D4F]"
                />
                <span className="text-sm font-medium text-gray-700">
                  {EVENT_TYPE_LABELS[type]}
                </span>
              </label>
            ))}
          </div>
          {selectedEventTypes.length === 0 && (
            <p className="text-xs text-amber-600">
              Select at least one event type so couples can find you.
            </p>
          )}
        </div>
      )}

      {/* Step 3: Contact & Links */}
      {currentStep === 3 && (
        <div className="space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
              Contact &amp; Links
            </h2>
            <p className="text-sm text-gray-500">
              Let couples learn more about you online.
            </p>
          </div>
          <Input
            label="Website URL"
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.co.uk"
          />
          <Input
            label="Instagram URL"
            type="url"
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://instagram.com/yourhandle"
          />
          <Input
            label="Facebook URL"
            type="url"
            value={facebookUrl}
            onChange={(e) => setFacebookUrl(e.target.value)}
            placeholder="https://facebook.com/yourpage"
          />
          <div className="rounded-lg bg-[#FAF7F5] border border-[#8B1D4F]/10 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Review your listing</p>
            <dl className="space-y-1 text-sm">
              <div className="flex gap-2">
                <dt className="text-gray-400 w-32 shrink-0">Business name</dt>
                <dd className="text-gray-900 font-medium">{businessName || '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-32 shrink-0">Category</dt>
                <dd className="text-gray-900">{category ? VENDOR_CATEGORY_LABELS[category as VendorCategory] : '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-32 shrink-0">Service areas</dt>
                <dd className="text-gray-900">{serviceAreas.join(', ') || '—'}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-gray-400 w-32 shrink-0">Events served</dt>
                <dd className="text-gray-900">
                  {selectedEventTypes
                    .map((t) => EVENT_TYPE_LABELS[t as EventType])
                    .join(', ') || '—'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="mt-8 flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1) as Step)}
          disabled={currentStep === 0}
        >
          ← Back
        </Button>
        <div className="flex gap-3">
          {currentStep < 3 ? (
            <Button
              type="button"
              variant="primary"
              onClick={() => setCurrentStep((s) => Math.min(3, s + 1) as Step)}
            >
              Next: {steps[currentStep + 1].label} →
            </Button>
          ) : (
            <Button type="submit" variant="primary" size="lg" disabled={isPending}>
              {isPending ? 'Saving…' : vendor ? 'Save changes' : 'Create my profile'}
            </Button>
          )}
        </div>
      </div>
    </form>
  )
}
