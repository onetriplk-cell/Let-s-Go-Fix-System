-- Let's Go Fix — Seed data for lookup tables

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
