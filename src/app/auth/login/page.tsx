import type { Metadata } from 'next'
import LoginForm from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in — Shaadi HQ',
  description: 'Sign in to your Shaadi HQ account.',
}

export default function LoginPage() {
  return (
    <>
      <div className="mb-7 text-center">
        <h1
          className="text-2xl font-semibold tracking-tight"
          style={{ color: '#1A1210' }}
        >
          Welcome back
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#9B8A82' }}>
          Sign in to continue planning your perfect day
        </p>
      </div>
      <LoginForm />
    </>
  )
}
