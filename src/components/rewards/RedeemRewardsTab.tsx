import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Gift, Lock, Clock } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import RewardCard from './RewardCard'
import type { Reward } from '../../lib/database.types'

type Filter = 'all' | 'unlocked' | 'locked' | 'coming_soon'

export default function RedeemRewardsTab() {
  const [activeFilter, setActiveFilter] = useState<Filter>('all')
  const { user } = useAuth()

  // Fetch total points
  const { data: totalPoints = 0 } = useQuery({
    queryKey: ['totalPoints', user?.id],
    queryFn: async () => {
      if (!user) return 0

      const { data, error } = await supabase
        .from('point_transactions')
        .select('points_delta')
        .eq('user_id', user.id)

      if (error) throw error

      return data.reduce((sum, t) => sum + t.points_delta, 0)
    },
    enabled: !!user,
  })

  // Fetch rewards
  const { data: rewards = [], isLoading } = useQuery({
    queryKey: ['rewards'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rewards')
        .select('*')
        .order('points_cost', { ascending: true })

      if (error) throw error
      return data
    },
  })

  // Filter rewards based on active filter and user points
  const filteredRewards = rewards.filter((reward: Reward) => {
    const isUnlocked = totalPoints >= reward.points_cost
    const isComingSoon = reward.status === 'coming_soon'

    switch (activeFilter) {
      case 'unlocked':
        return isUnlocked && !isComingSoon
      case 'locked':
        return !isUnlocked && !isComingSoon
      case 'coming_soon':
        return isComingSoon
      default:
        return true
    }
  })

  // Count for each filter
  const counts = {
    all: rewards.length,
    unlocked: rewards.filter(r => totalPoints >= r.points_cost && r.status !== 'coming_soon').length,
    locked: rewards.filter(r => totalPoints < r.points_cost && r.status !== 'coming_soon').length,
    coming_soon: rewards.filter(r => r.status === 'coming_soon').length,
  }

  const filters: { key: Filter; label: string; icon?: typeof Gift }[] = [
    { key: 'all', label: 'All Rewards' },
    { key: 'unlocked', label: 'Unlocked' },
    { key: 'locked', label: 'Locked', icon: Lock },
    { key: 'coming_soon', label: 'Coming Soon', icon: Clock },
  ]

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">Redeem Your Points</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              activeFilter === key
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
            }`}
          >
            {label}
            <span
              className={`text-xs px-1.5 py-0.5 rounded-full ${
                activeFilter === key
                  ? 'bg-purple-200 text-purple-700'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {counts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Rewards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mx-auto mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredRewards.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <Gift className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No rewards found</h3>
          <p className="text-gray-500">
            {activeFilter === 'unlocked'
              ? 'Keep earning points to unlock rewards!'
              : 'Check back later for new rewards.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRewards.map((reward) => (
            <RewardCard
              key={reward.id}
              reward={reward}
              isUnlocked={totalPoints >= reward.points_cost}
              userPoints={totalPoints}
            />
          ))}
        </div>
      )}
    </div>
  )
}
