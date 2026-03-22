'use client'

import { cn } from '@/lib/utils'
import { Menu, Sparkles, X, ChevronDown, LogOut, LayoutDashboard, Store } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef, useEffect } from 'react'
import { Avatar } from '@/components/ui/avatar'
import { SignOutButton } from '@/components/shared/sign-out-button'

interface NavUser {
  id: string
  role: string
  full_name: string
}

interface NavProps {
  user: NavUser | null
}

const navLinks = [
  { href: '/vendors', label: 'Browse Vendors' },
  { href: '/how-it-works', label: 'How it Works' },
  { href: '/pricing', label: 'Pricing' },
]

export function Nav({ user }: NavProps) {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function closeMenus() {
    setMobileOpen(false)
    setDropdownOpen(false)
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#8B1D4F]/10 bg-[#FAF7F5]/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          onClick={closeMenus}
          className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded-md"
        >
          <Sparkles
            size={22}
            className="text-[#C9973F]"
            aria-hidden="true"
          />
          <span
            className="text-xl font-bold text-[#8B1D4F] tracking-tight"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            Shaadi HQ
          </span>
        </Link>

        {/* Desktop center links */}
        <ul className="hidden md:flex items-center gap-1" role="list">
          {navLinks.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={closeMenus}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150',
                  'hover:text-[#8B1D4F] hover:bg-[#8B1D4F]/5',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F]',
                  pathname.startsWith(href)
                    ? 'text-[#8B1D4F] bg-[#8B1D4F]/5'
                    : 'text-gray-600',
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop right side */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className={cn(
                    'flex items-center gap-2 rounded-full pr-2 pl-1 py-1',
                    'hover:bg-[#8B1D4F]/5 transition-colors duration-150',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F]',
                  )}
                  aria-expanded={dropdownOpen}
                  aria-haspopup="menu"
                >
                  <Avatar name={user.full_name} size="sm" />
                  <span className="text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {user.full_name.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-gray-400 transition-transform duration-150',
                      dropdownOpen && 'rotate-180',
                    )}
                    aria-hidden="true"
                  />
                </button>

                {dropdownOpen && (
                  <div
                    role="menu"
                    className={cn(
                      'absolute right-0 top-full mt-1.5 w-52 rounded-xl bg-white py-1',
                      'shadow-lg border border-gray-100',
                      '[box-shadow:0_8px_24px_-4px_rgba(139,29,79,0.12)]',
                    )}
                  >
                    <Link
                      href="/dashboard"
                      onClick={closeMenus}
                      role="menuitem"
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FAF7F5] hover:text-[#8B1D4F] transition-colors duration-100"
                    >
                      <LayoutDashboard size={15} aria-hidden="true" />
                      Dashboard
                    </Link>
                    {user.role === 'vendor' && (
                      <Link
                        href="/vendor-hub"
                        onClick={closeMenus}
                        role="menuitem"
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#FAF7F5] hover:text-[#8B1D4F] transition-colors duration-100"
                      >
                        <Store size={15} aria-hidden="true" />
                        Vendor Hub
                      </Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <SignOutButton
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-100 disabled:opacity-60"
                    >
                      <LogOut size={15} aria-hidden="true" />
                      Sign out
                    </SignOutButton>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/auth/login"
                onClick={closeMenus}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium text-gray-600',
                  'hover:text-[#8B1D4F] transition-colors duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F]',
                )}
              >
                Login
              </Link>
              <Link
                href="/vendors"
                onClick={closeMenus}
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150',
                  'bg-[#8B1D4F] text-white hover:bg-[#7a1944] active:bg-[#6b1639]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] focus-visible:ring-offset-2',
                  'px-3 py-1.5 text-sm',
                )}
              >
                Find Vendors
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className={cn(
            'md:hidden rounded-md p-2 text-gray-600',
            'hover:text-[#8B1D4F] hover:bg-[#8B1D4F]/5 transition-colors duration-150',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F]',
          )}
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileOpen ? (
            <X size={22} aria-hidden="true" />
          ) : (
            <Menu size={22} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#8B1D4F]/10 bg-[#FAF7F5] px-4 py-4">
          <ul className="flex flex-col gap-1" role="list">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={closeMenus}
                  className={cn(
                    'block rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150',
                    'hover:text-[#8B1D4F] hover:bg-[#8B1D4F]/5',
                    pathname.startsWith(href)
                      ? 'text-[#8B1D4F] bg-[#8B1D4F]/5'
                      : 'text-gray-700',
                  )}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <hr className="my-3 border-gray-200" />
          {user ? (
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-3 px-3 py-2">
                <Avatar name={user.full_name} size="sm" />
                <span className="text-sm font-medium text-gray-800">
                  {user.full_name}
                </span>
              </div>
              <Link
                href="/dashboard"
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-[#8B1D4F]/5 hover:text-[#8B1D4F] transition-colors duration-100"
              >
                <LayoutDashboard size={15} aria-hidden="true" />
                Dashboard
              </Link>
              {user.role === 'vendor' && (
                <Link
                  href="/vendor-hub"
                  onClick={closeMenus}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-gray-700 hover:bg-[#8B1D4F]/5 hover:text-[#8B1D4F] transition-colors duration-100"
                >
                  <Store size={15} aria-hidden="true" />
                  Vendor Hub
                </Link>
              )}
              <SignOutButton
                className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors duration-100 disabled:opacity-60"
              >
                <LogOut size={15} aria-hidden="true" />
                Sign out
              </SignOutButton>
            </div>
          ) : (
            <div className="flex flex-col gap-2 pt-1">
              <Link
                href="/auth/login"
                className="block rounded-md px-3 py-2.5 text-sm font-medium text-gray-700 hover:text-[#8B1D4F] hover:bg-[#8B1D4F]/5 transition-colors duration-150"
              >
                Login
              </Link>
              <Link
                href="/vendors"
                className={cn(
                  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors duration-150',
                  'bg-[#8B1D4F] text-white hover:bg-[#7a1944] active:bg-[#6b1639]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] focus-visible:ring-offset-2',
                  'w-full px-4 py-2 text-sm',
                )}
              >
                Find Vendors
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
