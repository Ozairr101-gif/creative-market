import { Sparkles } from 'lucide-react'
import Link from 'next/link'

const footerLinks = [
  { href: '/vendors', label: 'Vendors' },
  { href: '/how-it-works', label: 'How it Works' },
  { href: '/for-vendors', label: 'For Vendors' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function Footer() {
  return (
    <footer className="bg-[#FAF7F5] border-t border-[#8B1D4F]/10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center gap-6 text-center">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded-md"
            >
              <Sparkles size={20} className="text-[#C9973F]" aria-hidden="true" />
              <span
                className="text-xl font-bold text-[#8B1D4F] tracking-tight"
                style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
              >
                Shaadi HQ
              </span>
            </Link>
            <p className="text-sm text-gray-500 max-w-xs">
              Your complete Asian wedding platform
            </p>
          </div>

          {/* Nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2" role="list">
              {footerLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sm text-gray-500 hover:text-[#8B1D4F] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Divider */}
          <hr className="w-full border-[#8B1D4F]/10" />

          {/* Bottom row */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>© 2026 Shaadi HQ</span>
            <span aria-hidden="true">•</span>
            <Link
              href="/privacy"
              className="hover:text-[#8B1D4F] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded"
            >
              Privacy Policy
            </Link>
            <span aria-hidden="true">•</span>
            <Link
              href="/terms"
              className="hover:text-[#8B1D4F] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B1D4F] rounded"
            >
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
