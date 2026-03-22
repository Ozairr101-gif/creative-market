import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { VendorCategory, EventType } from './types/database'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(pence: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(pence / 100)
}

export function formatCurrencyRange(from: number | null, to: number | null): string {
  if (!from && !to) return 'POA'
  if (from && !to) return `From ${formatCurrency(from)}`
  if (!from && to) return `Up to ${formatCurrency(to)}`
  return `${formatCurrency(from!)} – ${formatCurrency(to!)}`
}

export const VENDOR_CATEGORY_LABELS: Record<VendorCategory, string> = {
  venue: 'Venues',
  caterer: 'Caterers',
  photographer: 'Photographers',
  videographer: 'Videographers',
  decorator: 'Decorators & Mandap',
  bridalwear: 'Bridalwear',
  mehndi_artist: 'Mehndi Artists',
  dj: 'DJs & Entertainment',
  officiant: 'Officiants & Priests',
  wedding_planner: 'Wedding Planners',
  transport: 'Transport',
  hair_makeup: 'Hair & Makeup',
  other: 'Other',
}

export const VENDOR_CATEGORY_ICONS: Record<VendorCategory, string> = {
  venue: '🏛️',
  caterer: '🍽️',
  photographer: '📸',
  videographer: '🎥',
  decorator: '✨',
  bridalwear: '👗',
  mehndi_artist: '🌿',
  dj: '🎵',
  officiant: '📿',
  wedding_planner: '📋',
  transport: '🚗',
  hair_makeup: '💄',
  other: '⭐',
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  engagement: 'Engagement',
  mehndi: 'Mehndi',
  haldi: 'Haldi',
  sangeet: 'Sangeet',
  nikah: 'Nikah',
  shaadi: 'Shaadi',
  walima: 'Walima',
  reception: 'Reception',
  custom: 'Custom Event',
}

export const EVENT_TYPE_COLORS: Record<EventType, string> = {
  engagement: 'bg-rose-100 text-rose-700',
  mehndi: 'bg-green-100 text-green-700',
  haldi: 'bg-yellow-100 text-yellow-700',
  sangeet: 'bg-purple-100 text-purple-700',
  nikah: 'bg-emerald-100 text-emerald-700',
  shaadi: 'bg-red-100 text-red-700',
  walima: 'bg-orange-100 text-orange-700',
  reception: 'bg-blue-100 text-blue-700',
  custom: 'bg-gray-100 text-gray-700',
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  })
}

export const UK_CITIES = [
  'London',
  'Birmingham',
  'Manchester',
  'Leeds',
  'Bradford',
  'Leicester',
  'Coventry',
  'Wolverhampton',
  'Sheffield',
  'Luton',
  'Slough',
  'Nottingham',
  'Bristol',
  'Liverpool',
  'Glasgow',
  'Edinburgh',
]

export const VENDOR_CATEGORIES: VendorCategory[] = [
  'venue',
  'caterer',
  'photographer',
  'videographer',
  'decorator',
  'bridalwear',
  'mehndi_artist',
  'dj',
  'officiant',
  'wedding_planner',
  'transport',
  'hair_makeup',
  'other',
]

export const EVENT_TYPES: EventType[] = [
  'engagement',
  'mehndi',
  'haldi',
  'sangeet',
  'nikah',
  'shaadi',
  'walima',
  'reception',
  'custom',
]
