-- Let's Go Fix — Core Schema (Migration 1)
-- Roles, profiles, vehicles, service providers, bookings, payments, reviews, notifications.
-- All tables use RLS. auth.users (Supabase Auth) is the identity source of truth;
-- public.profiles extends it with app-specific fields.

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "uuid-ossp";
create extension if not exists postgis;
create extension if not exists pgcrypto;

-- ============================================================================
-- ENUMS
-- ============================================================================
create type user_role as enum ('customer', 'provider', 'admin', 'support_staff', 'super_admin');

create type provider_type as enum (
  'garage', 'mechanic', 'tyre_shop', 'battery_service',
  'tow_truck', 'fuel_delivery', 'electrician'
);

create type verification_status as enum ('pending', 'verified', 'rejected', 'suspended');

create type booking_status as enum (
  'requested', 'accepted', 'rejected', 'provider_en_route',
  'in_progress', 'completed', 'cancelled_by_customer', 'cancelled_by_provider'
);

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create type payment_method as enum ('cash', 'card', 'payhere', 'stripe');

-- ============================================================================
-- PROFILES (1:1 with auth.users)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  full_name text not null,
  phone text unique,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'Extends auth.users with app-specific profile data and role.';

-- ============================================================================
-- CUSTOMER-SPECIFIC
-- ============================================================================
create table public.customer_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  emergency_contact_name text,
  emergency_contact_phone text,
  default_address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.vehicle_types (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- e.g. Car, Motorcycle, Van, Truck
  description text
);

create table public.vehicles (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_profiles(profile_id) on delete cascade,
  vehicle_type_id uuid not null references public.vehicle_types(id),
  make text not null,
  model text not null,
  year int,
  plate_number text not null,
  color text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  unique (customer_id, plate_number)
);

-- ============================================================================
-- SERVICE PROVIDER-SPECIFIC
-- ============================================================================
create table public.provider_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  business_name text not null,
  provider_type provider_type not null,
  business_registration_no text,
  bio text,
  verification_status verification_status not null default 'pending',
  is_available boolean not null default false,
  rating_avg numeric(3,2) not null default 0,
  rating_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.provider_documents (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(profile_id) on delete cascade,
  document_type text not null,        -- e.g. business_license, id_card, certification
  file_url text not null,
  status verification_status not null default 'pending',
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.service_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,          -- e.g. Flat Tyre, Battery Jumpstart, Towing
  provider_type provider_type not null,
  description text,
  base_price numeric(10,2)
);

create table public.provider_services (
  id uuid primary key default gen_random_uuid(),
  provider_id uuid not null references public.provider_profiles(profile_id) on delete cascade,
  category_id uuid not null references public.service_categories(id),
  price numeric(10,2),
  is_active boolean not null default true,
  unique (provider_id, category_id)
);

-- Current live location of a provider (updated frequently via Realtime)
create table public.provider_locations (
  provider_id uuid primary key references public.provider_profiles(profile_id) on delete cascade,
  location geography(Point, 4326) not null,
  heading numeric(5,2),
  updated_at timestamptz not null default now()
);

create index provider_locations_geo_idx on public.provider_locations using gist (location);

-- ============================================================================
-- BOOKINGS / SERVICE REQUESTS
-- ============================================================================
create table public.service_requests (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customer_profiles(profile_id),
  vehicle_id uuid not null references public.vehicles(id),
  provider_id uuid references public.provider_profiles(profile_id),
  category_id uuid not null references public.service_categories(id),
  status booking_status not null default 'requested',
  pickup_location geography(Point, 4326) not null,
  pickup_address text,
  destination_location geography(Point, 4326),
  destination_address text,
  description text,
  quoted_price numeric(10,2),
  final_price numeric(10,2),
  requested_at timestamptz not null default now(),
  accepted_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_requests_pickup_geo_idx on public.service_requests using gist (pickup_location);
create index service_requests_customer_idx on public.service_requests (customer_id);
create index service_requests_provider_idx on public.service_requests (provider_id);
create index service_requests_status_idx on public.service_requests (status);

create table public.request_status_history (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  status booking_status not null,
  changed_by uuid references public.profiles(id),
  note text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- PAYMENTS
-- ============================================================================
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id),
  customer_id uuid not null references public.customer_profiles(profile_id),
  provider_id uuid not null references public.provider_profiles(profile_id),
  amount numeric(10,2) not null,
  method payment_method not null,
  status payment_status not null default 'pending',
  transaction_ref text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  payment_id uuid not null references public.payments(id),
  invoice_number text not null unique,
  issued_at timestamptz not null default now(),
  pdf_url text
);

-- ============================================================================
-- REVIEWS
-- ============================================================================
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.service_requests(id),
  customer_id uuid not null references public.customer_profiles(profile_id),
  provider_id uuid not null references public.provider_profiles(profile_id),
  rating int not null check (rating between 1 and 5),
  comment text,
  provider_response text,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- MESSAGES (in-app chat per request)
-- ============================================================================
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_request_idx on public.messages (request_id);

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text,
  type text not null,                 -- e.g. booking_update, payment, system
  related_request_id uuid references public.service_requests(id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index notifications_profile_idx on public.notifications (profile_id, read_at);

-- ============================================================================
-- COMPLAINTS / ADMIN
-- ============================================================================
create table public.complaints (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.service_requests(id),
  raised_by uuid not null references public.profiles(id),
  against_profile_id uuid references public.profiles(id),
  subject text not null,
  description text,
  status text not null default 'open',  -- open, investigating, resolved, dismissed
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index activity_logs_actor_idx on public.activity_logs (actor_id, created_at desc);

-- ============================================================================
-- updated_at trigger helper
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.customer_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.provider_profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.service_requests
  for each row execute function public.set_updated_at();

-- ============================================================================
-- Auto-create profile row on new auth.users signup
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
