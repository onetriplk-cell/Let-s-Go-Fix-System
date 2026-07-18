import { type ColumnDef } from '@tanstack/react-table'
import { Check, X, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/common/data-table'
import { VerificationStatusBadge } from '@/components/common/status-badge'
import { useProviders, useUpdateProviderVerification, type ProviderRow } from '@/hooks/use-providers'

export default function ProvidersPage() {
  const { data, isLoading } = useProviders()
  const updateVerification = useUpdateProviderVerification()

  const columns: ColumnDef<ProviderRow>[] = [
    {
      accessorKey: 'business_name',
      header: 'Business',
      cell: ({ row }) => (
        <div>
          <p className="font-medium text-slate-900">{row.original.business_name}</p>
          <p className="text-xs text-slate-400">{row.original.full_name}</p>
        </div>
      ),
    },
    {
      accessorKey: 'provider_type',
      header: 'Type',
      cell: ({ row }) => (
        <Badge className="capitalize">{row.original.provider_type.replaceAll('_', ' ')}</Badge>
      ),
    },
    {
      accessorKey: 'rating_avg',
      header: 'Rating',
      cell: ({ row }) => (
        <span className="flex items-center gap-1 text-slate-700">
          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
          {row.original.rating_avg.toFixed(1)}
          <span className="text-xs text-slate-400">({row.original.rating_count})</span>
        </span>
      ),
    },
    {
      accessorKey: 'is_available',
      header: 'Availability',
      cell: ({ row }) => (
        <Badge variant={row.original.is_available ? 'success' : 'default'}>
          {row.original.is_available ? 'Available' : 'Offline'}
        </Badge>
      ),
    },
    {
      accessorKey: 'verification_status',
      header: 'Verification',
      cell: ({ row }) => <VerificationStatusBadge status={row.original.verification_status} />,
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isPending = row.original.verification_status === 'pending'
        if (!isPending) return <span className="text-xs text-slate-400">—</span>
        return (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              onClick={() =>
                updateVerification.mutate({ profileId: row.original.profile_id, status: 'verified' })
              }
              disabled={updateVerification.isPending}
            >
              <Check className="h-3.5 w-3.5" /> Approve
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
              onClick={() =>
                updateVerification.mutate({ profileId: row.original.profile_id, status: 'rejected' })
              }
              disabled={updateVerification.isPending}
            >
              <X className="h-3.5 w-3.5" /> Reject
            </Button>
          </div>
        )
      },
    },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Service Providers</h1>
        <p className="text-sm text-slate-500">Garages, mechanics, tow trucks, and other providers</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading providers…</p>
          ) : (
            <DataTable
              columns={columns}
              data={data ?? []}
              searchPlaceholder="Search providers…"
              emptyMessage="No providers yet."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
