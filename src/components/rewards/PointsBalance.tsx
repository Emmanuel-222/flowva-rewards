import { useQuery } from '@tanstack/react-query'
import { Star, Gift } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

// Reward tiers for progress tracking
const REWARD_TIERS = [
  { points: 5000, label: '$5 Gift Card' },
  { points: 10000, label: '$10 Gift Card' },
  { points: 25000, label: '$25 Gift Card' },
]

export default function PointsBalance() {
  const { user } = useAuth()

  const { data: totalPoints = 0, isLoading } = useQuery({
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

  // Find next reward tier
  const nextTier = REWARD_TIERS.find(tier => totalPoints < tier.points) || REWARD_TIERS[REWARD_TIERS.length - 1]
  const prevTierPoints = REWARD_TIERS.find((_tier, i) => 
    REWARD_TIERS[i + 1]?.points === nextTier.points
  )?.points || 0
  
  const pointsInCurrentTier = totalPoints - prevTierPoints
  const tierRange = nextTier.points - prevTierPoints
  const progressPercent = totalPoints >= nextTier.points 
    ? 100 
    : Math.min((pointsInCurrentTier / tierRange) * 100, 100)
  
  const pointsToNext = Math.max(nextTier.points - totalPoints, 0)

  const getMotivationalText = () => {
    if (totalPoints === 0) return "Start earning points today!"
    if (pointsToNext === 0) return " You can redeem a reward!"
    if (pointsToNext <= 500) return "Almost there! So close!"
    if (pointsToNext <= 2000) return "Great progress! Keep going!"
    return "Keep earning to unlock rewards!"
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-12 w-20 bg-gray-200 rounded mb-4"></div>
        <div className="h-2 w-full bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
        <h3 className="font-semibold text-gray-900">Points Balance</h3>
      </div>

      {/* Points Display */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <span className="text-5xl font-bold text-gray-900">{totalPoints.toLocaleString()}</span>
          <span className="text-gray-400 ml-2">pts</span>
        </div>
        <div className="text-right">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
            <Star className="w-6 h-6 text-white fill-white" />
          </div>
        </div>
      </div>

      {/* Progress Section */}
      <div className="bg-gray-50 rounded-xl p-4 mb-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Next: {nextTier.label}</span>
          </div>
          <span className="text-sm text-purple-600 font-semibold">
            {pointsToNext > 0 ? `${pointsToNext.toLocaleString()} pts to go` : 'Unlocked!'}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        
        {/* Progress Labels */}
        <div className="flex justify-between mt-1">
          <span className="text-xs text-gray-400">{prevTierPoints.toLocaleString()}</span>
          <span className="text-xs text-gray-400">{nextTier.points.toLocaleString()}</span>
        </div>
      </div>

      {/* Motivational Text */}
      <p className="text-sm text-gray-500 flex items-center gap-1">
        <span></span> {getMotivationalText()}
      </p>
    </div>
  )
}
