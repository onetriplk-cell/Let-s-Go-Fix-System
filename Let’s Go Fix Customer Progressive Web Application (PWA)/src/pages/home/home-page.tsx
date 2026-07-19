import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, MapPin, Navigation, Star } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { MapboxMap } from '@/components/map/mapbox-map'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CardSkeletonGrid } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { StaggerList, StaggerItem } from '@/components/common/motion'
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
  const { data: providers, isLoading: providersLoading } = useNearbyProviders()
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

      <div className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:max-w-5xl sm:p-8">
        {activeRequest && (
          <Card
            className="cursor-pointer border-brand-200 bg-brand-50 dark:border-brand-500/30 dark:bg-brand-500/10"
            onClick={() => navigate(`/tracking/${activeRequest.id}`)}
          >
            <CardContent className="flex items-center justify-between gap-3 pt-4">
              <div>
                <p className="text-sm font-medium text-brand-900 dark:text-brand-300">You have an active request</p>
                <p className="text-xs text-brand-700 dark:text-brand-400">Tap to track live status</p>
              </div>
              <BookingStatusBadge status={activeRequest.status} />
            </CardContent>
          </Card>
        )}

        <Button
          variant="brand"
          size="lg"
          className="w-full text-base sm:w-auto sm:self-start sm:px-8"
          onClick={() => navigate('/request')}
        >
          <AlertTriangle className="h-5 w-5" /> Request Roadside Assistance
        </Button>

        <div className="grid gap-4 sm:grid-cols-5">
          <Card className="overflow-hidden p-0 sm:col-span-3">
            <div className="relative">
              <MapboxMap center={center} zoom={13} markers={markers} interactive={false} className="h-48 w-full sm:h-80" />
              <Button
                size="sm"
                variant="outline"
                className="absolute bottom-3 right-3 bg-white shadow dark:bg-slate-900"
                onClick={locate}
                disabled={locating}
              >
                <Navigation className="h-3.5 w-3.5" /> {locating ? 'Locating…' : 'My location'}
              </Button>
            </div>
          </Card>

          <div className="sm:col-span-2">
            <h2 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">Quick services</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-2">
              {topCategories.map((c) => (
                <Card
                  key={c.id}
                  className="cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30"
                  onClick={() => navigate('/request', { state: { categoryId: c.id } })}
                >
                  <CardContent className="flex flex-col gap-1 pt-4">
                    <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{c.name}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {c.base_price ? `From LKR ${c.base_price.toLocaleString()}` : 'Price varies'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            Nearby providers ({providers?.length ?? 0})
          </h2>

          {providersLoading && (
            <div className="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
              <CardSkeletonGrid count={3} />
            </div>
          )}

          {!providersLoading && providers?.length === 0 && (
            <Card>
              <EmptyState
                kind="providers"
                title="No providers online right now"
                description="Check back shortly, or request assistance and we'll notify nearby help."
              />
            </Card>
          )}

          <StaggerList className="flex flex-col gap-2 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
            {providers?.slice(0, 5).map((p) => {
              const Icon = PROVIDER_TYPE_ICON[p.provider_type]
              return (
                <StaggerItem key={p.profile_id}>
                <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30">
                  <CardContent className="flex items-center gap-3 pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{p.business_name}</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">{PROVIDER_TYPE_LABEL[p.provider_type]}</p>
                    </div>
                    <Badge variant="success" className="flex items-center gap-1 shrink-0">
                      <Star className="h-3 w-3 fill-current" /> {p.rating_avg.toFixed(1)}
                    </Badge>
                  </CardContent>
                </Card>
                </StaggerItem>
              )
            })}
          </StaggerList>
        </div>

        <p className="flex items-center gap-1.5 text-center text-xs text-slate-400 sm:justify-start sm:text-left dark:text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          Enable location for accurate nearby results and faster assistance.
        </p>
      </div>
    </div>
  )
}
