import { Users, Wrench, ClipboardList, ShieldAlert } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import dayjs from 'dayjs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookingStatusBadge } from '@/components/common/status-badge'
import { useDashboardStats, useRecentBookings } from '@/hooks/use-dashboard-stats'
import type { BookingStatus } from '@/types/database'

const WEEKLY_TREND = [
  { day: 'Mon', bookings: 4 },
  { day: 'Tue', bookings: 7 },
  { day: 'Wed', bookings: 5 },
  { day: 'Thu', bookings: 9 },
  { day: 'Fri', bookings: 12 },
  { day: 'Sat', bookings: 15 },
  { day: 'Sun', bookings: 8 },
]

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value: number
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">
            {loading ? '—' : value.toLocaleString()}
          </p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { data: stats, isLoading } = useDashboardStats()
  const { data: bookings, isLoading: bookingsLoading } = useRecentBookings()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Overview of platform activity</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Customers" value={stats?.customerCount ?? 0} icon={Users} loading={isLoading} />
        <StatCard label="Service Providers" value={stats?.providerCount ?? 0} icon={Wrench} loading={isLoading} />
        <StatCard label="Total Bookings" value={stats?.bookingCount ?? 0} icon={ClipboardList} loading={isLoading} />
        <StatCard
          label="Pending Verifications"
          value={stats?.pendingProviderCount ?? 0}
          icon={ShieldAlert}
          loading={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Bookings this week</CardTitle>
            <p className="text-xs text-slate-400">Sample trend — replace with real time-series once volume builds up</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={WEEKLY_TREND}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} />
                <Bar dataKey="bookings" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent bookings</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {bookingsLoading && <p className="text-sm text-slate-400">Loading…</p>}
            {!bookingsLoading && bookings?.length === 0 && (
              <p className="text-sm text-slate-400">No bookings yet.</p>
            )}
            {bookings?.map((b) => (
              <div key={b.id} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {b.pickup_address ?? 'Unknown location'}
                  </p>
                  <p className="text-xs text-slate-400">{dayjs(b.requested_at).format('MMM D, h:mm A')}</p>
                </div>
                <BookingStatusBadge status={b.status as BookingStatus} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
