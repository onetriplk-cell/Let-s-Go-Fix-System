-- Let's Go Fix — Seed data
-- Safe to re-run: every insert is guarded with on conflict / not-exists checks.
--
-- Section 1 (lookup tables) has always been part of this file.
-- Section 2+ (sample users, vehicles, providers, bookings, reviews) is new
-- demo/test data for a hosted Supabase project — read the warning below
-- before running it anywhere but a throwaway/staging project.
--
-- ============================================================================
-- WARNING — read before running
-- ============================================================================
-- Section 2 inserts directly into auth.users. That's the standard way to
-- seed Supabase Auth test accounts outside of the signup API, but it means:
--   1. This must be run with the postgres/service role (SQL Editor in the
--      Supabase dashboard, or `supabase db execute` with a service-role
--      connection) — the anon/publishable key cannot write to auth.users.
--   2. Every seeded account shares the password below. Change it — or
--      delete these accounts — before this project is ever public-facing.
--   3. Re-running is safe (emails are ON CONFLICT DO NOTHING), but it will
--      NOT update names/roles if you already ran it once and edited rows
--      in the dashboard afterwards.
--
-- Every seeded account below has its OWN unique password (no shared
-- password). Full list:
--
--   Role/Business                     Email                              Password
--   --------------------------------  ---------------------------------  ----------
--   Super Admin                       admin@letsgofix.com                Zeal%56
--   Support Staff                     support@letsgofix.com              Star!52
--   Kamal Perera (customer)           kamal@example.com                  Zeal!16
--   Lahiru Fernando (customer)        lahiru@example.com                 Iron!13
--   Saman Wickramasinghe (customer)   saman@example.com                  Blue@50
--   Nadeesha Silva (customer)         nadeesha@example.com               Gold$32
--   Chathuri Jayasuriya (customer)    chathuri@example.com               Rapid$32
--   Ruwan Bandara (customer)          ruwan@example.com                  Lynx@51
--   Dilani Rathnayake (customer)      dilani@example.com                 Moto#32
--   Ishara Gunawardena (customer)     ishara@example.com                 Star!49
--   Tharindu Jayasinghe (customer)    tharindu@example.com               Wave@42
--   Anjali Karunaratne (customer)     anjali@example.com                 Moto#63
--   Colombo Tyre Center               colombo.tyre@example.com           Iron#44
--   Kandy Road Tyre House              kandy.tyre@example.com             Nova%67
--   QuickStart Battery Care           quickstart.battery@example.com     Sage%53
--   PowerUp Battery Services          powerup.battery@example.com        Lynx%13
--   CityLine Towing                   cityline.towing@example.com        Cobra@59
--   RapidTow Services                 rapidtow.towing@example.com        Peak!29
--   FuelNow Delivery                  fuelnow.delivery@example.com       Ember!72
--   GoFuel Roadside                   gofuel.delivery@example.com        Wave@91
--   AJ Mobile Mechanics               ajmechanics@example.com            Lynx@12
--   ProDrive Mechanics                prodrive.mechanics@example.com     Vibe%31
--   SparkFix Auto Electric            sparkfix.electric@example.com      Gold%16
--   VoltCare Auto Electric            voltcare.electric@example.com      Nova%46
--   West Colombo Garage               westgarage@example.com             Iron!39
--   East Side Auto Garage             eastgarage@example.com             Peak$40
--
-- Treat this file as containing secrets once run — do not commit real
-- production passwords here; these are throwaway demo credentials only.
-- ============================================================================

-- ============================================================================
-- SECTION 1 — Lookup tables (vehicle types, service categories)
-- ============================================================================
insert into public.vehicle_types (name, description) values
  ('Car', 'Standard passenger car'),
  ('Motorcycle', 'Two-wheeler'),
  ('Van', 'Passenger or cargo van'),
  ('Three-Wheeler', 'Auto rickshaw / tuk-tuk'),
  ('Truck', 'Light or heavy truck'),
  ('Bus', 'Passenger bus')
on conflict (name) do nothing;

insert into public.service_categories (name, provider_type, description, base_price) values
  ('Flat Tyre Repair', 'tyre_shop', 'On-site puncture repair or tyre change', 1500.00),
  ('Battery Jumpstart', 'battery_service', 'Jumpstart a dead battery on-site', 1200.00),
  ('Battery Replacement', 'battery_service', 'On-site battery replacement', 8000.00),
  ('Towing Service', 'tow_truck', 'Tow vehicle to nearest garage or requested location', 5000.00),
  ('Emergency Fuel Delivery', 'fuel_delivery', 'Deliver petrol or diesel to stranded vehicle', 1000.00),
  ('General Mechanical Repair', 'mechanic', 'On-site diagnostic and minor repair', 2000.00),
  ('Electrical Fault Diagnosis', 'electrician', 'Diagnose and fix vehicle electrical issues', 2500.00),
  ('Garage Full Service', 'garage', 'Full vehicle service at garage', 10000.00)
on conflict (name) do nothing;

-- ============================================================================
-- SECTION 2 — Sample auth users (2 admin + 10 customers + 14 providers)
-- ============================================================================
-- Every account gets its own bcrypt hash from its own plaintext password
-- (see the table in the header comment above), instead of one shared hash.
do $$
begin

  -- Customers ----------------------------------------------------------------
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  select
    '00000000-0000-0000-0000-000000000000', c.id, 'authenticated', 'authenticated',
    c.email, crypt(c.password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', c.full_name, 'role', 'customer'),
    now(), now()
  from (values
    ('c1000000-0000-0000-0000-000000000001'::uuid, 'kamal@example.com',    'Kamal Perera',          'Zeal!16'),
    ('c1000000-0000-0000-0000-000000000002'::uuid, 'lahiru@example.com',   'Lahiru Fernando',       'Iron!13'),
    ('c1000000-0000-0000-0000-000000000003'::uuid, 'saman@example.com',    'Saman Wickramasinghe',  'Blue@50'),
    ('c1000000-0000-0000-0000-000000000004'::uuid, 'nadeesha@example.com', 'Nadeesha Silva',         'Gold$32'),
    ('c1000000-0000-0000-0000-000000000005'::uuid, 'chathuri@example.com', 'Chathuri Jayasuriya',   'Rapid$32'),
    ('c1000000-0000-0000-0000-000000000006'::uuid, 'ruwan@example.com',    'Ruwan Bandara',          'Lynx@51'),
    ('c1000000-0000-0000-0000-000000000007'::uuid, 'dilani@example.com',   'Dilani Rathnayake',      'Moto#32'),
    ('c1000000-0000-0000-0000-000000000008'::uuid, 'ishara@example.com',   'Ishara Gunawardena',     'Star!49'),
    ('c1000000-0000-0000-0000-000000000009'::uuid, 'tharindu@example.com', 'Tharindu Jayasinghe',    'Wave@42'),
    ('c1000000-0000-0000-0000-000000000010'::uuid, 'anjali@example.com',   'Anjali Karunaratne',     'Moto#63')
  ) as c(id, email, full_name, password)
  where not exists (select 1 from auth.users u where u.id = c.id or u.email = c.email);

  -- Providers ------------------------------------------------------------------
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  select
    '00000000-0000-0000-0000-000000000000', p.id, 'authenticated', 'authenticated',
    p.email, crypt(p.password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', p.full_name, 'role', 'provider'),
    now(), now()
  from (values
    ('p1000000-0000-0000-0000-000000000001'::uuid, 'colombo.tyre@example.com',       'Sunil Colombo Tyre Owner',      'Iron#44'),
    ('p1000000-0000-0000-0000-000000000002'::uuid, 'kandy.tyre@example.com',         'Priyantha Kandy Tyre Owner',    'Nova%67'),
    ('p1000000-0000-0000-0000-000000000003'::uuid, 'quickstart.battery@example.com', 'Amila QuickStart Owner',        'Sage%53'),
    ('p1000000-0000-0000-0000-000000000004'::uuid, 'powerup.battery@example.com',    'Nuwan PowerUp Owner',           'Lynx%13'),
    ('p1000000-0000-0000-0000-000000000005'::uuid, 'cityline.towing@example.com',    'Roshan CityLine Owner',        'Cobra@59'),
    ('p1000000-0000-0000-0000-000000000006'::uuid, 'rapidtow.towing@example.com',    'Janaka RapidTow Owner',         'Peak!29'),
    ('p1000000-0000-0000-0000-000000000007'::uuid, 'fuelnow.delivery@example.com',   'Chamara FuelNow Owner',        'Ember!72'),
    ('p1000000-0000-0000-0000-000000000008'::uuid, 'gofuel.delivery@example.com',    'Sampath GoFuel Owner',          'Wave@91'),
    ('p1000000-0000-0000-0000-000000000009'::uuid, 'ajmechanics@example.com',        'Ajith AJ Mechanics Owner',      'Lynx@12'),
    ('p1000000-0000-0000-0000-000000000010'::uuid, 'prodrive.mechanics@example.com', 'Buddhika ProDrive Owner',       'Vibe%31'),
    ('p1000000-0000-0000-0000-000000000011'::uuid, 'sparkfix.electric@example.com',  'Kasun SparkFix Owner',          'Gold%16'),
    ('p1000000-0000-0000-0000-000000000012'::uuid, 'voltcare.electric@example.com',  'Malinda VoltCare Owner',        'Nova%46'),
    ('p1000000-0000-0000-0000-000000000013'::uuid, 'westgarage@example.com',         'Sarath West Garage Owner',      'Iron!39'),
    ('p1000000-0000-0000-0000-000000000014'::uuid, 'eastgarage@example.com',         'Dinesh East Garage Owner',      'Peak$40')
  ) as p(id, email, full_name, password)
  where not exists (select 1 from auth.users u where u.id = p.id or u.email = p.email);

  -- Admin / support staff ------------------------------------------------------
  -- Guarded on EMAIL, not just id: if admin@letsgofix.com already exists
  -- under a different id (e.g. created by hand or via a prior partial run),
  -- skip it individually instead of letting a unique-email violation abort
  -- the whole statement (which would silently take support@ down with it).
  insert into auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  )
  select
    '00000000-0000-0000-0000-000000000000', a.id, 'authenticated', 'authenticated',
    a.email, crypt(a.password, gen_salt('bf')), now(),
    '{"provider":"email","providers":["email"]}',
    jsonb_build_object('full_name', a.full_name, 'role', a.app_role),
    now(), now()
  from (values
    ('d1000000-0000-0000-0000-000000000001'::uuid, 'admin@letsgofix.com',   'Nirosha De Silva',   'super_admin',   'Zeal%56'),
    ('d1000000-0000-0000-0000-000000000002'::uuid, 'support@letsgofix.com', 'Harsha Weerasinghe', 'support_staff', 'Star!52')
  ) as a(id, email, full_name, app_role, password)
  where not exists (select 1 from auth.users u where u.id = a.id or u.email = a.email);

end $$;

-- profiles rows are created automatically by the on_auth_user_created trigger.
-- Roles/names above already match; nothing further needed for public.profiles.

-- ============================================================================
-- SECTION 3 — Customer profiles + vehicles
-- ============================================================================
insert into public.customer_profiles (profile_id, emergency_contact_name, emergency_contact_phone, default_address)
select id, ec.name, ec.phone, ec.address
from auth.users u
join (values
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'Nimal Perera',        '+94771234501', 'Nugegoda, Colombo'),
  ('c1000000-0000-0000-0000-000000000002'::uuid, 'Sanduni Fernando',    '+94771234502', 'Dehiwala, Colombo'),
  ('c1000000-0000-0000-0000-000000000003'::uuid, 'Kumari Wickramasinghe','+94771234503', 'Maharagama, Colombo'),
  ('c1000000-0000-0000-0000-000000000004'::uuid, 'Ajith Silva',         '+94771234504', 'Rajagiriya, Colombo'),
  ('c1000000-0000-0000-0000-000000000005'::uuid, 'Ruwan Jayasuriya',    '+94771234505', 'Kotte, Colombo'),
  ('c1000000-0000-0000-0000-000000000006'::uuid, 'Malini Bandara',      '+94771234506', 'Moratuwa, Colombo'),
  ('c1000000-0000-0000-0000-000000000007'::uuid, 'Sujith Rathnayake',   '+94771234507', 'Kaduwela, Colombo'),
  ('c1000000-0000-0000-0000-000000000008'::uuid, 'Priya Gunawardena',   '+94771234508', 'Battaramulla, Colombo'),
  ('c1000000-0000-0000-0000-000000000009'::uuid, 'Nadeeka Jayasinghe',  '+94771234509', 'Wattala, Colombo'),
  ('c1000000-0000-0000-0000-000000000010'::uuid, 'Chandana Karunaratne','+94771234510', 'Piliyandala, Colombo')
) as ec(id, name, phone, address) on ec.id = u.id
where not exists (select 1 from public.customer_profiles cp where cp.profile_id = u.id);

-- Give every customer one primary vehicle (10 vehicles, varied makes/types).
insert into public.vehicles (customer_id, vehicle_type_id, make, model, year, plate_number, color, is_primary)
select v.customer_id, vt.id, v.make, v.model, v.year, v.plate_number, v.color, true
from (values
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'Car',           'Toyota',   'Corolla Axio', 2018, 'WP-CAB-1234', 'White'),
  ('c1000000-0000-0000-0000-000000000002'::uuid, 'Car',           'Honda',    'Vezel',        2019, 'WP-CAC-5678', 'Silver'),
  ('c1000000-0000-0000-0000-000000000003'::uuid, 'Motorcycle',    'Bajaj',    'Pulsar',       2021, 'WP-BB-9012',  'Black'),
  ('c1000000-0000-0000-0000-000000000004'::uuid, 'Car',           'Suzuki',   'Alto',         2017, 'WP-CAD-3456', 'Red'),
  ('c1000000-0000-0000-0000-000000000005'::uuid, 'Van',           'Toyota',   'Hiace',        2015, 'WP-GA-7890',  'White'),
  ('c1000000-0000-0000-0000-000000000006'::uuid, 'Car',           'Nissan',   'Sunny',        2016, 'WP-CAE-2345', 'Grey'),
  ('c1000000-0000-0000-0000-000000000007'::uuid, 'Three-Wheeler', 'Bajaj',    'RE Compact',   2020, 'WP-TT-6789',  'Yellow'),
  ('c1000000-0000-0000-0000-000000000008'::uuid, 'Car',           'Toyota',   'Aqua',         2020, 'WP-CAF-0123', 'Blue'),
  ('c1000000-0000-0000-0000-000000000009'::uuid, 'Motorcycle',    'Yamaha',   'FZ',           2022, 'WP-BC-4567',  'Black'),
  ('c1000000-0000-0000-0000-000000000010'::uuid, 'Car',           'Hyundai',  'Elantra',      2019, 'WP-CAG-8901', 'White')
) as v(customer_id, vehicle_type_name, make, model, year, plate_number, color)
join public.vehicle_types vt on vt.name = v.vehicle_type_name
where not exists (
  select 1 from public.vehicles ve
  where ve.customer_id = v.customer_id and ve.plate_number = v.plate_number
);

-- ============================================================================
-- SECTION 4 — Provider profiles + services + live locations
-- ============================================================================
insert into public.provider_profiles (
  profile_id, business_name, provider_type, business_registration_no, bio,
  verification_status, is_available, rating_avg, rating_count
)
select p.id, p.business_name, p.provider_type::provider_type, p.reg_no, p.bio,
       'verified'::verification_status, p.is_available, p.rating_avg, p.rating_count
from (values
  ('p1000000-0000-0000-0000-000000000001'::uuid, 'Colombo Tyre Center',     'tyre_shop',       'BR-TY-001', 'Fast puncture repair and tyre replacement in Colombo Fort.', true,  4.60, 128),
  ('p1000000-0000-0000-0000-000000000002'::uuid, 'Kandy Road Tyre House',   'tyre_shop',       'BR-TY-002', 'Tyre specialists serving the Kandy road corridor.',           true,  4.40, 76),
  ('p1000000-0000-0000-0000-000000000003'::uuid, 'QuickStart Battery Care', 'battery_service', 'BR-BA-001', 'On-site battery jumpstart and replacement, 24/7.',           true,  4.70, 94),
  ('p1000000-0000-0000-0000-000000000004'::uuid, 'PowerUp Battery Services','battery_service', 'BR-BA-002', 'Certified battery diagnostics and replacement.',              false, 4.30, 41),
  ('p1000000-0000-0000-0000-000000000005'::uuid, 'CityLine Towing',        'tow_truck',        'BR-TW-001', 'Flatbed towing across Colombo and suburbs.',                  true,  4.50, 152),
  ('p1000000-0000-0000-0000-000000000006'::uuid, 'RapidTow Services',      'tow_truck',        'BR-TW-002', 'Quick-response towing for cars, vans, and trucks.',           true,  4.20, 63),
  ('p1000000-0000-0000-0000-000000000007'::uuid, 'FuelNow Delivery',       'fuel_delivery',    'BR-FU-001', 'Emergency petrol and diesel delivery within 30 minutes.',     true,  4.80, 87),
  ('p1000000-0000-0000-0000-000000000008'::uuid, 'GoFuel Roadside',        'fuel_delivery',    'BR-FU-002', 'Fuel delivery service covering greater Colombo.',             false, 4.10, 29),
  ('p1000000-0000-0000-0000-000000000009'::uuid, 'AJ Mobile Mechanics',    'mechanic',         'BR-ME-001', 'Experienced mobile mechanics for on-site diagnostics.',       true,  4.55, 110),
  ('p1000000-0000-0000-0000-000000000010'::uuid, 'ProDrive Mechanics',     'mechanic',         'BR-ME-002', 'General repair and maintenance, we come to you.',             true,  4.35, 58),
  ('p1000000-0000-0000-0000-000000000011'::uuid, 'SparkFix Auto Electric','electrician',       'BR-EL-001', 'Vehicle electrical fault diagnosis and repair.',              true,  4.65, 72),
  ('p1000000-0000-0000-0000-000000000012'::uuid, 'VoltCare Auto Electric','electrician',        'BR-EL-002', 'Wiring, alternator, and starter motor specialists.',          false, 4.25, 34),
  ('p1000000-0000-0000-0000-000000000013'::uuid, 'West Colombo Garage',   'garage',            'BR-GA-001', 'Full-service garage — servicing, repairs, inspections.',      true,  4.75, 203),
  ('p1000000-0000-0000-0000-000000000014'::uuid, 'East Side Auto Garage', 'garage',             'BR-GA-002', 'Family-run garage serving the eastern suburbs since 2005.',   true,  4.45, 97)
) as p(id, business_name, provider_type, reg_no, bio, is_available, rating_avg, rating_count)
where not exists (select 1 from public.provider_profiles pp where pp.profile_id = p.id);

-- Link each seeded provider to every service category matching its type.
-- (battery_service providers pick up both Battery Jumpstart and Battery
-- Replacement automatically since both categories share that provider_type.)
insert into public.provider_services (provider_id, category_id, price, is_active)
select pp.profile_id, sc.id, sc.base_price, true
from public.provider_profiles pp
join public.service_categories sc on sc.provider_type = pp.provider_type
where pp.profile_id in (
  'p1000000-0000-0000-0000-000000000001', 'p1000000-0000-0000-0000-000000000002',
  'p1000000-0000-0000-0000-000000000003', 'p1000000-0000-0000-0000-000000000004',
  'p1000000-0000-0000-0000-000000000005', 'p1000000-0000-0000-0000-000000000006',
  'p1000000-0000-0000-0000-000000000007', 'p1000000-0000-0000-0000-000000000008',
  'p1000000-0000-0000-0000-000000000009', 'p1000000-0000-0000-0000-000000000010',
  'p1000000-0000-0000-0000-000000000011', 'p1000000-0000-0000-0000-000000000012',
  'p1000000-0000-0000-0000-000000000013', 'p1000000-0000-0000-0000-000000000014'
)
and not exists (
  select 1 from public.provider_services ps
  where ps.provider_id = pp.profile_id and ps.category_id = sc.id
);

-- Live locations scattered around Colombo (lng, lat) for the map view.
insert into public.provider_locations (provider_id, location, heading)
select id, ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography, heading
from (values
  ('p1000000-0000-0000-0000-000000000001'::uuid, 79.8480, 6.9350, 45.0),
  ('p1000000-0000-0000-0000-000000000002'::uuid, 79.9200, 7.0100, 90.0),
  ('p1000000-0000-0000-0000-000000000003'::uuid, 79.8600, 6.9100, 0.0),
  ('p1000000-0000-0000-0000-000000000004'::uuid, 79.8750, 6.9450, 180.0),
  ('p1000000-0000-0000-0000-000000000005'::uuid, 79.8550, 6.9000, 270.0),
  ('p1000000-0000-0000-0000-000000000006'::uuid, 79.8900, 6.9300, 135.0),
  ('p1000000-0000-0000-0000-000000000007'::uuid, 79.8650, 6.9200, 60.0),
  ('p1000000-0000-0000-0000-000000000008'::uuid, 79.8800, 6.8950, 200.0),
  ('p1000000-0000-0000-0000-000000000009'::uuid, 79.8500, 6.9400, 30.0),
  ('p1000000-0000-0000-0000-000000000010'::uuid, 79.9000, 6.9150, 300.0),
  ('p1000000-0000-0000-0000-000000000011'::uuid, 79.8620, 6.9050, 150.0),
  ('p1000000-0000-0000-0000-000000000012'::uuid, 79.8850, 6.9500, 220.0),
  ('p1000000-0000-0000-0000-000000000013'::uuid, 79.8400, 6.9250, 10.0),
  ('p1000000-0000-0000-0000-000000000014'::uuid, 79.9100, 6.9050, 250.0)
) as loc(id, lng, lat, heading)
on conflict (provider_id) do update set location = excluded.location, heading = excluded.heading, updated_at = now();

-- ============================================================================
-- SECTION 5 — Sample service requests (mixed statuses) + reviews
-- ============================================================================
-- 6 completed (reviewed), 1 in_progress, 1 provider_en_route, 1 accepted,
-- 1 requested (unclaimed) — gives every page in the app something to show.
insert into public.service_requests (
  id, customer_id, vehicle_id, provider_id, category_id, status,
  pickup_location, pickup_address, description,
  quoted_price, final_price, requested_at, accepted_at, completed_at
)
select
  r.id, r.customer_id, v.id, r.provider_id, sc.id, r.status::booking_status,
  ST_SetSRID(ST_MakePoint(r.lng, r.lat), 4326)::geography, r.address, r.description,
  r.quoted_price, r.final_price,
  r.requested_at, r.accepted_at, r.completed_at
from (values
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'p1000000-0000-0000-0000-000000000001'::uuid, 'Flat Tyre Repair',      'completed', 79.8500, 6.9280, 'Nugegoda Junction, Colombo', 'Front-left tyre punctured near the junction.', 1500.00, 1500.00, now() - interval '20 days', now() - interval '20 days' + interval '10 minutes', now() - interval '20 days' + interval '55 minutes'),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'p1000000-0000-0000-0000-000000000003'::uuid, 'Battery Jumpstart',     'completed', 79.8650, 6.8600, 'Dehiwala Beach Road', 'Car would not start after work, battery seems dead.', 1200.00, 1200.00, now() - interval '17 days', now() - interval '17 days' + interval '8 minutes',  now() - interval '17 days' + interval '40 minutes'),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'p1000000-0000-0000-0000-000000000005'::uuid, 'Towing Service',        'completed', 79.9270, 6.8480, 'Maharagama Town', 'Engine overheated, needs towing to nearest garage.', 5000.00, 5500.00, now() - interval '14 days', now() - interval '14 days' + interval '15 minutes', now() - interval '14 days' + interval '2 hours'),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 'p1000000-0000-0000-0000-000000000009'::uuid, 'General Mechanical Repair', 'completed', 79.8980, 6.9080, 'Rajagiriya Main Street', 'Strange noise from the engine on acceleration.', 2000.00, 2800.00, now() - interval '11 days', now() - interval '11 days' + interval '12 minutes', now() - interval '11 days' + interval '90 minutes'),
  ('a1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid, 'p1000000-0000-0000-0000-000000000007'::uuid, 'Emergency Fuel Delivery',   'completed', 79.9130, 6.8930, 'Kotte Road, near the hospital', 'Ran out of fuel, need 5 litres of diesel.', 1000.00, 1000.00, now() - interval '8 days', now() - interval '8 days' + interval '9 minutes', now() - interval '8 days' + interval '35 minutes'),
  ('a1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000006'::uuid, 'p1000000-0000-0000-0000-000000000013'::uuid, 'Garage Full Service',   'completed', 79.9210, 6.7730, 'Moratuwa University Road', 'Requesting a full service and inspection.', 10000.00, 10000.00, now() - interval '5 days', now() - interval '5 days' + interval '20 minutes', now() - interval '5 days' + interval '3 hours'),
  ('a1000000-0000-0000-0000-000000000007'::uuid, 'c1000000-0000-0000-0000-000000000007'::uuid, 'p1000000-0000-0000-0000-000000000006'::uuid, 'Towing Service',        'in_progress', 79.9730, 6.9310, 'Kaduwela town center', 'Accident, vehicle cannot be driven — needs towing.', 5000.00, null, now() - interval '90 minutes', now() - interval '80 minutes', null),
  ('a1000000-0000-0000-0000-000000000008'::uuid, 'c1000000-0000-0000-0000-000000000008'::uuid, 'p1000000-0000-0000-0000-000000000011'::uuid, 'Electrical Fault Diagnosis', 'provider_en_route', 79.9180, 6.8990, 'Battaramulla Diyatha Uyana', 'Dashboard lights flickering, possible wiring issue.', 2500.00, null, now() - interval '25 minutes', now() - interval '15 minutes', null),
  ('a1000000-0000-0000-0000-000000000009'::uuid, 'c1000000-0000-0000-0000-000000000009'::uuid, 'p1000000-0000-0000-0000-000000000004'::uuid, 'Battery Replacement',   'accepted', 79.8930, 6.9890, 'Wattala junction', 'Battery is over 4 years old and no longer holding charge.', 8000.00, null, now() - interval '10 minutes', now() - interval '4 minutes', null),
  ('a1000000-0000-0000-0000-000000000010'::uuid, 'c1000000-0000-0000-0000-000000000010'::uuid, null, 'Flat Tyre Repair',      'requested', 79.9130, 6.8010, 'Piliyandala main road', 'Rear tyre burst while driving, vehicle is on the shoulder.', 1500.00, null, now() - interval '3 minutes', null, null)
) as r(id, customer_id, provider_id, category_name, status, lng, lat, address, description, quoted_price, final_price, requested_at, accepted_at, completed_at)
join public.service_categories sc on sc.name = r.category_name
join public.vehicles v on v.customer_id = r.customer_id and v.is_primary = true
where not exists (select 1 from public.service_requests sr where sr.id = r.id);

-- Reviews for the 6 completed requests above.
insert into public.reviews (request_id, customer_id, provider_id, rating, comment)
select rv.request_id, rv.customer_id, rv.provider_id, rv.rating, rv.comment
from (values
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'p1000000-0000-0000-0000-000000000001'::uuid, 5, 'Arrived quickly and fixed the tyre in no time. Very professional.'),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'p1000000-0000-0000-0000-000000000003'::uuid, 5, 'Got my car started in minutes. Friendly and fast.'),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'p1000000-0000-0000-0000-000000000005'::uuid, 4, 'Good towing service, a bit late but kept me updated throughout.'),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 'p1000000-0000-0000-0000-000000000009'::uuid, 4, 'Diagnosed the issue correctly and explained everything clearly.'),
  ('a1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid, 'p1000000-0000-0000-0000-000000000007'::uuid, 5, 'Super fast fuel delivery, saved my morning commute.'),
  ('a1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000006'::uuid, 'p1000000-0000-0000-0000-000000000013'::uuid, 5, 'Thorough full service, car runs much better now. Highly recommend.')
) as rv(request_id, customer_id, provider_id, rating, comment)
where not exists (select 1 from public.reviews r where r.request_id = rv.request_id);

-- Payments for the 6 completed requests (cash/card mixed for variety).
insert into public.payments (request_id, customer_id, provider_id, amount, method, status, paid_at)
select p.request_id, p.customer_id, p.provider_id, p.amount, p.method::payment_method, 'paid'::payment_status, p.paid_at
from (values
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'c1000000-0000-0000-0000-000000000001'::uuid, 'p1000000-0000-0000-0000-000000000001'::uuid, 1500.00, 'cash', now() - interval '20 days' + interval '55 minutes'),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'c1000000-0000-0000-0000-000000000002'::uuid, 'p1000000-0000-0000-0000-000000000003'::uuid, 1200.00, 'card', now() - interval '17 days' + interval '40 minutes'),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'c1000000-0000-0000-0000-000000000003'::uuid, 'p1000000-0000-0000-0000-000000000005'::uuid, 5500.00, 'payhere', now() - interval '14 days' + interval '2 hours'),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'c1000000-0000-0000-0000-000000000004'::uuid, 'p1000000-0000-0000-0000-000000000009'::uuid, 2800.00, 'cash', now() - interval '11 days' + interval '90 minutes'),
  ('a1000000-0000-0000-0000-000000000005'::uuid, 'c1000000-0000-0000-0000-000000000005'::uuid, 'p1000000-0000-0000-0000-000000000007'::uuid, 1000.00, 'cash', now() - interval '8 days' + interval '35 minutes'),
  ('a1000000-0000-0000-0000-000000000006'::uuid, 'c1000000-0000-0000-0000-000000000006'::uuid, 'p1000000-0000-0000-0000-000000000013'::uuid, 10000.00, 'card', now() - interval '5 days' + interval '3 hours')
) as p(request_id, customer_id, provider_id, amount, method, paid_at)
where not exists (select 1 from public.payments pay where pay.request_id = p.request_id);
