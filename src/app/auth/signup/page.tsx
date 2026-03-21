import type { Metadata } from 'next'
import SignupForm from './SignupForm'

export const metadata: Metadata = {
  title: 'Create account — Shaadi HQ',
  description: 'Create your free Shaadi HQ account and start planning your dream wedding.',
}

export default function SignupPage() {
  return (
    <>
      <div className="mb-7 text-center">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#1A1210' }}
        >
          Create your account
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#9B8A82' }}>
          Join thousands of couples and vendors on Shaadi HQ
        </p>
      </div>
      <SignupForm />
    </>
  )
}
