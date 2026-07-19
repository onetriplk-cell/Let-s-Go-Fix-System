import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { RefreshCw } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { CardSkeletonGrid } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/common/empty-state'
import { StaggerList, StaggerItem } from '@/components/common/motion'
import { BookingStatusBadge } from '@/components/common/status-badge'
import { StarRatingInput } from '@/components/common/star-rating-input'
import { useRequestHistory, type HistoryRow } from '@/hooks/use-request-history'
import { useSubmitReview } from '@/hooks/use-submit-review'
import { supabase } from '@/lib/supabase'
import { useQuery } from '@tanstack/react-query'

function ReviewDialog({ row, onClose }: { row: HistoryRow; onClose: () => void }) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const submitReview = useSubmitReview()

  const { data: providerId } = useQuery({
    queryKey: ['request-provider-id', row.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('service_requests')
        .select('provider_id')
        .eq('id', row.id)
        .single()
      return data?.provider_id as string | undefined
    },
  })

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogTitle>Rate your experience</DialogTitle>
        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-2 text-sm text-slate-500 dark:text-slate-400">How was {row.provider_name}?</p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            className="flex w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <Button
            variant="brand"
            disabled={!providerId || submitReview.isPending}
            onClick={() =>
              submitReview.mutate(
                { requestId: row.id, providerId: providerId!, rating, comment },
                { onSuccess: onClose },
              )
            }
          >
            {submitReview.isPending ? 'Submitting…' : 'Submit review'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function HistoryPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useRequestHistory()
  const [reviewTarget, setReviewTarget] = useState<HistoryRow | null>(null)

  return (
    <div>
      <TopBar title="Booking History" subtitle="Your past and current requests" />

      <div className="mx-auto flex max-w-md flex-col gap-3 p-4 sm:max-w-5xl sm:p-8">
        {isLoading && (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
            <CardSkeletonGrid count={4} />
          </div>
        )}

        {!isLoading && data?.length === 0 && (
          <Card>
            <EmptyState kind="history" title="No requests yet" description="Your booking history will show up here." />
          </Card>
        )}

        <StaggerList className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
        {data?.map((row) => (
          <StaggerItem key={row.id}>
          <Card className="transition-all hover:-translate-y-0.5 hover:shadow-md dark:hover:shadow-black/30">
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900 dark:text-slate-100">{row.category_name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{row.provider_name ?? 'Unassigned'}</p>
                </div>
                <BookingStatusBadge status={row.status as any} />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500">{dayjs(row.requested_at).format('MMM D, YYYY h:mm A')}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                  {row.final_price
                    ? `LKR ${row.final_price.toLocaleString()}`
                    : row.quoted_price
                      ? `LKR ${row.quoted_price.toLocaleString()}`
                      : 'Varies'}
                </p>
                {row.status === 'completed' && !row.has_review && (
                  <Button size="sm" variant="outline" onClick={() => setReviewTarget(row)}>
                    Rate provider
                  </Button>
                )}
                {row.has_review && <span className="text-xs text-slate-400 dark:text-slate-500">Reviewed</span>}
              </div>
              {row.category_id && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="-ml-2 mt-1 w-fit text-brand-600 hover:bg-brand-50 dark:text-brand-400 dark:hover:bg-brand-500/10"
                  onClick={() => navigate('/request', { state: { categoryId: row.category_id } })}
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Book again
                </Button>
              )}
            </CardContent>
          </Card>
          </StaggerItem>
        ))}
        </StaggerList>
      </div>

      {reviewTarget && <ReviewDialog row={reviewTarget} onClose={() => setReviewTarget(null)} />}
    </div>
  )
}
