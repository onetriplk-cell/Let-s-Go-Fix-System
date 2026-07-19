import { create } from 'zustand'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'lgf-theme'

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  document.documentElement.style.colorScheme = theme
}

interface ThemeState {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: document.documentElement.classList.contains('dark') ? 'dark' : 'light',
  setTheme: (theme) => {
    localStorage.setItem(STORAGE_KEY, theme)
    applyTheme(theme)
    set({ theme })
  },
  toggleTheme: () => {
    const next = get().theme === 'dark' ? 'light' : 'dark'
    get().setTheme(next)
  },
}))

if (!localStorage.getItem(STORAGE_KEY)) {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (localStorage.getItem(STORAGE_KEY)) return
    const theme: Theme = e.matches ? 'dark' : 'light'
    applyTheme(theme)
    useThemeStore.setState({ theme })
  })
}
