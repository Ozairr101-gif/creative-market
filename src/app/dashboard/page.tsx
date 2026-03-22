import { createClient } from '@/lib/supabase/server'
import type { Wedding } from '@/lib/types/database'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { CalendarDays, Users, Sparkles, ArrowRight, Heart } from 'lucide-react'

export const metadata = {
  title: 'My Weddings — Shaadi HQ',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: weddings } = await supabase
    .from('weddings')
    .select('*')
    .order('main_date', { ascending: true })
    .returns<Wedding[]>()

  if (!weddings || weddings.length === 0) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Rose card */}
          <div
            className="relative rounded-2xl overflow-hidden mb-8 p-10"
            style={{
              background: 'linear-gradient(135deg, #8B1D4F 0%, #a02460 50%, #C9973F 100%)',
            }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-white/5" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-5">
                <Heart size={28} className="text-white fill-white" />
              </div>
              <h1
                className="text-3xl font-bold text-white mb-3"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Start planning your
                <br />
                perfect day
              </h1>
              <p className="text-white/80 text-base leading-relaxed">
                Create your wedding workspace to begin planning all your events
              </p>
            </div>
          </div>

          <p className="text-gray-500 mb-6 text-sm leading-relaxed">
            From mehndi to walima, manage every event, vendor, task, and guest in one beautiful place.
          </p>

          <Link href="/dashboard/weddings/new">
            <Button size="lg" className="w-full sm:w-auto">
              <Sparkles size={16} />
              Create Wedding
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1
              className="text-2xl font-bold text-gray-900"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              My Weddings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {weddings.length} wedding{weddings.length !== 1 ? 's' : ''} in your workspace
            </p>
          </div>
          <Link href="/dashboard/weddings/new">
            <Button size="sm">
              <Sparkles size={14} />
              Add Wedding
            </Button>
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {weddings.map((wedding) => (
            <WeddingCard key={wedding.id} wedding={wedding} />
          ))}
        </div>
      </div>
    </div>
  )
}

function WeddingCard({ wedding }: { wedding: Wedding }) {
  const coupleName =
    wedding.bride_name && wedding.groom_name
      ? `${wedding.bride_name} & ${wedding.groom_name}`
      : wedding.title

  return (
    <Card hover className="overflow-hidden">
      {/* Colored top border */}
      <div className="h-1 -mx-6 -mt-6 mb-5 bg-gradient-to-r from-[#8B1D4F] to-[#C9973F]" />

      <CardHeader className="mb-3">
        <CardTitle style={{ fontFamily: 'Playfair Display, Georgia, serif' }}>
          {wedding.title}
        </CardTitle>
        {coupleName !== wedding.title && (
          <p className="text-sm text-[#8B1D4F] font-medium mt-0.5">{coupleName}</p>
        )}
      </CardHeader>

      <CardContent>
        <div className="flex flex-wrap gap-4 mb-5">
          {wedding.main_date && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <CalendarDays size={14} className="text-[#C9973F]" />
              {formatDate(wedding.main_date)}
            </div>
          )}
          {wedding.estimated_guests && (
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Users size={14} className="text-[#C9973F]" />
              {wedding.estimated_guests.toLocaleString()} guests
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Events', href: `/dashboard/weddings/${wedding.id}/events` },
            { label: 'Vendors', href: `/dashboard/weddings/${wedding.id}/vendors` },
            { label: 'Tasks', href: `/dashboard/weddings/${wedding.id}/tasks` },
            { label: 'Budget', href: `/dashboard/weddings/${wedding.id}/budget` },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs px-2.5 py-1 rounded-full bg-[#8B1D4F]/8 text-[#8B1D4F] hover:bg-[#8B1D4F]/15 transition-colors font-medium"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </CardContent>

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
        <Link
          href={`/dashboard/weddings/${wedding.id}`}
          className="inline-flex items-center gap-1 text-sm text-[#8B1D4F] font-medium hover:gap-2 transition-all"
        >
          Open workspace
          <ArrowRight size={14} />
        </Link>
      </div>
    </Card>
  )
}
