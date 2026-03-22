'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'
import { Sparkles } from 'lucide-react'

export default function NewWeddingForm() {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [brideName, setBrideName] = useState('')
  const [groomName, setGroomName] = useState('')
  const [title, setTitle] = useState('')
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false)

  // Auto-suggest title from names
  useEffect(() => {
    if (!titleManuallyEdited) {
      if (brideName && groomName) {
        setTitle(`${brideName} & ${groomName}'s Wedding`)
      } else if (brideName) {
        setTitle(`${brideName}'s Wedding`)
      } else if (groomName) {
        setTitle(`${groomName}'s Wedding`)
      } else {
        setTitle('')
      }
    }
  }, [brideName, groomName, titleManuallyEdited])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setError('You must be logged in.')
      setIsPending(false)
      return
    }

    const estimatedGuests = formData.get('estimated_guests')
    const totalBudget = formData.get('total_budget_gbp')
    const mainDate = formData.get('main_date')

    const { data: wedding, error: insertError } = await supabase
      .from('weddings')
      .insert({
        title: title || 'My Wedding',
        bride_name: brideName || null,
        groom_name: groomName || null,
        main_date: mainDate ? String(mainDate) : null,
        estimated_guests: estimatedGuests ? Number(estimatedGuests) : null,
        total_budget_gbp: totalBudget ? Math.round(Number(totalBudget) * 100) : null,
        created_by: user.id,
        status: 'planning',
      })
      .select('id')
      .single()

    if (insertError || !wedding) {
      setError(insertError?.message ?? 'Failed to create wedding.')
      setIsPending(false)
      return
    }

    // Add couple as lead collaborator
    await supabase.from('wedding_collaborators').insert({
      wedding_id: wedding.id,
      user_id: user.id,
      role: 'lead',
      can_book: true,
      can_pay: true,
      can_invite: true,
    })

    router.push(`/dashboard/weddings/${wedding.id}/events`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Names */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-[#8B1D4F]/60 mb-3">
          Your names
        </p>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Bride's name"
            name="bride_name"
            value={brideName}
            onChange={(e) => setBrideName(e.target.value)}
            placeholder="e.g. Priya"
            autoComplete="off"
          />
          <Input
            label="Groom's name"
            name="groom_name"
            value={groomName}
            onChange={(e) => setGroomName(e.target.value)}
            placeholder="e.g. Rahul"
            autoComplete="off"
          />
        </div>
      </div>

      {/* Title */}
      <div>
        <Input
          label="Wedding title"
          name="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value)
            setTitleManuallyEdited(true)
          }}
          placeholder="e.g. Priya & Rahul's Wedding"
          required
          helperText="This will be the name of your wedding workspace."
        />
      </div>

      {/* Date */}
      <Input
        label="Main wedding date"
        name="main_date"
        type="date"
        min={new Date().toISOString().split('T')[0]}
      />

      {/* Guests + Budget */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Estimated guests"
          name="estimated_guests"
          type="number"
          min="1"
          max="10000"
          placeholder="e.g. 300"
        />
        <Input
          label="Total budget (£)"
          name="total_budget_gbp"
          type="number"
          min="0"
          step="100"
          placeholder="e.g. 25000"
          helperText="Enter in pounds (£)"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={isPending || !title}>
        {isPending ? (
          <>
            <Spinner size="sm" />
            Creating wedding…
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Create Wedding Workspace
          </>
        )}
      </Button>
    </form>
  )
}
