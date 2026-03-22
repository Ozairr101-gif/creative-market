'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface SignOutButtonProps {
  className?: string
  children: React.ReactNode
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  async function handleSignOut() {
    if (isSigningOut) return

    setIsSigningOut(true)

    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.refresh()
      window.location.replace('/')
    } catch {
      window.location.replace('/auth/signout')
    }
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSigningOut}
      className={className}
    >
      {children}
    </button>
  )
}
