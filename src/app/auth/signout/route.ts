import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'))
}

export const GET = signOut
export const POST = signOut
