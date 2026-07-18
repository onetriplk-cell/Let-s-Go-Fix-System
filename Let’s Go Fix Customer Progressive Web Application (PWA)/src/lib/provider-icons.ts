import { Wrench, Disc, BatteryCharging, Truck, Fuel, Zap, Building2, type LucideIcon } from 'lucide-react'
import type { ProviderType } from '@/types/database'

export const PROVIDER_TYPE_ICON: Record<ProviderType, LucideIcon> = {
  garage: Building2,
  mechanic: Wrench,
  tyre_shop: Disc,
  battery_service: BatteryCharging,
  tow_truck: Truck,
  fuel_delivery: Fuel,
  electrician: Zap,
}

export const PROVIDER_TYPE_LABEL: Record<ProviderType, string> = {
  garage: 'Garage',
  mechanic: 'Mechanic',
  tyre_shop: 'Tyre Shop',
  battery_service: 'Battery Service',
  tow_truck: 'Tow Truck',
  fuel_delivery: 'Fuel Delivery',
  electrician: 'Electrician',
}
