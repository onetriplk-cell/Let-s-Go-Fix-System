import { Moon, Sun } from 'lucide-react'
import { useThemeStore } from '@/store/theme-store'
import { cn } from '@/lib/utils'

export function ThemeToggle({ className }: { className?: string }) {
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isDark = theme === 'dark'

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label="Toggle dark mode"
      onClick={toggleTheme}
      className={cn(
        'relative flex h-9 w-16 shrink-0 items-center rounded-full border border-slate-200 bg-slate-100 px-1 transition-colors dark:border-slate-700 dark:bg-slate-800',
        className,
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm transition-transform duration-300 ease-out dark:bg-slate-950 dark:text-brand-400',
          isDark && 'translate-x-7',
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
    </button>
  )
}
