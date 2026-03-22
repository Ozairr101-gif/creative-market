'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { EVENT_TYPE_LABELS, EVENT_TYPE_COLORS, formatDate } from '@/lib/utils'
import type { WeddingEvent } from '@/lib/types/database'
import { createClient } from '@/lib/supabase/client'
import AddEventForm from './AddEventForm'
import { CalendarPlus, MapPin, Users, Pencil, Trash2 } from 'lucide-react'

interface EventsClientProps {
  weddingId: string
  events: WeddingEvent[]
}

export default function EventsClient({ weddingId, events }: EventsClientProps) {
  const router = useRouter()
  const [showForm, setShowForm] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  async function handleDelete(eventId: string) {
    if (!confirm('Delete this event? This cannot be undone.')) return
    setDeletingId(eventId)
    const supabase = createClient()
    await supabase.from('wedding_events').delete().eq('id', eventId)
    setDeletingId(null)
    router.refresh()
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </h2>
        </div>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <CalendarPlus size={14} />
          {showForm ? 'Cancel' : 'Add Event'}
        </Button>
      </div>

      {/* Inline form */}
      {showForm && (
        <AddEventForm
          weddingId={weddingId}
          onClose={() => setShowForm(false)}
        />
      )}

      {/* Event cards */}
      {events.length === 0 && !showForm ? (
        <div className="text-center py-16 rounded-2xl border-2 border-dashed border-[#8B1D4F]/15">
          <div className="w-12 h-12 rounded-full bg-[#8B1D4F]/8 flex items-center justify-center mx-auto mb-3">
            <CalendarPlus size={20} className="text-[#8B1D4F]" />
          </div>
          <p className="font-medium text-gray-700 mb-1">No events yet</p>
          <p className="text-sm text-gray-400">Add your first event to get started.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl border border-[#8B1D4F]/10 p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${EVENT_TYPE_COLORS[event.type]}`}
                    >
                      {EVENT_TYPE_LABELS[event.type]}
                    </span>
                    {event.name && (
                      <span className="text-sm font-medium text-gray-800">{event.name}</span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    {event.event_date && (
                      <span className="flex items-center gap-1.5">
                        <span className="text-[#C9973F] font-medium">{formatDate(event.event_date)}</span>
                        {event.start_time && (
                          <span className="text-gray-400">at {event.start_time.slice(0, 5)}</span>
                        )}
                      </span>
                    )}
                    {event.venue_name && (
                      <span className="flex items-center gap-1.5">
                        <MapPin size={13} className="text-gray-400" />
                        {event.venue_name}
                      </span>
                    )}
                    {event.estimated_guests && (
                      <span className="flex items-center gap-1.5">
                        <Users size={13} className="text-gray-400" />
                        {event.estimated_guests.toLocaleString()} guests
                      </span>
                    )}
                    {event.dress_code && (
                      <span className="text-gray-500">Dress: {event.dress_code}</span>
                    )}
                  </div>

                  {event.notes && (
                    <p className="mt-2 text-sm text-gray-500 italic">{event.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDelete(event.id)}
                    disabled={deletingId === event.id}
                    className="p-1.5 rounded text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Delete event"
                  >
                    {deletingId === event.id ? (
                      <Spinner size="sm" />
                    ) : (
                      <Trash2 size={15} />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
