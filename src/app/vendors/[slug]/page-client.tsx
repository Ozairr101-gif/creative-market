'use client'

import { useState, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface ShortlistButtonProps {
  vendorId: string
  initialShortlisted: boolean
  weddingId: string | null
}

export function ShortlistButton({ vendorId, initialShortlisted, weddingId }: ShortlistButtonProps) {
  const [shortlisted, setShortlisted] = useState(initialShortlisted)
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      const supabase = createClient()

      // Check session
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        // Redirect to login
        window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname)
        return
      }

      if (!weddingId) {
        // No wedding — prompt to create one
        window.location.href = '/dashboard'
        return
      }

      if (shortlisted) {
        // Remove from shortlist
        await supabase
          .from('vendor_shortlist')
          .delete()
          .eq('vendor_id', vendorId)
          .eq('wedding_id', weddingId)
        setShortlisted(false)
      } else {
        // Add to shortlist
        await supabase.from('vendor_shortlist').insert({
          vendor_id: vendorId,
          wedding_id: weddingId,
        })
        setShortlisted(true)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={shortlisted ? 'Remove from shortlist' : 'Add to shortlist'}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-150',
        'border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#8B1D4F]',
        'disabled:pointer-events-none disabled:opacity-50',
        shortlisted
          ? 'bg-[#8B1D4F]/08 border-[#8B1D4F]/30 text-[#8B1D4F]'
          : 'border-gray-200 text-gray-700 hover:border-[#8B1D4F]/30 hover:text-[#8B1D4F] hover:bg-[#8B1D4F]/04',
      )}
    >
      <Heart
        size={15}
        className="transition-all"
        fill={shortlisted ? 'currentColor' : 'none'}
        aria-hidden="true"
      />
      {shortlisted ? 'Shortlisted' : 'Add to Shortlist'}
    </button>
  )
}
