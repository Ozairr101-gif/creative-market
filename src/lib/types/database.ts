export type UserRole = 'couple' | 'vendor' | 'admin'
export type VendorStatus = 'active' | 'inactive' | 'suspended' | 'pending_review'
export type VendorCategory =
  | 'venue'
  | 'caterer'
  | 'photographer'
  | 'videographer'
  | 'decorator'
  | 'bridalwear'
  | 'mehndi_artist'
  | 'dj'
  | 'officiant'
  | 'wedding_planner'
  | 'transport'
  | 'hair_makeup'
  | 'other'

export type EventType =
  | 'engagement'
  | 'mehndi'
  | 'haldi'
  | 'sangeet'
  | 'nikah'
  | 'shaadi'
  | 'walima'
  | 'reception'
  | 'custom'

export type InquiryStatus = 'sent' | 'viewed' | 'responded' | 'expired' | 'declined'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'declined' | 'expired'
export type BookingStatus = 'confirmed' | 'deposit_paid' | 'in_progress' | 'completed' | 'cancelled' | 'disputed'
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded' | 'partially_refunded'
export type TaskStatus = 'todo' | 'in_progress' | 'done' | 'blocked'
export type TaskPriority = 'low' | 'medium' | 'high'
export type RsvpStatus = 'pending' | 'attending' | 'declined' | 'maybe'
export type WeddingStatus = 'planning' | 'complete' | 'archived'
export type CollaboratorRole = 'lead' | 'planner' | 'family' | 'viewer'
export type VerificationTier = 'none' | 'basic' | 'enhanced'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface Wedding {
  id: string
  title: string
  created_by: string
  bride_name: string | null
  groom_name: string | null
  estimated_guests: number | null
  total_budget_gbp: number | null
  main_date: string | null
  status: WeddingStatus
  cover_image_url: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WeddingCollaborator {
  id: string
  wedding_id: string
  user_id: string
  role: CollaboratorRole
  can_book: boolean
  can_pay: boolean
  can_invite: boolean
  invited_at: string
}

export interface WeddingEvent {
  id: string
  wedding_id: string
  type: EventType
  name: string | null
  event_date: string | null
  start_time: string | null
  end_time: string | null
  venue_name: string | null
  estimated_guests: number | null
  dress_code: string | null
  notes: string | null
  sort_order: number
  created_at: string
}

export interface Vendor {
  id: string
  user_id: string
  business_name: string
  slug: string
  category: VendorCategory
  tagline: string | null
  description: string | null
  service_areas: string[]
  price_from_gbp: number | null
  price_to_gbp: number | null
  min_guests: number | null
  max_guests: number | null
  years_experience: number | null
  team_size: number | null
  website_url: string | null
  instagram_url: string | null
  facebook_url: string | null
  verified: boolean
  verification_tier: VerificationTier
  stripe_account_id: string | null
  status: VendorStatus
  featured: boolean
  profile_image_url: string | null
  created_at: string
  updated_at: string
}

export interface VendorGalleryItem {
  id: string
  vendor_id: string
  url: string
  caption: string | null
  sort_order: number
  created_at: string
}

export interface VendorPackage {
  id: string
  vendor_id: string
  name: string
  description: string | null
  price_gbp: number | null
  price_type: 'fixed' | 'per_head' | 'from' | 'poa'
  includes: string[]
  sort_order: number
}

export interface Inquiry {
  id: string
  vendor_id: string
  wedding_id: string
  event_id: string | null
  sent_by: string
  event_date: string | null
  event_type: string | null
  estimated_guests: number | null
  message: string
  budget_gbp: number | null
  status: InquiryStatus
  vendor_note: string | null
  created_at: string
  updated_at: string
}

export interface QuoteLineItem {
  description: string
  quantity: number
  unit_price_gbp: number
  total_gbp: number
}

export interface Quote {
  id: string
  inquiry_id: string | null
  vendor_id: string
  wedding_id: string
  line_items: QuoteLineItem[]
  subtotal_gbp: number
  platform_fee_gbp: number
  total_gbp: number
  deposit_gbp: number
  deposit_due_date: string | null
  balance_due_date: string | null
  validity_date: string | null
  notes: string | null
  terms: string | null
  status: QuoteStatus
  created_at: string
  updated_at: string
}

export interface Booking {
  id: string
  quote_id: string | null
  vendor_id: string
  wedding_id: string
  event_id: string | null
  status: BookingStatus
  total_gbp: number
  deposit_gbp: number
  deposit_paid_gbp: number
  balance_gbp: number
  contract_url: string | null
  vendor_notes: string | null
  couple_notes: string | null
  cancelled_at: string | null
  cancelled_reason: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  booking_id: string
  type: 'deposit' | 'milestone' | 'balance' | 'refund'
  amount_gbp: number
  currency: string
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  due_date: string | null
  paid_at: string | null
  payout_status: 'pending' | 'scheduled' | 'paid' | 'withheld'
  payout_date: string | null
  description: string | null
  created_at: string
}

export interface Task {
  id: string
  wedding_id: string
  event_id: string | null
  booking_id: string | null
  title: string
  description: string | null
  due_date: string | null
  status: TaskStatus
  priority: TaskPriority
  assignee_id: string | null
  category: string | null
  sort_order: number
  completed_at: string | null
  created_at: string
  updated_at: string
}

export interface BudgetItem {
  id: string
  wedding_id: string
  event_id: string | null
  booking_id: string | null
  vendor_id: string | null
  category: string | null
  description: string
  estimated_gbp: number
  actual_gbp: number
  deposit_paid_gbp: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface GuestListEntry {
  id: string
  wedding_id: string
  full_name: string
  relationship: string | null
  side: 'bride' | 'groom' | 'joint' | null
  email: string | null
  phone: string | null
  rsvp_status: RsvpStatus
  dietary_requirements: string | null
  plus_ones: number
  table_number: string | null
  notes: string | null
  created_at: string
}

export interface VendorShortlistEntry {
  id: string
  wedding_id: string
  vendor_id: string
  notes: string | null
  created_at: string
}

// Extended types with joins
export interface VendorWithDetails extends Vendor {
  gallery?: VendorGalleryItem[]
  packages?: VendorPackage[]
  event_types?: string[]
  avg_rating?: number
  review_count?: number
}

export interface InquiryWithVendor extends Inquiry {
  vendor?: Vendor
}

export interface InquiryWithWedding extends Inquiry {
  wedding?: Wedding
  sender?: Profile
}

export interface BookingWithDetails extends Booking {
  vendor?: Vendor
  wedding?: Wedding
  event?: WeddingEvent
}
