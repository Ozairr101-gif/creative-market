'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, Store } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { getAuthErrorMessage } from '@/lib/supabase/auth-errors'

type Role = 'couple' | 'vendor'

export default function SignupForm() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    if (!role) {
      setError('Please select whether you are planning a wedding or a vendor.')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const { error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim() || undefined,
            role,
          },
        },
      })

      if (signUpError) {
        setError(getAuthErrorMessage(signUpError.message))
        return
      }

      setSuccess(true)
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-5 py-4 text-center">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ backgroundColor: '#FFF0F5' }}
        >
          <Heart
            className="w-8 h-8"
            style={{ color: '#8B1D4F' }}
            fill="#8B1D4F"
          />
        </div>
        <div>
          <h2
            className="text-xl font-semibold"
            style={{ color: '#1A1210' }}
          >
            Check your email
          </h2>
          <p
            className="mt-2 text-sm leading-relaxed"
            style={{ color: '#9B8A82' }}
          >
            We sent a confirmation link to{' '}
            <span className="font-medium" style={{ color: '#3D2B24' }}>
              {email}
            </span>
            . Click the link to activate your account.
          </p>
        </div>
        <p className="text-xs" style={{ color: '#B0A09A' }}>
          Didn&apos;t receive it? Check your spam folder or{' '}
          <button
            type="button"
            onClick={() => setSuccess(false)}
            className="underline underline-offset-2 hover:opacity-75 transition-opacity"
            style={{ color: '#8B1D4F' }}
          >
            try again
          </button>
          .
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {/* Full name */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="full-name"
          className="text-sm font-medium"
          style={{ color: '#3D2B24' }}
        >
          Full name
        </label>
        <input
          id="full-name"
          type="text"
          autoComplete="name"
          required
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Priya & Arjun Sharma"
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

      {/* Phone (optional) */}
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="phone"
          className="text-sm font-medium flex items-center gap-1.5"
          style={{ color: '#3D2B24' }}
        >
          Phone number
          <span
            className="text-xs font-normal"
            style={{ color: '#B0A09A' }}
          >
            (optional)
          </span>
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+91 98765 43210"
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
        <label
          htmlFor="password"
          className="text-sm font-medium"
          style={{ color: '#3D2B24' }}
        >
          Password
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
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

      {/* Role selection */}
      <div className="flex flex-col gap-2">
        <span
          className="text-sm font-medium"
          style={{ color: '#3D2B24' }}
        >
          I am…
        </span>
        <div className="grid grid-cols-2 gap-3">
          {/* Couple card */}
          <button
            type="button"
            onClick={() => setRole('couple')}
            className="relative flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-5 text-center transition-all"
            style={{
              borderColor: role === 'couple' ? '#8B1D4F' : '#DDD5CF',
              backgroundColor:
                role === 'couple' ? '#FFF0F5' : '#FDFCFB',
              color: role === 'couple' ? '#8B1D4F' : '#6B5A53',
            }}
          >
            {role === 'couple' && (
              <div
                className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#8B1D4F' }}
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="w-2.5 h-2.5 text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                backgroundColor:
                  role === 'couple' ? '#8B1D4F' : '#F0EAE6',
              }}
            >
              <Heart
                className="w-5 h-5"
                style={{
                  color: role === 'couple' ? '#FFFFFF' : '#9B8A82',
                }}
                fill={role === 'couple' ? '#FFFFFF' : 'none'}
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Planning a wedding
              </p>
              <p
                className="text-xs mt-0.5 leading-snug"
                style={{
                  color: role === 'couple' ? '#A85070' : '#B0A09A',
                }}
              >
                Couple or family
              </p>
            </div>
          </button>

          {/* Vendor card */}
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className="relative flex flex-col items-center gap-3 rounded-2xl border-2 px-4 py-5 text-center transition-all"
            style={{
              borderColor: role === 'vendor' ? '#8B1D4F' : '#DDD5CF',
              backgroundColor:
                role === 'vendor' ? '#FFF0F5' : '#FDFCFB',
              color: role === 'vendor' ? '#8B1D4F' : '#6B5A53',
            }}
          >
            {role === 'vendor' && (
              <div
                className="absolute top-2.5 right-2.5 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#8B1D4F' }}
              >
                <svg
                  viewBox="0 0 12 12"
                  fill="none"
                  className="w-2.5 h-2.5 text-white"
                  aria-hidden="true"
                >
                  <path
                    d="M2 6l3 3 5-5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            )}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center"
              style={{
                backgroundColor:
                  role === 'vendor' ? '#8B1D4F' : '#F0EAE6',
              }}
            >
              <Store
                className="w-5 h-5"
                style={{
                  color: role === 'vendor' ? '#FFFFFF' : '#9B8A82',
                }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                Wedding vendor
              </p>
              <p
                className="text-xs mt-0.5 leading-snug"
                style={{
                  color: role === 'vendor' ? '#A85070' : '#B0A09A',
                }}
              >
                Photographer, caterer…
              </p>
            </div>
          </button>
        </div>
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
        className="w-full rounded-xl py-3.5 text-sm font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed mt-1"
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
            Creating account…
          </span>
        ) : (
          'Create Account'
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px" style={{ backgroundColor: '#EDE8E5' }} />
        <span className="text-xs" style={{ color: '#B0A09A' }}>
          Already have an account?
        </span>
        <div className="flex-1 h-px" style={{ backgroundColor: '#EDE8E5' }} />
      </div>

      <Link
        href="/auth/login"
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
        Sign in instead
      </Link>
    </form>
  )
}
