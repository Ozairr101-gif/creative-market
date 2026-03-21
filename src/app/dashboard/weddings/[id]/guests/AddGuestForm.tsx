'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { X } from 'lucide-react'

interface AddGuestFormProps {
  weddingId: string
  onClose: () => void
}

export default function AddGuestForm({ weddingId, onClose }: AddGuestFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    startTransition(async () => {
      const { error: insertError } = await supabase.from('guest_list').insert({
        wedding_id: weddingId,
        full_name: formData.get('full_name') as string,
        relationship: (formData.get('relationship') as string) || null,
        side: (formData.get('side') as string) || null,
        email: (formData.get('email') as string) || null,
        phone: (formData.get('phone') as string) || null,
        rsvp_status: 'pending',
        dietary_requirements: (formData.get('dietary_requirements') as string) || null,
        plus_ones: Number(formData.get('plus_ones') ?? 0),
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

  return (
    <div className="bg-[#FAF7F5] rounded-xl border border-[#8B1D4F]/15 p-6 mt-4">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-gray-900" style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          Add Guest
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
        <div className="grid grid-cols-2 gap-4">
          <Input label="Full name" name="full_name" placeholder="e.g. Aisha Khan" required />
          <Input label="Relationship" name="relationship" placeholder="e.g. Cousin, Friend" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Side"
            name="side"
            placeholder="Select side"
            options={[
              { value: 'bride', label: "Bride's side" },
              { value: 'groom', label: "Groom's side" },
              { value: 'joint', label: 'Joint' },
            ]}
          />
          <Input
            label="Plus ones"
            name="plus_ones"
            type="number"
            min="0"
            max="10"
            defaultValue="0"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Email" name="email" type="email" placeholder="optional" />
          <Input label="Phone" name="phone" type="tel" placeholder="optional" />
        </div>

        <Input
          label="Dietary requirements"
          name="dietary_requirements"
          placeholder="e.g. Vegetarian, Halal, Gluten-free"
        />

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
            {isPending ? <Spinner size="sm" /> : 'Add Guest'}
          </Button>
        </div>
      </form>
    </div>
  )
}
