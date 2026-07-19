import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Circle, Phone, Star } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { SidebarNav } from '@/components/layout/sidebar-nav'
import { MapboxMap } from '@/components/map/mapbox-map'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useTrackRequest } from '@/hooks/use-track-request'
import { useCancelRequest } from '@/hooks/use-cancel-request'
import { PROVIDER_TYPE_LABEL } from '@/lib/provider-icons'
import { DEFAULT_CENTER } from '@/lib/mapbox'
import type { ProviderType } from '@/types/database'

const TIMELINE_STEPS = [
  { key: 'requested', label: 'Request sent' },
  { key: 'accepted', label: 'Provider assigned' },
  { key: 'provider_en_route', label: 'On the way' },
  { key: 'in_progress', label: 'Work in progress' },
  { key: 'completed', label: 'Completed' },
]

const CANCELLABLE = ['requested', 'accepted']

export default function TrackingPage() {
  const { requestId } = useParams<{ requestId: string }>()
  const navigate = useNavigate()
  const { data: request, isLoading } = useTrackRequest(requestId)
  const cancelRequest = useCancelRequest()

  const currentStepIndex = useMemo(() => {
    if (!request) return 0
    if (request.status.startsWith('cancelled') || request.status === 'rejected') return -1
    return TIMELINE_STEPS.findIndex((s) => s.key === request.status)
  }, [request])

  const markers = useMemo(() => {
    if (!request) return []
    const m = []
    if (request.pickup_lng && request.pickup_lat) {
      m.push({ id: 'pickup', lng: request.pickup_lng, lat: request.pickup_lat, color: '#2563eb', label: 'Pickup' })
    }
    if (request.providerLocation) {
      m.push({
        id: 'provider',
        lng: request.providerLocation.lng,
        lat: request.providerLocation.lat,
        color: '#059669',
        label: request.provider?.business_name,
      })
    }
    return m
  }, [request])

  const center: [number, number] = request?.pickup_lng
    ? [request.pickup_lng, request.pickup_lat!]
    : DEFAULT_CENTER

  if (isLoading || !request) {
    return (
      <div className="sm:pl-60">
        <SidebarNav />
        <TopBar title="Tracking" />
        <p className="p-4 text-center text-sm text-slate-400 dark:text-slate-500">Loading…</p>
      </div>
    )
  }

  const isCancelled = request.status.startsWith('cancelled') || request.status === 'rejected'

  return (
    <div className="sm:pl-60">
      <SidebarNav />
      <TopBar title="Track Request" subtitle={`Requested ${new Date(request.requested_at).toLocaleString()}`} />

      <div className="mx-auto flex max-w-md flex-col gap-4 p-4 sm:max-w-5xl sm:p-8">
        <Button variant="ghost" size="sm" onClick={() => navigate('/home')} className="self-start -ml-2">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Button>

        <div className="grid gap-4 sm:grid-cols-5 sm:items-start">
          <div className="flex flex-col gap-4 sm:col-span-3">
            <Card className="overflow-hidden p-0">
              <MapboxMap center={center} zoom={14} markers={markers} interactive={false} className="h-56 w-full sm:h-96" />
            </Card>

            {request.provider && (
              <Card>
                <CardContent className="flex items-center justify-between gap-3 pt-4">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-slate-100">{request.provider.business_name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {PROVIDER_TYPE_LABEL[request.provider.provider_type as ProviderType]}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-sm text-amber-600 dark:text-amber-400">
                      <Star className="h-3.5 w-3.5 fill-current" /> {request.provider.rating_avg.toFixed(1)}
                    </p>
                  </div>
                  <Button variant="outline" size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex flex-col gap-4 sm:col-span-2">
            {isCancelled ? (
              <Card className="border-red-200 bg-red-50 dark:border-red-500/30 dark:bg-red-500/10">
                <CardContent className="pt-4 text-sm text-red-700 dark:text-red-400">
                  This request was {request.status.replaceAll('_', ' ')}.
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex flex-col gap-4 pt-4">
                  {TIMELINE_STEPS.map((step, i) => {
                    const done = i < currentStepIndex || (i === currentStepIndex && request.status === 'completed')
                    const active = i === currentStepIndex && request.status !== 'completed'
                    return (
                      <div key={step.key} className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                            done
                              ? 'bg-brand-600 text-white dark:bg-brand-500'
                              : active
                                ? 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
                                : 'bg-slate-100 text-slate-300 dark:bg-slate-800 dark:text-slate-600',
                          )}
                        >
                          {done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-2.5 w-2.5 fill-current" />}
                        </div>
                        <span
                          className={cn(
                            'text-sm',
                            done || active ? 'font-medium text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-600',
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardContent className="flex flex-col gap-2 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Pickup</span>
                  <span className="max-w-[60%] text-right font-medium text-slate-900 dark:text-slate-100">{request.pickup_address}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Estimated price</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    {request.final_price
                      ? `LKR ${request.final_price.toLocaleString()}`
                      : request.quoted_price
                        ? `LKR ${request.quoted_price.toLocaleString()}`
                        : 'Varies'}
                  </span>
                </div>
                {request.description && (
                  <div className="flex flex-col gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Notes</span>
                    <span className="text-slate-700 dark:text-slate-300">{request.description}</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {CANCELLABLE.includes(request.status) && (
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
                onClick={() => cancelRequest.mutate(request.id)}
                disabled={cancelRequest.isPending}
              >
                Cancel request
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
