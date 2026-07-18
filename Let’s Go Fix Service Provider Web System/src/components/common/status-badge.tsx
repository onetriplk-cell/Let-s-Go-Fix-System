import { Badge } from '@/components/ui/badge'
import type { BookingStatus } from '@/types/database'

const BOOKING_STATUS_VARIANT: Record<BookingStatus, 'default' | 'success' | 'warning' | 'destructive' | 'brand'> = {
  requested: 'warning',
  accepted: 'brand',
  rejected: 'destructive',
  provider_en_route: 'brand',
  in_progress: 'brand',
  completed: 'success',
  cancelled_by_customer: 'destructive',
  cancelled_by_provider: 'destructive',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={BOOKING_STATUS_VARIANT[status]} className="capitalize">
      {status.replaceAll('_', ' ')}
    </Badge>
  )
}
