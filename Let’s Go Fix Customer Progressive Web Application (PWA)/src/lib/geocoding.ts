import { MAPBOX_TOKEN } from '@/lib/mapbox'

export async function reverseGeocode(lng: number, lat: number): Promise<string> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&limit=1`,
    )
    if (!res.ok) return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
    const data = await res.json()
    return data.features?.[0]?.place_name ?? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  } catch {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`
  }
}
