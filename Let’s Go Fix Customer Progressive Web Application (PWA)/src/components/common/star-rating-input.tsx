import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star
            className={cn(
              'h-6 w-6 transition-colors',
              n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700',
            )}
          />
        </button>
      ))}
    </div>
  )
}
