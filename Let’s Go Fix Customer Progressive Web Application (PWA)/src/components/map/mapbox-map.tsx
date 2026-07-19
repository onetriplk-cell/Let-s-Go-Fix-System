import { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import { MAPBOX_TOKEN, DEFAULT_CENTER, DEFAULT_ZOOM } from '@/lib/mapbox'
import { useThemeStore } from '@/store/theme-store'

mapboxgl.accessToken = MAPBOX_TOKEN

const MAP_STYLE = {
  light: 'mapbox://styles/mapbox/streets-v12',
  dark: 'mapbox://styles/mapbox/dark-v11',
}

export interface MapMarker {
  id: string
  lng: number
  lat: number
  color?: string
  label?: string
}

interface MapboxMapProps {
  center?: [number, number]
  zoom?: number
  markers?: MapMarker[]
  interactive?: boolean
  onClick?: (lng: number, lat: number) => void
  className?: string
}

export function MapboxMap({
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  markers = [],
  interactive = true,
  onClick,
  className,
}: MapboxMapProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map())
  const onClickRef = useRef(onClick)
  onClickRef.current = onClick
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: MAP_STYLE[theme],
      center,
      zoom,
      interactive,
      attributionControl: false,
    })

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'bottom-right')

    map.on('click', (e) => {
      onClickRef.current?.(e.lngLat.lng, e.lngLat.lat)
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!mapRef.current) return
    mapRef.current.flyTo({ center, zoom, duration: 600 })
  }, [center, zoom])

  const isFirstStyleRender = useRef(true)
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (isFirstStyleRender.current) {
      isFirstStyleRender.current = false
      return
    }
    map.setStyle(MAP_STYLE[theme])
  }, [theme])

  const syncMarkers = useRef<() => void>(() => {})
  syncMarkers.current = () => {
    const map = mapRef.current
    if (!map) return

    const currentIds = new Set(markers.map((m) => m.id))

    for (const [id, marker] of markersRef.current) {
      if (!currentIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    }

    for (const m of markers) {
      const existing = markersRef.current.get(m.id)
      if (existing) {
        existing.setLngLat([m.lng, m.lat])
      } else {
        const el = document.createElement('div')
        el.style.width = '16px'
        el.style.height = '16px'
        el.style.borderRadius = '50%'
        el.style.background = m.color ?? '#2563eb'
        el.style.border = '2px solid white'
        el.style.boxShadow = '0 1px 4px rgba(0,0,0,0.4)'

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(map)

        if (m.label) {
          marker.setPopup(new mapboxgl.Popup({ offset: 12 }).setText(m.label))
        }

        markersRef.current.set(m.id, marker)
      }
    }
  }

  useEffect(() => {
    syncMarkers.current()
  }, [markers])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    const handleStyleLoad = () => {
      markersRef.current.clear()
      syncMarkers.current()
    }
    map.on('style.load', handleStyleLoad)
    return () => {
      map.off('style.load', handleStyleLoad)
    }
  }, [])

  return <div ref={containerRef} className={className ?? 'h-64 w-full'} />
}
