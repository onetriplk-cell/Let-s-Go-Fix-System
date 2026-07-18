import { ClipboardList, CheckCircle2, DollarSign, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useAuthStore } from '@/store/auth-store'
import { useProviderDashboard } from '@/hooks/use-provider-dashboard'
import { useMyJobs } from '@/hooks/use-job-requests'
import { BookingStatusBadge } from '@/components/common/status-badge'
import dayjs from 'dayjs'

function StatCard({
  label,
  value,
  icon: Icon,
  loading,
}: {
  label: string
  value: string
  icon: React.ElementType
  loading: boolean
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between pt-5">
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{loading ? '—' : value}</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const providerProfile = useAuthStore((s) => s.providerProfile)
  const { data: stats, isLoading } = useProviderDashboard()
  const { data: myJobs, isLoading: jobsLoading } = useMyJobs()

  const recentJobs = myJobs?.slice(0, 5) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">
          Welcome back{providerProfile ? `, ${providerProfile.business_name}` : ''}
        </h1>
        <p className="text-sm text-slate-500">Here's how things are going</p>
      </div>

      {providerProfile?.verification_status === 'pending' && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-5 text-sm text-amber-800">
            Your account is pending admin verification. You'll be able to go online and accept jobs once approved.
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Jobs" value={String(stats?.activeJobCount ?? 0)} icon={ClipboardList} loading={isLoading} />
        <StatCard label="Completed Jobs" value={String(stats?.completedJobCount ?? 0)} icon={CheckCircle2} loading={isLoading} />
        <StatCard
          label="Total Earnings"
          value={`LKR ${(stats?.totalEarnings ?? 0).toLocaleString()}`}
          icon={DollarSign}
          loading={isLoading}
        />
        <StatCard
          label="Rating"
          value={`${providerProfile?.rating_avg.toFixed(1) ?? '0.0'} (${providerProfile?.rating_count ?? 0})`}
          icon={Star}
          loading={isLoading}
        />
      </div>

      <Card>
        <CardContent className="pt-5">
          <h2 className="mb-3 text-sm font-medium text-slate-500">Recent jobs</h2>
          {jobsLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!jobsLoading && recentJobs.length === 0 && (
            <p className="text-sm text-slate-400">No jobs yet. Go online and accept your first request from Job Requests.</p>
          )}
          <div className="flex flex-col divide-y divide-slate-100">
            {recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between gap-2 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">
                    {job.category_name} · {job.customer_name}
                  </p>
                  <p className="text-xs text-slate-400">{dayjs(job.requested_at).format('MMM D, h:mm A')}</p>
                </div>
                <BookingStatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
