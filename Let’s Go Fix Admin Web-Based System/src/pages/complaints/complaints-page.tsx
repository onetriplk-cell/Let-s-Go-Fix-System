import { useQuery } from '@tanstack/react-query'
import dayjs from 'dayjs'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_VARIANT = {
  open: 'warning',
  investigating: 'brand',
  resolved: 'success',
  dismissed: 'default',
} as const

export default function ComplaintsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['complaints'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('complaints')
        .select('id, subject, description, status, created_at')
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Complaints</h1>
        <p className="text-sm text-slate-500">Issues raised by customers and providers</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!isLoading && data?.length === 0 && (
            <p className="text-sm text-slate-400">No complaints raised yet.</p>
          )}
          <div className="flex flex-col divide-y divide-slate-100">
            {data?.map((c) => (
              <div key={c.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="font-medium text-slate-900">{c.subject}</p>
                  <p className="text-sm text-slate-500">{c.description}</p>
                  <p className="mt-1 text-xs text-slate-400">{dayjs(c.created_at).format('MMM D, YYYY h:mm A')}</p>
                </div>
                <Badge variant={STATUS_VARIANT[c.status as keyof typeof STATUS_VARIANT]} className="capitalize shrink-0">
                  {c.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
