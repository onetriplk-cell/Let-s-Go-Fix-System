import { Badge } from '@/components/ui/badge'
import type { BookingStatus, VerificationStatus } from '@/types/database'

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

const VERIFICATION_VARIANT: Record<VerificationStatus, 'default' | 'success' | 'warning' | 'destructive'> = {
  pending: 'warning',
  verified: 'success',
  rejected: 'destructive',
  suspended: 'destructive',
}

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  return (
    <Badge variant={BOOKING_STATUS_VARIANT[status]} className="capitalize">
      {status.replaceAll('_', ' ')}
    </Badge>
  )
}

export function VerificationStatusBadge({ status }: { status: VerificationStatus }) {
  return (
    <Badge variant={VERIFICATION_VARIANT[status]} className="capitalize">
      {status}
    </Badge>
  )
}
