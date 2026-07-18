-- Let's Go Fix — Row Level Security (Migration 2)
-- Enables RLS on every table and defines access policies per role.

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================
create or replace function public.current_role()
returns user_role
language sql stable security definer set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('admin', 'support_staff', 'super_admin')
  );
$$;

-- ============================================================================
-- ENABLE RLS
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.vehicles enable row level security;
alter table public.vehicle_types enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.provider_documents enable row level security;
alter table public.service_categories enable row level security;
alter table public.provider_services enable row level security;
alter table public.provider_locations enable row level security;
alter table public.service_requests enable row level security;
alter table public.request_status_history enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;
alter table public.reviews enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.complaints enable row level security;
alter table public.activity_logs enable row level security;

-- ============================================================================
-- PROFILES
-- ============================================================================
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_select_public_provider" on public.profiles
  for select using (role = 'provider');

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin());

-- ============================================================================
-- CUSTOMER PROFILES
-- ============================================================================
create policy "customer_profiles_own" on public.customer_profiles
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "customer_profiles_admin" on public.customer_profiles
  for select using (public.is_admin());

-- ============================================================================
-- VEHICLES
-- ============================================================================
create policy "vehicles_owner_all" on public.vehicles
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

create policy "vehicles_admin_select" on public.vehicles
  for select using (public.is_admin());

create policy "vehicles_provider_select_on_request" on public.vehicles
  for select using (
    exists (
      select 1 from public.service_requests sr
      where sr.vehicle_id = vehicles.id and sr.provider_id = auth.uid()
    )
  );

-- ============================================================================
-- VEHICLE TYPES / SERVICE CATEGORIES (public read, admin write)
-- ============================================================================
create policy "vehicle_types_read_all" on public.vehicle_types
  for select using (true);
create policy "vehicle_types_admin_write" on public.vehicle_types
  for insert with check (public.is_admin());
create policy "vehicle_types_admin_update" on public.vehicle_types
  for update using (public.is_admin());
create policy "vehicle_types_admin_delete" on public.vehicle_types
  for delete using (public.is_admin());

create policy "service_categories_read_all" on public.service_categories
  for select using (true);
create policy "service_categories_admin_write" on public.service_categories
  for insert with check (public.is_admin());
create policy "service_categories_admin_update" on public.service_categories
  for update using (public.is_admin());
create policy "service_categories_admin_delete" on public.service_categories
  for delete using (public.is_admin());

-- ============================================================================
-- PROVIDER PROFILES
-- ============================================================================
create policy "provider_profiles_read_all" on public.provider_profiles
  for select using (true);

create policy "provider_profiles_owner_update" on public.provider_profiles
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "provider_profiles_owner_insert" on public.provider_profiles
  for insert with check (profile_id = auth.uid());

create policy "provider_profiles_admin_all" on public.provider_profiles
  for all using (public.is_admin());

-- ============================================================================
-- PROVIDER DOCUMENTS
-- ============================================================================
create policy "provider_documents_owner" on public.provider_documents
  for select using (provider_id = auth.uid());
create policy "provider_documents_owner_insert" on public.provider_documents
  for insert with check (provider_id = auth.uid());
create policy "provider_documents_admin_all" on public.provider_documents
  for all using (public.is_admin());

-- ============================================================================
-- PROVIDER SERVICES
-- ============================================================================
create policy "provider_services_read_all" on public.provider_services
  for select using (true);
create policy "provider_services_owner_write" on public.provider_services
  for insert with check (provider_id = auth.uid());
create policy "provider_services_owner_update" on public.provider_services
  for update using (provider_id = auth.uid()) with check (provider_id = auth.uid());
create policy "provider_services_owner_delete" on public.provider_services
  for delete using (provider_id = auth.uid());
create policy "provider_services_admin_all" on public.provider_services
  for all using (public.is_admin());

-- ============================================================================
-- PROVIDER LOCATIONS (provider writes own; customers see only providers
-- attached to their active request; admin sees all)
-- ============================================================================
create policy "provider_locations_owner_write" on public.provider_locations
  for all using (provider_id = auth.uid()) with check (provider_id = auth.uid());

create policy "provider_locations_read_public_available" on public.provider_locations
  for select using (
    exists (
      select 1 from public.provider_profiles pp
      where pp.profile_id = provider_locations.provider_id and pp.is_available = true
    )
  );

create policy "provider_locations_admin_select" on public.provider_locations
  for select using (public.is_admin());

-- ============================================================================
-- SERVICE REQUESTS
-- ============================================================================
create policy "service_requests_customer_all" on public.service_requests
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());

create policy "service_requests_provider_select" on public.service_requests
  for select using (provider_id = auth.uid() or (provider_id is null and status = 'requested'));

create policy "service_requests_provider_update" on public.service_requests
  for update using (provider_id = auth.uid())
  with check (provider_id = auth.uid());

create policy "service_requests_provider_claim" on public.service_requests
  for update using (provider_id is null and status = 'requested');

create policy "service_requests_admin_all" on public.service_requests
  for all using (public.is_admin());

-- ============================================================================
-- REQUEST STATUS HISTORY
-- ============================================================================
create policy "status_history_participant_read" on public.request_status_history
  for select using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_status_history.request_id
        and (sr.customer_id = auth.uid() or sr.provider_id = auth.uid())
    ) or public.is_admin()
  );

create policy "status_history_participant_insert" on public.request_status_history
  for insert with check (
    exists (
      select 1 from public.service_requests sr
      where sr.id = request_status_history.request_id
        and (sr.customer_id = auth.uid() or sr.provider_id = auth.uid())
    ) or public.is_admin()
  );

-- ============================================================================
-- PAYMENTS
-- ============================================================================
create policy "payments_participant_read" on public.payments
  for select using (customer_id = auth.uid() or provider_id = auth.uid() or public.is_admin());

create policy "payments_admin_write" on public.payments
  for insert with check (public.is_admin());
create policy "payments_admin_update" on public.payments
  for update using (public.is_admin());

-- ============================================================================
-- INVOICES
-- ============================================================================
create policy "invoices_participant_read" on public.invoices
  for select using (
    exists (
      select 1 from public.payments p
      where p.id = invoices.payment_id
        and (p.customer_id = auth.uid() or p.provider_id = auth.uid())
    ) or public.is_admin()
  );

-- ============================================================================
-- REVIEWS
-- ============================================================================
create policy "reviews_read_all" on public.reviews
  for select using (true);

create policy "reviews_customer_insert" on public.reviews
  for insert with check (customer_id = auth.uid());

create policy "reviews_provider_response_update" on public.reviews
  for update using (provider_id = auth.uid()) with check (provider_id = auth.uid());

create policy "reviews_admin_all" on public.reviews
  for all using (public.is_admin());

-- ============================================================================
-- MESSAGES
-- ============================================================================
create policy "messages_participant_read" on public.messages
  for select using (
    exists (
      select 1 from public.service_requests sr
      where sr.id = messages.request_id
        and (sr.customer_id = auth.uid() or sr.provider_id = auth.uid())
    ) or public.is_admin()
  );

create policy "messages_participant_insert" on public.messages
  for insert with check (
    sender_id = auth.uid() and exists (
      select 1 from public.service_requests sr
      where sr.id = messages.request_id
        and (sr.customer_id = auth.uid() or sr.provider_id = auth.uid())
    )
  );

-- ============================================================================
-- NOTIFICATIONS
-- ============================================================================
create policy "notifications_own_read" on public.notifications
  for select using (profile_id = auth.uid());

create policy "notifications_own_update" on public.notifications
  for update using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "notifications_admin_all" on public.notifications
  for all using (public.is_admin());

-- ============================================================================
-- COMPLAINTS
-- ============================================================================
create policy "complaints_own_read" on public.complaints
  for select using (raised_by = auth.uid() or against_profile_id = auth.uid());

create policy "complaints_own_insert" on public.complaints
  for insert with check (raised_by = auth.uid());

create policy "complaints_admin_all" on public.complaints
  for all using (public.is_admin());

-- ============================================================================
-- ACTIVITY LOGS (admin only)
-- ============================================================================
create policy "activity_logs_admin_only" on public.activity_logs
  for select using (public.is_admin());

create policy "activity_logs_insert_own" on public.activity_logs
  for insert with check (actor_id = auth.uid() or public.is_admin());
