import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? null

  if (!code) {
    // No code present — redirect to login with an error indicator
    return NextResponse.redirect(
      new URL('/auth/login?error=missing_code', origin)
    )
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    return NextResponse.redirect(
      new URL('/auth/login?error=confirmation_failed', origin)
    )
  }

  // If a `next` param was passed (e.g. from middleware), honour it after
  // validating it is a relative path to prevent open-redirect attacks.
  if (next && next.startsWith('/')) {
    return NextResponse.redirect(new URL(next, origin))
  }

  // Determine redirect destination from role stored in profiles table
  const userId = data.session.user.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single()

  const role = profile?.role as string | undefined

  if (role === 'vendor') {
    return NextResponse.redirect(new URL('/vendor-hub', origin))
  }

  return NextResponse.redirect(new URL('/dashboard', origin))
}
