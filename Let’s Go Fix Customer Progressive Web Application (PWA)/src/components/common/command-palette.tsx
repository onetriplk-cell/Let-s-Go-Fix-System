import { useEffect } from 'react'
import { Command } from 'cmdk'
import { useNavigate } from 'react-router-dom'
import {
  Home,
  Car,
  ClipboardList,
  User,
  AlertTriangle,
  Search,
  MoonStar,
  Sun,
} from 'lucide-react'
import { useServiceCategories } from '@/hooks/use-service-categories'
import { useThemeStore } from '@/store/theme-store'
import { useAuthStore } from '@/store/auth-store'
import { useCommandPaletteStore } from '@/store/command-palette-store'

export function CommandPalette() {
  const open = useCommandPaletteStore((s) => s.open)
  const setOpen = useCommandPaletteStore((s) => s.setOpen)
  const navigate = useNavigate()
  const profile = useAuthStore((s) => s.profile)
  const { data: categories } = useServiceCategories()
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        useCommandPaletteStore.getState().toggle()
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  if (!profile) return null

  const go = (path: string, state?: unknown) => {
    navigate(path, state ? { state } : undefined)
    setOpen(false)
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Quick actions"
      overlayClassName="fixed inset-0 z-[99] bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in dark:bg-black/60"
      contentClassName="fixed left-1/2 top-24 z-[100] w-[92vw] max-w-lg -translate-x-1/2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:zoom-in-95 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center gap-2 border-b border-slate-100 px-4 dark:border-slate-800">
        <Search className="h-4 w-4 shrink-0 text-slate-400" />
        <Command.Input
          placeholder="Search actions, services, pages…"
          className="w-full bg-transparent py-3.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <kbd className="shrink-0 rounded border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-400 dark:border-slate-700 dark:text-slate-500">
          ESC
        </kbd>
      </div>

      <Command.List className="scrollbar-thin max-h-96 overflow-y-auto p-2">
        <Command.Empty className="px-3 py-8 text-center text-sm text-slate-400 dark:text-slate-500">
          No results found.
        </Command.Empty>

        <Command.Group heading="Go to" className="px-2 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 [&_[cmdk-group-items]]:mt-1">
          <PaletteItem icon={Home} label="Home" onSelect={() => go('/home')} />
          <PaletteItem icon={Car} label="My Vehicles" onSelect={() => go('/vehicles')} />
          <PaletteItem icon={ClipboardList} label="Booking History" onSelect={() => go('/history')} />
          <PaletteItem icon={User} label="Profile" onSelect={() => go('/profile')} />
        </Command.Group>

        <Command.Group heading="Actions" className="px-2 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 [&_[cmdk-group-items]]:mt-1">
          <PaletteItem icon={AlertTriangle} label="Request roadside assistance" onSelect={() => go('/request')} />
          <PaletteItem
            icon={theme === 'dark' ? Sun : MoonStar}
            label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onSelect={() => {
              toggleTheme()
              setOpen(false)
            }}
          />
        </Command.Group>

        {categories && categories.length > 0 && (
          <Command.Group heading="Request a service" className="px-2 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 [&_[cmdk-group-items]]:mt-1">
            {categories.map((c) => (
              <PaletteItem
                key={c.id}
                icon={AlertTriangle}
                label={c.name}
                onSelect={() => go('/request', { categoryId: c.id })}
              />
            ))}
          </Command.Group>
        )}
      </Command.List>
    </Command.Dialog>
  )
}

function PaletteItem({
  icon: Icon,
  label,
  onSelect,
}: {
  icon: typeof Home
  label: string
  onSelect: () => void
}) {
  return (
    <Command.Item
      onSelect={onSelect}
      className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-700 outline-none data-[selected=true]:bg-slate-100 dark:text-slate-300 dark:data-[selected=true]:bg-slate-800"
    >
      <Icon className="h-4 w-4 shrink-0 text-slate-400 dark:text-slate-500" />
      {label}
    </Command.Item>
  )
}
