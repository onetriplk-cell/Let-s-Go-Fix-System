export interface VehicleCatalogEntry {
  make: string
  models: string[]
  typeHint: 'Car' | 'SUV' | 'Van' | 'Motorcycle' | 'Three-Wheeler' | 'Truck'
}

export const VEHICLE_CATALOG: VehicleCatalogEntry[] = [
  { make: 'Toyota', typeHint: 'Car', models: ['Corolla', 'Corolla Axio', 'Aqua', 'Prius', 'Vitz', 'Premio', 'Allion', 'Camry', 'Land Cruiser', 'Hilux', 'RAV4', 'Hiace'] },
  { make: 'Honda', typeHint: 'Car', models: ['Civic', 'Fit', 'Vezel', 'Grace', 'Insight', 'CR-V', 'Accord', 'City'] },
  { make: 'Nissan', typeHint: 'Car', models: ['Sunny', 'Leaf', 'X-Trail', 'Note', 'March', 'Navara', 'Caravan'] },
  { make: 'Suzuki', typeHint: 'Car', models: ['Alto', 'Wagon R', 'Swift', 'Every', 'Vitara', 'Baleno'] },
  { make: 'Mitsubishi', typeHint: 'Car', models: ['Lancer', 'Montero', 'Outlander', 'Mirage', 'L200'] },
  { make: 'Mazda', typeHint: 'Car', models: ['Demio', 'Axela', 'CX-5', 'Familia', 'Premacy'] },
  { make: 'Hyundai', typeHint: 'Car', models: ['Elantra', 'Tucson', 'Santa Fe', 'i10', 'i20', 'Accent'] },
  { make: 'Kia', typeHint: 'Car', models: ['Sportage', 'Rio', 'Picanto', 'Sorento', 'Cerato'] },
  { make: 'Perodua', typeHint: 'Car', models: ['Axia', 'Bezza', 'Myvi', 'Alza'] },
  { make: 'Micro', typeHint: 'Car', models: ['Panda', 'MX-5', 'KX-5'] },
  { make: 'BMW', typeHint: 'Car', models: ['3 Series', '5 Series', 'X1', 'X3', 'X5'] },
  { make: 'Mercedes-Benz', typeHint: 'Car', models: ['C-Class', 'E-Class', 'GLA', 'GLC', 'Sprinter'] },
  { make: 'Isuzu', typeHint: 'Truck', models: ['Elf', 'D-Max', 'NPR', 'Forward'] },
  { make: 'Tata', typeHint: 'Truck', models: ['Dimo Batta', 'Ace', '407', 'Xenon'] },
  { make: 'Bajaj', typeHint: 'Three-Wheeler', models: ['RE Auto Rickshaw', 'Maxima', 'RE Compact'] },
  { make: 'TVS', typeHint: 'Three-Wheeler', models: ['King', 'King Deluxe'] },
  { make: 'Honda (Motorcycle)', typeHint: 'Motorcycle', models: ['Dio', 'Activa', 'CB Shine', 'CB125F', 'Wave'] },
  { make: 'Bajaj (Motorcycle)', typeHint: 'Motorcycle', models: ['Pulsar', 'CT100', 'Discover', 'Avenger'] },
  { make: 'Yamaha', typeHint: 'Motorcycle', models: ['FZ', 'Ray ZR', 'YZF-R15', 'Fascino'] },
  { make: 'Hero', typeHint: 'Motorcycle', models: ['Splendor', 'Passion', 'HF Deluxe'] },
]

export const ALL_MAKES = VEHICLE_CATALOG.map((entry) => entry.make)

export function getModelsForMake(make: string): string[] {
  return VEHICLE_CATALOG.find((entry) => entry.make.toLowerCase() === make.toLowerCase())?.models ?? []
}

export function getTypeHintForMake(make: string): VehicleCatalogEntry['typeHint'] | null {
  return VEHICLE_CATALOG.find((entry) => entry.make.toLowerCase() === make.toLowerCase())?.typeHint ?? null
}

const SRI_LANKA_PLATE_PATTERN = /^[A-Z]{2,3}[- ]?\d{4}$/

export function isValidSriLankanPlate(plate: string): boolean {
  return SRI_LANKA_PLATE_PATTERN.test(plate.trim().toUpperCase())
}
