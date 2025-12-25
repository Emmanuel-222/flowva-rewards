import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../lib/database.types'

interface AuthContextType {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<{ error: Error | null }>
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching profile:', error)
        return null
      }
      return data as Profile
    } catch (err) {
      console.error('fetchProfile exception:', err)
      return null
    }
  }

  const generateReferralCode = (email: string) => {
    const base = email.split('@')[0].slice(0, 6).toLowerCase()
    const random = Math.floor(Math.random() * 10000)
    return `${base}${random}`
  }

  const createProfile = async (userId: string, email: string, displayName: string): Promise<Profile | null> => {
    try {
      const referralCode = generateReferralCode(email)

      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: userId,
          email,
          display_name: displayName,
          referral_code: referralCode,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating profile:', error)
        return null
      }

      supabase.from('daily_streaks').insert({
        user_id: userId,
        current_streak: 0,
        last_claimed_date: null,
      }).then(res => {
        if (res.error) console.error('Error creating streak:', res.error)
      })

      supabase.from('point_transactions').insert({
        user_id: userId,
        type: 'signup',
        points_delta: 10,
        description: 'Welcome bonus for signing up!',
      }).then(res => {
        if (res.error) console.error('Error creating points:', res.error)
      })

      return data as Profile
    } catch (err) {
      console.error('createProfile exception:', err)
      return null
    }
  }

  useEffect(() => {
    let mounted = true
    console.log('AuthProvider: initializing...')

    const initAuth = async () => {
      try {
        console.log('initAuth: calling getSession...')
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) {
          console.error('getSession error:', error)
        }

        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          const profileData = await fetchProfile(session.user.id)
          if (mounted) {
            setProfile(profileData)
          }
        }
      } catch (err) {
        console.error('initAuth exception:', err)
      } finally {
        if (mounted) {
          console.log('initAuth: setting loading to false')
          setLoading(false)
        }
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session ? 'with session' : 'no session')
        
        if (!mounted) return

        setSession(session)
        setUser(session?.user ?? null)
        
        // Set loading false immediately, fetch profile in background
        setLoading(false)

        if (session?.user) {
          // Fetch profile in background, don't block
          fetchProfile(session.user.id).then(profileData => {
            if (mounted) {
              setProfile(profileData)
            }
          })
        } else {
          setProfile(null)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        return { error }
      }

      if (data.user) {
        const profileData = await createProfile(data.user.id, email, displayName)
        setProfile(profileData)
      }

      return { error: null }
    } catch (err) {
      console.error('signUp exception:', err)
      return { error: err as Error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      return { error: error as Error | null }
    } catch (err) {
      console.error('signIn exception:', err)
      return { error: err as Error }
    }
  }

  const signOut = async () => {
    console.log('signOut: starting...')
    try {
      const { error } = await supabase.auth.signOut()
      console.log('signOut: complete', { error })
      if (error) {
        console.error('Sign out error:', error)
      }
      setUser(null)
      setSession(null)
      setProfile(null)
    } catch (err) {
      console.error('Sign out exception:', err)
      // Force clear state even on error
      setUser(null)
      setSession(null)
      setProfile(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
