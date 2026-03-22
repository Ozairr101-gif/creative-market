'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getAuthErrorMessage } from '@/lib/supabase/auth-errors'

export default function LoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (signInError) {
        setError(getAuthErrorMessage(signInError.message))
        return
      }

      const userId = data.user?.id
      if (!userId) {
        setError('Sign in failed. Please try again.')
        return
      }

      // Fetch role to redirect correctly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      router.refresh()

      if (profile?.role === 'vendor') {
        router.push('/vendor-hub')
      } else {
        router.push('/dashboard')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="email"
          className="text-sm font-medium"
          style={{ color: '#3D2B24' }}
        >
          Email address
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
          style={{
            borderColor: '#DDD5CF',
            color: '#1A1210',
            backgroundColor: '#FDFCFB',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#8B1D4F'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,29,79,0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#DDD5CF'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-sm font-medium"
            style={{ color: '#3D2B24' }}
          >
            Password
          </label>
          <Link
            href="/auth/forgot-password"
            className="text-xs font-medium transition-opacity hover:opacity-75"
            style={{ color: '#8B1D4F' }}
          >
            Forgot password?
          </Link>
        </div>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all"
          style={{
            borderColor: '#DDD5CF',
            color: '#1A1210',
            backgroundColor: '#FDFCFB',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#8B1D4F'
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,29,79,0.1)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#DDD5CF'
            e.currentTarget.style.boxShadow = 'none'
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div
          className="rounded-xl border px-4 py-3 text-sm"
          style={{
            backgroundColor: '#FFF0F5',
            borderColor: '#F5C2D5',
            color: '#8B1D4F',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        style={{ backgroundColor: '#8B1D4F' }}
        onMouseEnter={(e) => {
          if (!loading) e.currentTarget.style.backgroundColor = '#731842'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#8B1D4F'
        }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg
              className="animate-spin h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            Signing in…
          </span>
        ) : (
          'Sign in'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px" style={{ backgroundColor: '#EDE8E5' }} />
        <span className="text-xs" style={{ color: '#B0A09A' }}>
          New to Shaadi HQ?
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#EDE8E5' }} />
      </div>

      <Link
        href="/auth/signup"
        className="w-full rounded-xl border py-3.5 text-sm font-semibold text-center transition-all"
        style={{
          borderColor: '#8B1D4F',
          color: '#8B1D4F',
          backgroundColor: 'transparent',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#FFF0F5'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent'
        }}
      >
        Create an account
      </Link>
    </form>
  )
}
