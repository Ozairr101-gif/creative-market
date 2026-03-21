'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import type { WeddingEvent } from '@/lib/types/database'
import { EVENT_TYPE_LABELS } from '@/lib/utils'
import { X } from 'lucide-react'

interface AddTaskFormProps {
  weddingId: string
  events: WeddingEvent[]
  onClose: () => void
}

export default function AddTaskForm({ weddingId, events, onClose }: AddTaskFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const eventId = formData.get('event_id') as string

    startTransition(async () => {
      const { error: insertError } = await supabase.from('tasks').insert({
        wedding_id: weddingId,
        event_id: eventId || null,
        title: formData.get('title') as string,
        description: (formData.get('description') as string) || null,
        due_date: (formData.get('due_date') as string) || null,
        priority: (formData.get('priority') as string) || 'medium',
        category: (formData.get('category') as string) || null,
        status: 'todo',
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

  const eventOptions = events.map((e) => ({
    value: e.id,
    label: `${EVENT_TYPE_LABELS[e.type]}${e.name ? ` – ${e.name}` : ''}${e.event_date ? ` (${new Date(e.event_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })})` : ''}`,
  }))

  return (
    <div className="bg-[#FAF7F5] rounded-xl border border-[#8B1D4F]/15 p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Add Task
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
        <Input label="Task title" name="title" placeholder="e.g. Confirm catering menu" required />

        <Textarea label="Description" name="description" rows={2} placeholder="Optional details…" />

        <div className="grid grid-cols-2 gap-4">
          <Input label="Due date" name="due_date" type="date" />
          <Select
            label="Priority"
            name="priority"
            defaultValue="medium"
            options={[
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Category"
            name="category"
            placeholder="e.g. Catering, Decor, Legal"
          />
          <Select
            label="Linked event (optional)"
            name="event_id"
            placeholder="None"
            options={eventOptions}
          />
        </div>

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
            {isPending ? <Spinner size="sm" /> : 'Add Task'}
          </Button>
        </div>
      </form>
    </div>
  )
}
