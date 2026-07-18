import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ArrowLeft, Car, MapPin, Navigation } from 'lucide-react'
import { toast } from 'sonner'
import { TopBar } from '@/components/layout/top-bar'
import { MapboxMap } from '@/components/map/mapbox-map'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useVehicles } from '@/hooks/use-vehicles'
import { useServiceCategories } from '@/hooks/use-service-categories'
import { useGeolocation } from '@/hooks/use-geolocation'
import { useCreateRequest } from '@/hooks/use-create-request'
import { reverseGeocode } from '@/lib/geocoding'
import { DEFAULT_CENTER } from '@/lib/mapbox'

type Step = 'vehicle' | 'category' | 'location' | 'confirm'

export default function RequestPage() {
  const navigate = useNavigate()
  const routerState = useLocation().state as { categoryId?: string } | null

  const [step, setStep] = useState<Step>('vehicle')
  const [vehicleId, setVehicleId] = useState<string | null>(null)
  const [categoryId, setCategoryId] = useState<string | null>(routerState?.categoryId ?? null)
  const [coords, setCoords] = useState<{ lng: number; lat: number } | null>(null)
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [geocoding, setGeocoding] = useState(false)

  const { data: vehicles } = useVehicles()
  const { data: categories } = useServiceCategories()
  const { coords: gpsCoords, locate, loading: locating } = useGeolocation()
  const createRequest = useCreateRequest()

  useEffect(() => {
    if (routerState?.categoryId) setStep('vehicle')
  }, [routerState])

  useEffect(() => {
    if (gpsCoords && !coords) {
      setCoords(gpsCoords)
    }
  }, [gpsCoords, coords])

  useEffect(() => {
    if (!coords) return
    setGeocoding(true)
    reverseGeocode(coords.lng, coords.lat)
      .then(setAddress)
      .finally(() => setGeocoding(false))
  }, [coords])

  const selectedVehicle = vehicles?.find((v) => v.id === vehicleId)
  const selectedCategory = categories?.find((c) => c.id === categoryId)

  const steps: Step[] = ['vehicle', 'category', 'location', 'confirm']
  const stepIndex = steps.indexOf(step)

  const goBack = () => {
    if (stepIndex === 0) {
      navigate(-1)
      return
    }
    setStep(steps[stepIndex - 1])
  }

  const goNext = () => {
    if (step === 'vehicle' && !vehicleId) {
      toast.error('Select a vehicle')
      return
    }
    if (step === 'category' && !categoryId) {
      toast.error('Select a service type')
      return
    }
    if (step === 'location' && !coords) {
      toast.error('Set your pickup location')
      return
    }
    setStep(steps[stepIndex + 1])
  }

  const handleSubmit = () => {
    if (!vehicleId || !categoryId || !coords) return
    createRequest.mutate(
      { vehicleId, categoryId, lng: coords.lng, lat: coords.lat, address, description },
      {
        onSuccess: (requestId) => {
          navigate(`/tracking/${requestId}`, { replace: true })
        },
      },
    )
  }

  return (
    <div>
      <TopBar title="Request Assistance" subtitle={`Step ${stepIndex + 1} of ${steps.length}`} />

      <div className="flex gap-1 px-4 pt-2">
        {steps.map((s, i) => (
          <div
            key={s}
            className={cn('h-1 flex-1 rounded-full', i <= stepIndex ? 'bg-brand-600' : 'bg-slate-200')}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 p-4">
        {step === 'vehicle' && (
          <>
            <h2 className="text-base font-semibold text-slate-900">Which vehicle needs help?</h2>
            {vehicles?.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
                  <Car className="h-8 w-8 text-slate-300" />
                  <p className="text-sm text-slate-500">You need to add a vehicle first.</p>
                  <Button variant="brand" onClick={() => navigate('/vehicles')}>
                    Add a vehicle
                  </Button>
                </CardContent>
              </Card>
            )}
            {vehicles?.map((v) => (
              <Card
                key={v.id}
                className={cn(
                  'cursor-pointer transition-colors',
                  vehicleId === v.id && 'border-brand-500 ring-2 ring-brand-100',
                )}
                onClick={() => setVehicleId(v.id)}
              >
                <CardContent className="flex items-center gap-3 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Car className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">
                      {v.make} {v.model}
                    </p>
                    <p className="text-sm text-slate-500">{v.plate_number}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </>
        )}

        {step === 'category' && (
          <>
            <h2 className="text-base font-semibold text-slate-900">What do you need?</h2>
            <div className="grid grid-cols-2 gap-3">
              {categories?.map((c) => (
                <Card
                  key={c.id}
                  className={cn(
                    'cursor-pointer transition-colors',
                    categoryId === c.id && 'border-brand-500 ring-2 ring-brand-100',
                  )}
                  onClick={() => setCategoryId(c.id)}
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
          </>
        )}

        {step === 'location' && (
          <>
            <h2 className="text-base font-semibold text-slate-900">Where are you?</h2>
            <p className="text-sm text-slate-500">Tap on the map to set your exact pickup location.</p>
            <Card className="overflow-hidden p-0">
              <MapboxMap
                center={coords ? [coords.lng, coords.lat] : DEFAULT_CENTER}
                zoom={15}
                markers={coords ? [{ id: 'pickup', lng: coords.lng, lat: coords.lat, color: '#2563eb' }] : []}
                onClick={(lng, lat) => setCoords({ lng, lat })}
                className="h-72 w-full"
              />
            </Card>
            <Button variant="outline" onClick={locate} disabled={locating}>
              <Navigation className="h-4 w-4" /> {locating ? 'Locating…' : 'Use my current location'}
            </Button>
            {coords && (
              <div className="flex items-start gap-2 rounded-xl bg-slate-100 p-3 text-sm text-slate-600">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                <span>{geocoding ? 'Finding address…' : address}</span>
              </div>
            )}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Notes for the provider (optional)</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Front-left tyre is flat, car is on the shoulder"
                className="flex w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              />
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h2 className="text-base font-semibold text-slate-900">Confirm your request</h2>
            <Card>
              <CardContent className="flex flex-col gap-3 pt-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle</span>
                  <span className="font-medium text-slate-900">
                    {selectedVehicle?.make} {selectedVehicle?.model} · {selectedVehicle?.plate_number}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service</span>
                  <span className="font-medium text-slate-900">{selectedCategory?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated price</span>
                  <span className="font-medium text-slate-900">
                    {selectedCategory?.base_price ? `LKR ${selectedCategory.base_price.toLocaleString()}` : 'Varies'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                  <span className="text-slate-500">Pickup location</span>
                  <span className="font-medium text-slate-900">{address}</span>
                </div>
                {description && (
                  <div className="flex flex-col gap-1 border-t border-slate-100 pt-3">
                    <span className="text-slate-500">Notes</span>
                    <span className="text-slate-700">{description}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}

        <div className="mt-2 flex gap-3">
          <Button variant="outline" size="lg" onClick={goBack} className="flex-1">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step === 'confirm' ? (
            <Button
              variant="brand"
              size="lg"
              className="flex-1"
              onClick={handleSubmit}
              disabled={createRequest.isPending}
            >
              {createRequest.isPending ? 'Submitting…' : 'Submit request'}
            </Button>
          ) : (
            <Button variant="brand" size="lg" className="flex-1" onClick={goNext}>
              Next
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
