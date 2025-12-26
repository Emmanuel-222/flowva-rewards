import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { UserPlus, Gift, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function SpotlightTool() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Fetch featured spotlight tool
  const { data: spotlight, isLoading } = useQuery({
    queryKey: ['spotlightTool'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('spotlight_tools')
        .select('*')
        .eq('is_featured', true)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
  })

  // Check if user has already claimed this spotlight
  const { data: hasClaimed } = useQuery({
    queryKey: ['spotlightClaimed', user?.id, spotlight?.id],
    queryFn: async () => {
      if (!user || !spotlight) return false

      const { data, error } = await supabase
        .from('point_transactions')
        .select('id')
        .eq('user_id', user.id)
        .eq('type', 'spotlight')
        .ilike('description', `%${spotlight.name}%`)
        .limit(1)

      if (error) {
        console.error('Error checking spotlight claim:', error)
        return false
      }

      return data && data.length > 0
    },
    enabled: !!user && !!spotlight,
  })

  const claimSpotlightMutation = useMutation({
    mutationFn: async () => {
      if (!user || !spotlight) throw new Error('Cannot claim')
      if (hasClaimed) throw new Error('Already claimed')

      // Add points transaction for spotlight
      const { error } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          type: 'spotlight',
          points_delta: spotlight.points_reward,
          description: `Claimed spotlight reward for ${spotlight.name}`,
        })

      if (error) throw error

      // Open the tool URL if provided
      if (spotlight.cta_url) {
        window.open(spotlight.cta_url, '_blank')
      }
    },
    onSuccess: () => {
      toast.success(`+${spotlight?.points_reward} points!`)
      queryClient.invalidateQueries({ queryKey: ['totalPoints'] })
      queryClient.invalidateQueries({ queryKey: ['spotlightClaimed'] })
    },
    onError: (error) => {
      if (error.message === 'Already claimed') {
        toast.error('You have already claimed this reward!')
      } else {
        toast.error('Failed to claim reward')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-sm animate-pulse">
        <div className="h-6 w-24 bg-white/30 rounded mb-4"></div>
        <div className="h-8 w-32 bg-white/30 rounded mb-2"></div>
        <div className="h-4 w-full bg-white/30 rounded"></div>
      </div>
    )
  }

  // Fallback if no spotlight tool configured
  if (!spotlight) {
    return (
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-sm text-white relative">
        <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-medium mb-3">
          Featured
        </span>
        <h3 className="text-xl font-bold mb-2">Top Tool Spotlight</h3>
        <p className="text-white/80 text-sm mb-4">
          Check back soon for featured tools and bonus points!
        </p>
        <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <Gift className="w-6 h-6" />
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 shadow-sm text-white relative overflow-hidden">
      {/* Badge */}
      <span className="inline-block px-3 py-1 bg-pink-500 rounded-full text-xs font-medium mb-3">
        Featured
      </span>

      {/* Icon */}
      <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
        <div className="w-6 h-6 bg-blue-400 rounded-full"></div>
        <div className="absolute w-4 h-4 bg-yellow-400 rounded-full -bottom-1 -right-1"></div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-1">Top Tool Spotlight</h3>
      <p className="text-2xl font-bold text-pink-300 mb-3">{spotlight.name}</p>

      {/* Description */}
      <div className="flex items-start gap-2 mb-4">
        <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
          <span className="text-xs"></span>
        </div>
        <div>
          <p className="font-semibold text-sm">
            {spotlight.cta_label || 'Try it out'}
          </p>
          <p className="text-white/80 text-sm">
            {spotlight.description}
          </p>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => {
            if (spotlight.cta_url) window.open(spotlight.cta_url, '_blank')
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          <span className="text-sm font-medium">Sign up</span>
        </button>
        
        {hasClaimed ? (
          <button
            disabled
            className="flex items-center gap-2 px-4 py-2 bg-green-500/80 rounded-lg cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Claimed</span>
          </button>
        ) : (
          <button
            onClick={() => claimSpotlightMutation.mutate()}
            disabled={claimSpotlightMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-pink-500 hover:bg-pink-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <Gift className="w-4 h-4" />
            <span className="text-sm font-medium">
              {claimSpotlightMutation.isPending ? 'Claiming...' : `Claim ${spotlight.points_reward} pts`}
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
