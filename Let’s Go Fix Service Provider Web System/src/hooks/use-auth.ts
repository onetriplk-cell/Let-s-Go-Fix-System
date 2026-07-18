import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/auth-store'
import type { Profile, ProviderProfile } from '@/types/database'

export function useAuthListener() {
  const setProfile = useAuthStore((s) => s.setProfile)
  const setProviderProfile = useAuthStore((s) => s.setProviderProfile)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    const loadProfile = async (userId: string) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setProfile((profile as Profile) ?? null)

      if (profile && (profile as Profile).role === 'provider') {
        const { data: providerProfile } = await supabase
          .from('provider_profiles')
          .select('*')
          .eq('profile_id', userId)
          .single()
        setProviderProfile((providerProfile as ProviderProfile) ?? null)
      }

      setLoading(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadProfile(session.user.id)
      } else {
        setProfile(null)
        setProviderProfile(null)
        setLoading(false)
      }
    })

    return () => listener.subscription.unsubscribe()
  }, [setProfile, setProviderProfile, setLoading])
}
