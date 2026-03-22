import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Profile, Wedding } from '@/lib/types/database'
import { Heart, LayoutDashboard, PlusCircle, Menu } from 'lucide-react'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single<Profile>()

  if (profile?.role === 'vendor') {
    redirect('/vendor-hub')
  }

  const { data: weddings } = await supabase
    .from('weddings')
    .select('id, title, main_date, bride_name, groom_name')
    .order('created_at', { ascending: false })
    .returns<Pick<Wedding, 'id' | 'title' | 'main_date' | 'bride_name' | 'groom_name'>[]>()

  const displayName = profile?.full_name ?? user.email ?? 'You'
  const initials = displayName
    .split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className="min-h-screen bg-[#FAF7F5]">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 right-0 z-40 h-16 bg-white border-b border-[#8B1D4F]/10 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-[#8B1D4F] flex items-center justify-center">
              <Heart size={14} className="text-white fill-white" />
            </div>
            <span
              className="text-lg font-semibold text-[#8B1D4F] hidden sm:block"
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Shaadi HQ
            </span>
          </Link>
        </div>

        {/* User Avatar */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">{displayName}</span>
          <div className="w-9 h-9 rounded-full bg-[#8B1D4F] flex items-center justify-center text-white text-sm font-semibold">
            {initials}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar — desktop */}
        <aside className="hidden md:flex flex-col fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-[#8B1D4F]/10 overflow-y-auto z-30">
          {/* Decorative top band */}
          <div className="h-1 bg-gradient-to-r from-[#8B1D4F] via-[#C9973F] to-[#8B1D4F]" />

          <nav className="flex-1 px-3 py-5 space-y-1">
            {/* Dashboard overview */}
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-[#8B1D4F]/5 hover:text-[#8B1D4F] transition-colors group"
            >
              <LayoutDashboard size={16} className="text-[#C9973F]" />
              My Weddings
            </Link>

            {/* Wedding list */}
            {weddings && weddings.length > 0 && (
              <div className="pt-3">
                <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-widest text-[#8B1D4F]/50">
                  Your Weddings
                </p>
                <div className="space-y-0.5">
                  {weddings.map((w) => (
                    <Link
                      key={w.id}
                      href={`/dashboard/weddings/${w.id}`}
                      className="block px-3 py-2.5 rounded-lg group hover:bg-[#8B1D4F]/5 transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 w-5 h-5 rounded-full bg-[#8B1D4F]/10 flex items-center justify-center shrink-0">
                          <Heart size={10} className="text-[#8B1D4F]" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate group-hover:text-[#8B1D4F] transition-colors leading-tight">
                            {w.title}
                          </p>
                          {w.main_date && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(w.main_date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* Add Wedding CTA */}
          <div className="p-4 border-t border-[#8B1D4F]/10">
            <Link
              href="/dashboard/weddings/new"
              className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg bg-[#8B1D4F]/5 border border-[#8B1D4F]/20 text-[#8B1D4F] text-sm font-medium hover:bg-[#8B1D4F]/10 transition-colors"
            >
              <PlusCircle size={15} />
              Add Wedding
            </Link>
          </div>
        </aside>

        {/* Mobile tab bar */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#8B1D4F]/10 flex items-center justify-around h-16 px-2">
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-[#8B1D4F] hover:bg-[#8B1D4F]/5 transition-colors"
          >
            <LayoutDashboard size={20} />
            <span className="text-xs">Weddings</span>
          </Link>
          <Link
            href="/dashboard/weddings/new"
            className="flex flex-col items-center gap-1 p-2 rounded-lg text-[#C9973F] hover:bg-[#C9973F]/5 transition-colors"
          >
            <PlusCircle size={20} />
            <span className="text-xs">New</span>
          </Link>
        </nav>

        {/* Main content */}
        <main className="flex-1 md:ml-64 pb-16 md:pb-0 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  )
}
