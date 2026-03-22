'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import type { WeddingEvent } from '@/lib/types/database'
import { EVENT_TYPE_LABELS } from '@/lib/utils'
import { Select } from '@/components/ui/select'
import { X } from 'lucide-react'

interface AddBudgetItemFormProps {
  weddingId: string
  events: WeddingEvent[]
  onClose: () => void
}

export default function AddBudgetItemForm({ weddingId, events, onClose }: AddBudgetItemFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const estimated = Number(formData.get('estimated_gbp') ?? 0)
    const actual = Number(formData.get('actual_gbp') ?? 0)
    const deposit = Number(formData.get('deposit_paid_gbp') ?? 0)
    const eventId = formData.get('event_id') as string

    startTransition(async () => {
      const { error: insertError } = await supabase.from('budget_items').insert({
        wedding_id: weddingId,
        event_id: eventId || null,
        category: (formData.get('category') as string) || null,
        description: formData.get('description') as string,
        estimated_gbp: Math.round(estimated * 100),
        actual_gbp: Math.round(actual * 100),
        deposit_paid_gbp: Math.round(deposit * 100),
        notes: (formData.get('notes') as string) || null,
      })

      if (insertError) {
        setError(insertError.message)
        return
      }

      router.refresh()
      onClose()
    })
  }

  const eventOptions = events.map((e) => ({
    value: e.id,
    label: `${EVENT_TYPE_LABELS[e.type]}${e.name ? ` – ${e.name}` : ''}`,
  }))

  return (
    <div className="bg-[#FAF7F5] rounded-xl border border-[#8B1D4F]/15 p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Add Budget Item
        </h3>
        <button
          onClick={onClose}
          className="p-1 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Description"
          name="description"
          placeholder="e.g. Catering — main reception"
          required
        />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Category" name="category" placeholder="e.g. Catering, Venue, Flowers" />
          <Select
            label="Linked event (optional)"
            name="event_id"
            placeholder="None"
            options={eventOptions}
          />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Estimated (£)"
            name="estimated_gbp"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            required
          />
          <Input
            label="Actual (£)"
            name="actual_gbp"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
          <Input
            label="Deposit paid (£)"
            name="deposit_paid_gbp"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
          />
        </div>

        <Textarea label="Notes" name="notes" rows={2} placeholder="Any notes…" />

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
            {isPending ? <Spinner size="sm" /> : 'Add Item'}
          </Button>
        </div>
      </form>
    </div>
  )
}
