// Hand-written types mirroring the Supabase schema (supabase/migrations/*.sql).
// Prototype-scope: covers the fields the Customer PWA reads/writes.

export type UserRole = 'customer' | 'provider' | 'admin' | 'support_staff' | 'super_admin'

export type ProviderType =
  | 'garage'
  | 'mechanic'
  | 'tyre_shop'
  | 'battery_service'
  | 'tow_truck'
  | 'fuel_delivery'
  | 'electrician'

export type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended'

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'provider_en_route'
  | 'in_progress'
  | 'completed'
  | 'cancelled_by_customer'
  | 'cancelled_by_provider'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type PaymentMethod = 'cash' | 'card' | 'payhere' | 'stripe'

export interface Profile {
  id: string
  role: UserRole
  full_name: string
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CustomerProfile {
  profile_id: string
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  default_address: string | null
  created_at: string
  updated_at: string
}

export interface VehicleType {
  id: string
  name: string
  description: string | null
}

export interface Vehicle {
  id: string
  customer_id: string
  vehicle_type_id: string
  make: string
  model: string
  year: number | null
  plate_number: string
  color: string | null
  is_primary: boolean
  created_at: string
}

export interface ServiceCategory {
  id: string
  name: string
  provider_type: ProviderType
  description: string | null
  base_price: number | null
}

export interface ProviderProfile {
  profile_id: string
  business_name: string
  provider_type: ProviderType
  bio: string | null
  verification_status: VerificationStatus
  is_available: boolean
  rating_avg: number
  rating_count: number
}

export interface ProviderLocation {
  provider_id: string
  lat: number
  lng: number
  updated_at: string
}

export interface ServiceRequest {
  id: string
  customer_id: string
  vehicle_id: string
  provider_id: string | null
  category_id: string
  status: BookingStatus
  pickup_address: string | null
  pickup_lat: number | null
  pickup_lng: number | null
  description: string | null
  quoted_price: number | null
  final_price: number | null
  requested_at: string
  accepted_at: string | null
  completed_at: string | null
  cancelled_at: string | null
  cancellation_reason: string | null
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  request_id: string
  customer_id: string
  provider_id: string
  rating: number
  comment: string | null
  provider_response: string | null
  created_at: string
}

// Minimal Database generic to satisfy supabase-js typing without full codegen.
// Replace with `supabase gen types typescript` output once CLI linking works.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Database = any
