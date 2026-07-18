export const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string

if (!MAPBOX_TOKEN) {
  throw new Error('Missing VITE_MAPBOX_TOKEN. Check your .env file.')
}

export const DEFAULT_CENTER: [number, number] = [79.8612, 6.9271] // Colombo, Sri Lanka
export const DEFAULT_ZOOM = 12
