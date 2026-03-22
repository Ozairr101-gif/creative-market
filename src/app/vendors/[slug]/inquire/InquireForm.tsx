'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { Vendor, EventType } from '@/lib/types/database'

interface InquireFormProps {
  vendor: Vendor
  userId: string
  weddings: { id: string; title: string; main_date: string | null }[]
}

export default function InquireForm({ vendor, userId, weddings }: InquireFormProps) {
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [])
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [inquiryId, setInquiryId] = useState<string | null>(null)

  const [eventType, setEventType] = useState<string>('')
  const [eventDate, setEventDate] = useState('')
  const [estimatedGuests, setEstimatedGuests] = useState('')
  const [budget, setBudget] = useState('')
  const [message, setMessage] = useState('')
  const [selectedWeddingId, setSelectedWeddingId] = useState(weddings[0]?.id ?? '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!message.trim() || message.trim().length < 20) {
      setError('Please write a message of at least 20 characters so the vendor can understand your needs.')
      return
    }
    if (!selectedWeddingId) {
      setError('Please select which wedding this inquiry is for.')
      return
    }

    startTransition(async () => {
      try {
        const supabase = createClient()

        const { data, error: insertError } = await supabase
          .from('inquiries')
          .insert({
            vendor_id: vendor.id,
            wedding_id: selectedWeddingId,
            sent_by: userId,
            event_type: eventType || null,
            event_date: eventDate || null,
            estimated_guests: estimatedGuests ? parseInt(estimatedGuests) : null,
            budget_gbp: budget ? parseFloat(budget) : null,
            message: message.trim(),
            status: 'sent',
          })
          .select('id')
          .single()

        if (insertError) throw insertError

        setInquiryId(data.id)
        setSubmitted(true)
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to send inquiry. Please try again.'
        setError(msg)
      }
    })
  }

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto text-center">
        <Card>
          <CardContent className="py-8">
            <div className="text-4xl mb-4">🎉</div>
            <h2
              className="text-xl font-semibold text-gray-900 mb-2"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Your inquiry has been sent!
            </h2>
            <p className="text-gray-600 mb-6">
              <strong>{vendor.business_name}</strong> will respond within 48 hours. We&apos;ll
              notify you by email as soon as they reply.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href={`/vendors/${vendor.slug}`}>
                <Button variant="secondary">Back to profile</Button>
              </Link>
              <Link href="/dashboard/inquiries">
                <Button variant="primary">View my inquiries</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Wedding selector */}
        {weddings.length > 0 ? (
          <Select
            label="Which wedding is this for? *"
            value={selectedWeddingId}
            onChange={(e) => setSelectedWeddingId(e.target.value)}
            required
          >
            {weddings.map((w) => (
              <option key={w.id} value={w.id}>
                {w.title}
                {w.main_date &&
                  ` — ${new Date(w.main_date).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}`}
              </option>
            ))}
          </Select>
        ) : (
          <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
            <p className="font-medium mb-1">You don&apos;t have any weddings set up yet</p>
            <p>
              <Link href="/dashboard/weddings/new" className="underline font-medium">
                Create your wedding
              </Link>{' '}
              first, then come back to send this inquiry.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Select
            label="Event type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value)}
            placeholder="Select event type"
          >
            <option value="">Any / not sure yet</option>
            {(EVENT_TYPES.filter((t) => t !== 'custom') as EventType[]).map((t) => (
              <option key={t} value={t}>
                {EVENT_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>

          <Input
            label="Preferred event date"
            type="date"
            value={eventDate}
            onChange={(e) => setEventDate(e.target.value)}
          />

          <Input
            label="Estimated guests"
            type="number"
            min={1}
            value={estimatedGuests}
            onChange={(e) => setEstimatedGuests(e.target.value)}
            placeholder="e.g. 150"
          />

          <Input
            label="Your budget for this vendor (£)"
            type="number"
            min={0}
            step={50}
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g. 2000"
            helperText="Optional — helps the vendor tailor their quote"
          />
        </div>

        <Textarea
          label="Your message *"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Tell ${vendor.business_name} about your wedding — what you're looking for, your style preferences, any specific requirements…`}
          rows={6}
          required
          helperText={`${message.length} / 20 min chars${message.length < 20 ? ` — ${20 - message.length} more to go` : ' ✓'}`}
        />

        <div className="flex items-center gap-4 pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isPending || weddings.length === 0}
          >
            {isPending ? 'Sending…' : `Send inquiry to ${vendor.business_name}`}
          </Button>
          <Link href={`/vendors/${vendor.slug}`}>
            <Button type="button" variant="ghost" size="lg">
              Cancel
            </Button>
          </Link>
        </div>

        <p className="text-xs text-gray-400">
          By sending an inquiry you agree to our terms. Your contact details will be shared with the
          vendor.
        </p>
      </form>
    </div>
  )
}
