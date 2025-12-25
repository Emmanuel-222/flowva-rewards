import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'

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

  const targetPoints = 5000 // $5 Gift Card threshold
  const progressPercent = Math.min((totalPoints / targetPoints) * 100, 100)

  const getMotivationalText = () => {
    if (totalPoints === 0) return "Start earning points today!"
    if (totalPoints < 100) return "Just getting started — keep earning points!"
    if (totalPoints < 500) return "Great progress! Keep it up!"
    if (totalPoints < 2500) return "You're on fire! Halfway there!"
    if (totalPoints < 5000) return "Almost there! Keep pushing!"
    return "🎉 You can redeem a reward!"
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
        <div className="w-5 h-5 text-purple-600">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        <h3 className="font-semibold text-gray-900">Points Balance</h3>
      </div>

      {/* Points Display */}
      <div className="flex items-end justify-between mb-4">
        <span className="text-5xl font-bold text-gray-900">{totalPoints}</span>
        <Star className="w-10 h-10 text-yellow-400 fill-yellow-400" />
      </div>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Progress to $5 Gift Card</span>
          <span>{totalPoints}/{targetPoints}</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Motivational Text */}
      <p className="text-sm text-gray-500 flex items-center gap-1">
        <span>🎯</span> {getMotivationalText()}
      </p>
    </div>
  )
}
