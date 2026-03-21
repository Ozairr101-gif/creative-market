'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EVENT_TYPES, EVENT_TYPE_LABELS } from '@/lib/utils'
import type { EventType } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AddEventFormProps {
  weddingId: string
  onClose: () => void
}

export default function AddEventForm({ weddingId, onClose }: AddEventFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [eventType, setEventType] = useState<EventType>('shaadi')

  const eventTypeOptions = EVENT_TYPES.map((t) => ({
    value: t,
    label: EVENT_TYPE_LABELS[t],
  }))

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const type = formData.get('type') as EventType
    const customName = formData.get('custom_name') as string
    const eventDate = formData.get('event_date') as string
    const startTime = formData.get('start_time') as string
    const venueName = formData.get('venue_name') as string
    const estimatedGuests = formData.get('estimated_guests') as string
    const dressCode = formData.get('dress_code') as string
    const notes = formData.get('notes') as string

    startTransition(async () => {
      const { error: insertError } = await supabase.from('wedding_events').insert({
        wedding_id: weddingId,
        type,
        name: type === 'custom' ? customName || null : null,
        event_date: eventDate || null,
        start_time: startTime || null,
        venue_name: venueName || null,
        estimated_guests: estimatedGuests ? Number(estimatedGuests) : null,
        dress_code: dressCode || null,
        notes: notes || null,
        sort_order: 0,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }

      router.refresh()
      onClose()
    })
  }

  return (
    <div className="bg-[#FAF7F5] rounded-xl border border-[#8B1D4F]/15 p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Add Event
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close form"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Event type"
            name="type"
            value={eventType}
            onChange={(e) => setEventType(e.target.value as EventType)}
            options={eventTypeOptions}
            required
          />

          {eventType === 'custom' && (
            <Input label="Custom name" name="custom_name" placeholder="e.g. Ring Ceremony" required />
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Date" name="event_date" type="date" />
          <Input label="Start time" name="start_time" type="time" />
        </div>

        <Input label="Venue name" name="venue_name" placeholder="e.g. Grand Banqueting Suite" />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Estimated guests"
            name="estimated_guests"
            type="number"
            min="1"
            placeholder="e.g. 200"
          />
          <Input label="Dress code" name="dress_code" placeholder="e.g. Formal / Traditional" />
        </div>

        <Textarea label="Notes" name="notes" rows={3} placeholder="Any notes for this event…" />

        {error && (
          <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={isPending}>
            {isPending ? <Spinner size="sm" /> : 'Add Event'}
          </Button>
        </div>
      </form>
    </div>
  )
}
