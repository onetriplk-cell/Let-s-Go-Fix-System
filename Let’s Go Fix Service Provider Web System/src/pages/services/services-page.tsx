import { Card, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { useProviderServices, useToggleServiceOffering } from '@/hooks/use-provider-services'

export default function ServicesPage() {
  const { data, isLoading } = useProviderServices()
  const toggleOffering = useToggleServiceOffering()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">My Services</h1>
        <p className="text-sm text-slate-500">Choose which services you offer to customers</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!isLoading && data?.length === 0 && (
            <p className="text-sm text-slate-400">No service categories configured for your provider type yet.</p>
          )}
          <div className="flex flex-col divide-y divide-slate-100">
            {data?.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <p className="text-sm text-slate-500">{category.description}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    Suggested price: {category.base_price ? `LKR ${category.base_price.toLocaleString()}` : 'Varies'}
                  </p>
                </div>
                <Switch
                  checked={category.is_offered}
                  onCheckedChange={(checked) => toggleOffering.mutate({ category, enable: checked })}
                  disabled={toggleOffering.isPending}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
