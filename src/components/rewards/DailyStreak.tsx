import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Calendar, Check } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export default function DailyStreak() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: streakData, isLoading } = useQuery({
    queryKey: ['dailyStreak', user?.id],
    queryFn: async () => {
      if (!user) return null

      const { data, error } = await supabase
        .from('daily_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      return data
    },
    enabled: !!user,
  })

  const today = new Date().toISOString().split('T')[0]
  const hasClaimedToday = streakData?.last_claimed_date === today

  // Get current day of week (0 = Sunday, adjust to Monday = 0)
  const currentDayIndex = (new Date().getDay() + 6) % 7

  const claimMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')

      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Check if we need to reset streak (didn't claim yesterday)
      const isConsecutive = streakData?.last_claimed_date === yesterdayStr
      const newStreak = isConsecutive ? (streakData?.current_streak || 0) + 1 : 1

      // Update or insert streak record
      const { error: streakError } = await supabase
        .from('daily_streaks')
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          last_claimed_date: today,
        })

      if (streakError) throw streakError

      // Add points transaction
      const { error: pointsError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          type: 'streak',
          points_delta: 5,
          description: `Daily streak bonus - Day ${newStreak}`,
        })

      if (pointsError) throw pointsError

      return newStreak
    },
    onSuccess: (newStreak) => {
      toast.success(`+5 points! 🔥 ${newStreak} day streak!`)
      queryClient.invalidateQueries({ queryKey: ['dailyStreak'] })
      queryClient.invalidateQueries({ queryKey: ['totalPoints'] })
    },
    onError: (error) => {
      toast.error('Failed to claim daily bonus')
      console.error(error)
    },
  })

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 animate-pulse">
        <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
        <div className="h-12 w-24 bg-gray-200 rounded mb-4"></div>
        <div className="flex gap-2 mb-4">
          {DAYS.map((_, i) => (
            <div key={i} className="w-8 h-8 bg-gray-200 rounded-full"></div>
          ))}
        </div>
      </div>
    )
  }

  const currentStreak = streakData?.current_streak || 0

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">Daily Streak</h3>
      </div>

      {/* Streak Count */}
      <div className="mb-4">
        <span className="text-5xl font-bold text-purple-600">{currentStreak}</span>
        <span className="text-2xl text-purple-600 ml-1">
          {currentStreak === 1 ? 'day' : 'days'}
        </span>
      </div>

      {/* Week Days */}
      <div className="flex gap-2 mb-4">
        {DAYS.map((day, index) => (
          <div
            key={index}
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
              index === currentDayIndex
                ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                : index < currentDayIndex
                ? 'bg-gray-100 text-gray-400'
                : 'bg-gray-50 text-gray-400'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-500 mb-4">
        Check in daily to to earn +5 points
      </p>

      {/* Claim Button */}
      <button
        onClick={() => claimMutation.mutate()}
        disabled={hasClaimedToday || claimMutation.isPending}
        className={`w-full py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
          hasClaimedToday
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600'
        }`}
      >
        {hasClaimedToday ? (
          <>
            <Check className="w-5 h-5" />
            Claimed Today
          </>
        ) : claimMutation.isPending ? (
          'Claiming...'
        ) : (
          'Claim Today'
        )}
      </button>
    </div>
  )
}
