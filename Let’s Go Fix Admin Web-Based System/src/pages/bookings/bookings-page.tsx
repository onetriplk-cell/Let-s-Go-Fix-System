import { type ColumnDef } from '@tanstack/react-table'
import dayjs from 'dayjs'
import { Card, CardContent } from '@/components/ui/card'
import { DataTable } from '@/components/common/data-table'
import { BookingStatusBadge } from '@/components/common/status-badge'
import { useBookings, type BookingRow } from '@/hooks/use-bookings'

const columns: ColumnDef<BookingRow>[] = [
  {
    accessorKey: 'customer_name',
    header: 'Customer',
    cell: ({ row }) => <span className="font-medium text-slate-900">{row.original.customer_name}</span>,
  },
  {
    accessorKey: 'category_name',
    header: 'Service',
  },
  {
    accessorKey: 'provider_name',
    header: 'Provider',
    cell: ({ row }) => row.original.provider_name ?? <span className="text-slate-400">Unassigned</span>,
  },
  {
    accessorKey: 'pickup_address',
    header: 'Pickup',
    cell: ({ row }) => (
      <span className="max-w-[200px] truncate block">{row.original.pickup_address ?? '—'}</span>
    ),
  },
  {
    accessorKey: 'quoted_price',
    header: 'Price',
    cell: ({ row }) => {
      const price = row.original.final_price ?? row.original.quoted_price
      return price ? `LKR ${price.toLocaleString()}` : '—'
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <BookingStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'requested_at',
    header: 'Requested',
    cell: ({ row }) => dayjs(row.original.requested_at).format('MMM D, h:mm A'),
  },
]

export default function BookingsPage() {
  const { data, isLoading } = useBookings()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Bookings</h1>
        <p className="text-sm text-slate-500">Roadside assistance service requests</p>
      </div>

      <Card>
        <CardContent className="pt-5">
          {isLoading ? (
            <p className="text-sm text-slate-400">Loading bookings…</p>
          ) : (
            <DataTable
              columns={columns}
              data={data ?? []}
              searchPlaceholder="Search bookings…"
              emptyMessage="No bookings yet. Once customers start requesting assistance, they'll show up here."
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
