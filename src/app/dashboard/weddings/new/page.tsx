import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import NewWeddingForm from './NewWeddingForm'
import { Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Create Wedding — Shaadi HQ',
}

export default async function NewWeddingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#8B1D4F] flex items-center justify-center mx-auto mb-4">
            <Heart size={24} className="text-white fill-white" />
          </div>
          <h1
            className="text-2xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Create your wedding workspace
          </h1>
          <p className="text-sm text-gray-500 max-w-sm mx-auto">
            Set up your planning hub for events, vendors, tasks, budgets and guests — all in one place.
          </p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-2xl border border-[#8B1D4F]/10 p-6 sm:p-8 shadow-sm">
          <NewWeddingForm />
        </div>
      </div>
    </div>
  )
}
