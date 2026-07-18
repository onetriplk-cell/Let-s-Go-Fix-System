import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export default function ServicesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['service-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_categories')
        .select('id, name, provider_type, description, base_price')
        .order('name')
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Service Categories</h1>
        <p className="text-sm text-slate-500">Types of roadside assistance offered on the platform</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-slate-400">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data?.map((category) => (
            <Card key={category.id}>
              <CardContent className="flex flex-col gap-2 pt-5">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-slate-900">{category.name}</p>
                  <Badge className="capitalize">{category.provider_type.replaceAll('_', ' ')}</Badge>
                </div>
                <p className="text-sm text-slate-500">{category.description}</p>
                <p className="mt-1 text-sm font-medium text-brand-700">
                  {category.base_price ? `From LKR ${category.base_price.toLocaleString()}` : 'Price varies'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
