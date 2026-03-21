import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Shaadi HQ — Auth',
}

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: '#FAF7F5' }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
              style={{ backgroundColor: '#8B1D4F' }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-white"
                aria-hidden="true"
              >
                <path
                  d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ color: '#8B1D4F' }}
            >
              Shaadi HQ
            </span>
          </Link>
          <p className="mt-2 text-sm" style={{ color: '#9B8A82' }}>
            Your wedding, beautifully planned
          </p>
        </div>

        {/* Card */}
        <div
          className="w-full rounded-2xl shadow-lg border px-8 py-10"
          style={{ backgroundColor: '#FFFFFF', borderColor: '#EDE8E5' }}
        >
          {children}
        </div>

        <p className="mt-6 text-center text-xs" style={{ color: '#B0A09A' }}>
          By continuing, you agree to our{' '}
          <Link
            href="/terms"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: '#8B1D4F' }}
          >
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link
            href="/privacy"
            className="underline underline-offset-2 hover:opacity-80 transition-opacity"
            style={{ color: '#8B1D4F' }}
          >
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
