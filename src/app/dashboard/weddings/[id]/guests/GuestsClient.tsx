'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { GuestListEntry } from '@/lib/types/database'
import AddGuestForm from './AddGuestForm'
import { UserPlus, Users } from 'lucide-react'

const RSVP_VARIANTS: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-700' },
  attending: { label: 'Attending', className: 'bg-emerald-100 text-emerald-700' },
  declined: { label: 'Declined', className: 'bg-red-100 text-red-700' },
  maybe: { label: 'Maybe', className: 'bg-blue-100 text-blue-700' },
}

const SIDE_LABELS: Record<string, string> = {
  bride: "Bride's",
  groom: "Groom's",
  joint: 'Joint',
}

interface GuestsClientProps {
  weddingId: string
  guests: GuestListEntry[]
}

export default function GuestsClient({ weddingId, guests }: GuestsClientProps) {
  const [showForm, setShowForm] = useState(false)

  const total = guests.reduce((s, g) => s + 1 + g.plus_ones, 0)
  const attending = guests.filter((g) => g.rsvp_status === 'attending').reduce((s, g) => s + 1 + g.plus_ones, 0)
  const declined = guests.filter((g) => g.rsvp_status === 'declined').length
  const pending = guests.filter((g) => g.rsvp_status === 'pending').length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-base font-semibold text-gray-900">Guest List</h2>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <UserPlus size={14} />
          {showForm ? 'Cancel' : 'Add Guest'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total (incl. +1s)', value: total, color: 'text-gray-900' },
          { label: 'Attending', value: attending, color: 'text-emerald-700' },
          { label: 'Declined', value: declined, color: 'text-red-600' },
          { label: 'Pending RSVP', value: pending, color: 'text-amber-600' },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl border border-[#8B1D4F]/10 p-4 text-center shadow-sm"
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {showForm && (
        <AddGuestForm weddingId={weddingId} onClose={() => setShowForm(false)} />
      )}

      {guests.length === 0 ? (
        <div className="text-center py-14 rounded-2xl border-2 border-dashed border-[#8B1D4F]/15 mt-4">
          <div className="w-12 h-12 rounded-full bg-[#8B1D4F]/8 flex items-center justify-center mx-auto mb-3">
            <Users size={20} className="text-[#8B1D4F]" />
          </div>
          <p className="font-medium text-gray-700 mb-1">No guests yet</p>
          <p className="text-sm text-gray-400">Start building your guest list.</p>
        </div>
      ) : (
        <div className="mt-4 overflow-x-auto rounded-xl border border-[#8B1D4F]/10">
          <table className="w-full text-sm">
            <thead className="bg-[#FAF7F5] border-b border-[#8B1D4F]/10">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Side</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">RSVP</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">+1s</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wider">Dietary</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {guests.map((guest) => {
                const rsvp = RSVP_VARIANTS[guest.rsvp_status] ?? RSVP_VARIANTS.pending
                return (
                  <tr key={guest.id} className="hover:bg-[#FAF7F5] transition-colors">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-800">{guest.full_name}</p>
                      {guest.relationship && (
                        <p className="text-xs text-gray-400">{guest.relationship}</p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {guest.side ? SIDE_LABELS[guest.side] : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${rsvp.className}`}
                      >
                        {rsvp.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-center">{guest.plus_ones}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs max-w-[160px] truncate">
                      {guest.dietary_requirements || '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
