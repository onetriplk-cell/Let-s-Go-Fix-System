import { useState } from 'react'
import dayjs from 'dayjs'
import { ClipboardList } from 'lucide-react'
import { TopBar } from '@/components/layout/top-bar'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
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
            <p className="mb-2 text-sm text-slate-500">How was {row.provider_name}?</p>
            <StarRatingInput value={rating} onChange={setRating} />
          </div>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Optional comment"
            className="flex w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
  const { data, isLoading } = useRequestHistory()
  const [reviewTarget, setReviewTarget] = useState<HistoryRow | null>(null)

  return (
    <div>
      <TopBar title="Booking History" subtitle="Your past and current requests" />

      <div className="flex flex-col gap-3 p-4">
        {isLoading && <p className="text-center text-sm text-slate-400">Loading…</p>}

        {!isLoading && data?.length === 0 && (
          <Card>
            <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
              <ClipboardList className="h-8 w-8 text-slate-300" />
              <p className="text-sm text-slate-500">No requests yet.</p>
            </CardContent>
          </Card>
        )}

        {data?.map((row) => (
          <Card key={row.id}>
            <CardContent className="flex flex-col gap-2 pt-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium text-slate-900">{row.category_name}</p>
                  <p className="text-sm text-slate-500">{row.provider_name ?? 'Unassigned'}</p>
                </div>
                <BookingStatusBadge status={row.status as any} />
              </div>
              <p className="text-xs text-slate-400">{dayjs(row.requested_at).format('MMM D, YYYY h:mm A')}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-brand-700">
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
                {row.has_review && <span className="text-xs text-slate-400">Reviewed</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {reviewTarget && <ReviewDialog row={reviewTarget} onClose={() => setReviewTarget(null)} />}
    </div>
  )
}
