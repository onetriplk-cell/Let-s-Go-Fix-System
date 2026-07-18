-- Let's Go Fix — Enable Realtime (Migration 3)
-- Adds core tables to the supabase_realtime publication so clients can
-- subscribe to postgres_changes and get live updates without polling/refresh.

alter publication supabase_realtime add table
  public.service_requests,
  public.provider_profiles,
  public.customer_profiles,
  public.complaints,
  public.profiles,
  public.payments;
