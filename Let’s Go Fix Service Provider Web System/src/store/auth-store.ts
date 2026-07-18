import { create } from 'zustand'
import type { Profile, ProviderProfile } from '@/types/database'

interface AuthState {
  profile: Profile | null
  providerProfile: ProviderProfile | null
  isLoading: boolean
  setProfile: (profile: Profile | null) => void
  setProviderProfile: (providerProfile: ProviderProfile | null) => void
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  profile: null,
  providerProfile: null,
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setProviderProfile: (providerProfile) => set({ providerProfile }),
  setLoading: (isLoading) => set({ isLoading }),
}))
