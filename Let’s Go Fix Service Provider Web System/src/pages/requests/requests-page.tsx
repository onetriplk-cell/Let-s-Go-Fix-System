import dayjs from 'dayjs'
import { Phone, MapPin } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookingStatusBadge } from '@/components/common/status-badge'
import { useOpenJobs, useMyJobs, useUpdateJobStatus, type JobRow } from '@/hooks/use-job-requests'
import type { BookingStatus } from '@/types/database'

const NEXT_STATUS: Partial<Record<BookingStatus, { label: string; next: BookingStatus }>> = {
  accepted: { label: 'Start heading out', next: 'provider_en_route' },
  provider_en_route: { label: 'Arrived — start job', next: 'in_progress' },
  in_progress: { label: 'Mark completed', next: 'completed' },
}

function JobCard({ job, children }: { job: JobRow; children?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium text-slate-900">{job.category_name}</p>
          <p className="text-sm text-slate-500">{job.customer_name} · {job.vehicle_label}</p>
        </div>
        <BookingStatusBadge status={job.status} />
      </div>

      {job.pickup_address && (
        <p className="flex items-center gap-1.5 text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0" /> {job.pickup_address}
        </p>
      )}

      {job.customer_phone && (
        <p className="flex items-center gap-1.5 text-sm text-slate-500">
          <Phone className="h-3.5 w-3.5 shrink-0" /> {job.customer_phone}
        </p>
      )}

      {job.description && <p className="text-sm text-slate-600">{job.description}</p>}

      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-400">{dayjs(job.requested_at).format('MMM D, h:mm A')}</p>
        <p className="text-sm font-medium text-brand-700">
          {job.quoted_price ? `LKR ${job.quoted_price.toLocaleString()}` : 'Price TBD'}
        </p>
      </div>

      {children}
    </div>
  )
}

export default function RequestsPage() {
  const { data: openJobs, isLoading: openLoading } = useOpenJobs()
  const { data: myJobs, isLoading: myLoading } = useMyJobs()
  const updateStatus = useUpdateJobStatus()

  const activeJobs = myJobs?.filter((j) => !['completed', 'rejected', 'cancelled_by_customer', 'cancelled_by_provider'].includes(j.status)) ?? []
  const pastJobs = myJobs?.filter((j) => ['completed', 'rejected', 'cancelled_by_customer', 'cancelled_by_provider'].includes(j.status)) ?? []

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Job Requests</h1>
        <p className="text-sm text-slate-500">Accept new jobs and manage your active work</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available nearby ({openJobs?.length ?? 0})</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {openLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!openLoading && openJobs?.length === 0 && (
            <p className="text-sm text-slate-400">No open requests right now. New requests appear here automatically.</p>
          )}
          {openJobs?.map((job) => (
            <JobCard key={job.id} job={job}>
              <Button
                variant="brand"
                size="sm"
                className="w-full"
                onClick={() => updateStatus.mutate({ id: job.id, status: 'accepted' })}
                disabled={updateStatus.isPending}
              >
                Accept job
              </Button>
            </JobCard>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>My active jobs ({activeJobs.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {myLoading && <p className="text-sm text-slate-400">Loading…</p>}
          {!myLoading && activeJobs.length === 0 && (
            <p className="text-sm text-slate-400">No active jobs.</p>
          )}
          {activeJobs.map((job) => {
            const next = NEXT_STATUS[job.status]
            return (
              <JobCard key={job.id} job={job}>
                {next && (
                  <Button
                    variant="brand"
                    size="sm"
                    className="w-full"
                    onClick={() => updateStatus.mutate({ id: job.id, status: next.next })}
                    disabled={updateStatus.isPending}
                  >
                    {next.label}
                  </Button>
                )}
              </JobCard>
            )
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Job history ({pastJobs.length})</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pastJobs.length === 0 && <p className="text-sm text-slate-400">No completed jobs yet.</p>}
          {pastJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
