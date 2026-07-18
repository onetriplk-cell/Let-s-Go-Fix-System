import { type ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/common/data-table'
import { useCustomers, type CustomerRow } from '@/hooks/use-customers'

const columns: ColumnDef<CustomerRow>[] = [
  {
    accessorKey: 'full_name',
    header: 'Name',
    cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.full_name}</span>,
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
    cell: ({ row }) => row.original.phone ?? '—',
  },
  {
    accessorKey: 'vehicle_count',
    header: 'Vehicles',
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? 'success' : 'destructive'}>
        {row.original.is_active ? 'Active' : 'Suspended'}
      </Badge>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Joined',
    cell: ({ row }) => dayjs(row.original.created_at).format('MMM D, YYYY'),
  },
]

export default function CustomersPage() {
  const { data, isLoading } = useCustomers()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
        <p className="text-sm text-slate-500">Vehicle owners registered on the platform</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading customers…</p>
          ) : (
            <DataTable columns={columns} data={data ?? []} searchPlaceholder="Search customers…" emptyMessage="No customers yet." />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
