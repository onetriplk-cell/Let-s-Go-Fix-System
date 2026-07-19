import * as React from 'react'
import * as PopoverPrimitive from '@radix-ui/react-popover'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AutocompleteProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  emptyText?: string
}

export function Autocomplete({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  disabled,
  emptyText = 'No matches — type to enter your own',
}: AutocompleteProps) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState('')
  const inputRef = React.useRef<HTMLInputElement>(null)

  const filtered = React.useMemo(() => {
    if (!query) return options
    const q = query.toLowerCase()
    return options.filter((o) => o.toLowerCase().includes(q))
  }, [options, query])

  return (
    <PopoverPrimitive.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setQuery(value)
          requestAnimationFrame(() => inputRef.current?.select())
        } else if (query && query !== value) {
          onChange(query)
        }
      }}
    >
      <PopoverPrimitive.Trigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            'flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-left text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100',
          )}
        >
          <span className={cn(!value && 'text-slate-400 dark:text-slate-500')}>{value || placeholder}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          align="start"
          sideOffset={6}
          className="z-50 w-[var(--radix-popover-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
        >
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type to search…"
            className="w-full border-b border-slate-100 px-3.5 py-2.5 text-sm outline-none placeholder:text-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500"
          />
          <div className="scrollbar-thin max-h-56 overflow-y-auto p-1">
            {filtered.length === 0 && (
              <p className="px-3 py-4 text-center text-xs text-slate-400 dark:text-slate-500">{emptyText}</p>
            )}
            {filtered.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option)
                  setQuery(option)
                  setOpen(false)
                }}
                className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-900 outline-none hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
              >
                {option}
                {option === value && <Check className="h-4 w-4 text-brand-600 dark:text-brand-400" />}
              </button>
            ))}
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  )
}
