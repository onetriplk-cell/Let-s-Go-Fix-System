import dayjs from 'dayjs'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useEarnings } from '@/hooks/use-earnings'

const WEEKLY_TREND = [
  { day: 'Mon', earnings: 3500 },
  { day: 'Tue', earnings: 6200 },
  { day: 'Wed', earnings: 4100 },
  { day: 'Thu', earnings: 8800 },
  { day: 'Fri', earnings: 11200 },
  { day: 'Sat', earnings: 14500 },
  { day: 'Sun', earnings: 7300 },
]

const STATUS_VARIANT = {
  pending: 'warning',
  paid: 'success',
  failed: 'destructive',
  refunded: 'default',
} as const

export default function EarningsPage() {
  const { data, isLoading } = useEarnings()

  const totalPaid = (data ?? []).filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0)
  const totalPending = (data ?? []).filter((p) => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Earnings</h1>
        <p className="text-sm text-slate-500">Your payment history and income overview</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Total earned</p>
            <p className="mt-1 text-2xl font-semibold text-emerald-700">LKR {totalPaid.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-5">
            <p className="text-sm text-slate-500">Pending payout</p>
            <p className="mt-1 text-2xl font-semibold text-amber-600">LKR {totalPending.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly earnings</CardTitle>
          <p className="text-xs text-slate-400">Sample trend — replace with real time-series once volume builds up</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={WEEKLY_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: '#f1f5f9' }}
                formatter={(v) => `LKR ${Number(v).toLocaleString()}`}
              />
              <Bar dataKey="earnings" fill="#059669" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment history</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!isLoading && data?.length === 0 && (
            <p className="text-sm text-slate-400">No payments yet.</p>
          )}
          <div className="flex flex-col divide-y divide-slate-100">
            {data?.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">LKR {Number(p.amount).toLocaleString()}</p>
                  <p className="text-xs text-slate-400">
                    {p.method.toUpperCase()} · {dayjs(p.created_at).format('MMM D, YYYY')}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[p.status as keyof typeof STATUS_VARIANT]} className="capitalize">
                  {p.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
