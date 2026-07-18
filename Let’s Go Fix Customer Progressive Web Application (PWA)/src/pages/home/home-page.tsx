import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, MapPin, Navigation, Star } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { MapboxMap } from '@/components/map/mapbox-map'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BookingStatusBadge } from '@/components/common/status-badge'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useNearbyProviders } from '@/hooks/use-nearby-providers'
import { useServiceCategories } from '@/hooks/use-service-categories'
import { useActiveRequest } from '@/hooks/use-active-request'
import { useAuthStore } from '@/store/auth-store'
import { PROVIDER_TYPE_ICON, PROVIDER_TYPE_LABEL } from '@/lib/provider-icons'
import { DEFAULT_CENTER } from '@/lib/mapbox'

export default function HomePage() {
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { coords, locate, loading: locating } = useGeolocation()
  const { data: providers } = useNearbyProviders()
  const { data: categories } = useServiceCategories()
  const { data: activeRequest } = useActiveRequest()

  const center: [number, number] = coords ? [coords.lng, coords.lat] : DEFAULT_CENTER

  const markers = useMemo(() => {
    const providerMarkers = (providers ?? []).map((p) => ({
      id: p.profile_id,
      lng: p.lng,
      lat: p.lat,
      color: '#059669',
      label: p.business_name,
    }))
    if (coords) {
      providerMarkers.push({ id: 'me', lng: coords.lng, lat: coords.lat, color: '#2563eb', label: 'You' })
    }
    return providerMarkers
  }, [providers, coords])

  const topCategories = (categories ?? []).slice(0, 4)

  return (
    <div>
      <TopBar title={`Hi, ${profile?.full_name?.split(' ')[0] ?? 'there'}`} subtitle="Need help on the road?" />

      <div className="flex flex-col gap-4 p-4">
        {activeRequest && (
          <Card
            className="cursor-pointer border-brand-200 bg-brand-50"
            onClick={() => navigate(`/tracking/${activeRequest.id}`)}
          >
            <CardContent className="flex items-center justify-between gap-3 pt-4">
              <div>
                <p className="text-sm font-medium text-brand-900">You have an active request</p>
                <p className="text-xs text-brand-700">Tap to track live status</p>
              </div>
              <BookingStatusBadge status={activeRequest.status} />
            </CardContent>
          </Card>
        )}

        <Button
          variant="brand"
          size="lg"
          className="w-full text-base"
          onClick={() => navigate('/request')}
        >
          <AlertTriangle className="h-5 w-5" /> Request Roadside Assistance
        </Button>

        <Card className="overflow-hidden p-0">
          <div className="relative">
            <MapboxMap center={center} zoom={13} markers={markers} interactive={false} className="h-48 w-full" />
            <Button
              size="sm"
              variant="outline"
              className="absolute bottom-3 right-3 bg-white shadow"
              onClick={locate}
              disabled={locating}
            >
              <Navigation className="h-3.5 w-3.5" /> {locating ? 'Locating…' : 'My location'}
            </Button>
          </div>
        </Card>

        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500">Quick services</h2>
          <div className="grid grid-cols-2 gap-3">
            {topCategories.map((c) => (
              <Card
                key={c.id}
                className="cursor-pointer transition-shadow hover:shadow-md"
                onClick={() => navigate('/request', { state: { categoryId: c.id } })}
              >
                <CardContent className="flex flex-col gap-1 pt-4">
                  <p className="text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-400">
                    {c.base_price ? `From LKR ${c.base_price.toLocaleString()}` : 'Price varies'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500">
            Nearby providers ({providers?.length ?? 0})
          </h2>
          <div className="flex flex-col gap-2">
            {providers?.length === 0 && (
              <p className="text-sm text-slate-400">No providers online nearby right now.</p>
            )}
            {providers?.slice(0, 5).map((p) => {
              const Icon = PROVIDER_TYPE_ICON[p.provider_type]
              return (
                <Card key={p.profile_id}>
                  <CardContent className="flex items-center gap-3 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{p.business_name}</p>
                      <p className="text-xs text-slate-400">{PROVIDER_TYPE_LABEL[p.provider_type]}</p>
                    </div>
                    <Badge variant="success" className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-current" /> {p.rating_avg.toFixed(1)}
                    </Badge>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        <p className="flex items-center gap-1.5 text-center text-xs text-slate-400">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Enable location for accurate nearby results and faster assistance.
        </p>
      </div>
    </div>
  )
}
