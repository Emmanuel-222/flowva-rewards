import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Star, Lock, Clock, CreditCard, Gift } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import type { Reward } from '../../lib/database.types'
import toast from 'react-hot-toast'

interface RewardCardProps {
  reward: Reward
  isUnlocked: boolean
  userPoints: number
}

// Icon mapping for different reward types
const getRewardIcon = (title: string) => {
  if (title.toLowerCase().includes('bank')) {
    return <CreditCard className="w-8 h-8 text-green-500" />
  }
  if (title.toLowerCase().includes('paypal')) {
    return <CreditCard className="w-8 h-8 text-blue-500" />
  }
  if (title.toLowerCase().includes('visa')) {
    return <Gift className="w-8 h-8 text-pink-500" />
  }
  return <Gift className="w-8 h-8 text-purple-500" />
}

export default function RewardCard({ reward, isUnlocked, userPoints }: RewardCardProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const isComingSoon = reward.status === 'coming_soon'

  const redeemMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated')
      if (userPoints < reward.points_cost) throw new Error('Insufficient points')

      // Create redemption record
      const { error: redemptionError } = await supabase
        .from('reward_redemptions')
        .insert({
          user_id: user.id,
          reward_id: reward.id,
          points_spent: reward.points_cost,
          status: 'pending',
        })

      if (redemptionError) throw redemptionError

      // Deduct points
      const { error: pointsError } = await supabase
        .from('point_transactions')
        .insert({
          user_id: user.id,
          type: 'manual',
          points_delta: -reward.points_cost,
          description: `Redeemed: ${reward.title}`,
        })

      if (pointsError) throw pointsError
    },
    onSuccess: () => {
      toast.success(`Successfully redeemed ${reward.title}! 🎉`)
      queryClient.invalidateQueries({ queryKey: ['totalPoints'] })
      queryClient.invalidateQueries({ queryKey: ['rewards'] })
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to redeem reward')
    },
  })

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col">
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center">
          {getRewardIcon(reward.title)}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
        {reward.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-500 text-center mb-4 flex-1">
        {reward.description}
      </p>

      {/* Points Cost */}
      <div className="flex items-center justify-center gap-1 mb-4">
        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
        <span className="font-semibold text-purple-600">
          {reward.points_cost.toLocaleString()} pts
        </span>
      </div>

      {/* Action Button */}
      {isComingSoon ? (
        <button
          disabled
          className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Clock className="w-4 h-4" />
          Coming Soon
        </button>
      ) : isUnlocked ? (
        <button
          onClick={() => redeemMutation.mutate()}
          disabled={redeemMutation.isPending}
          className="w-full py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-purple-500 text-white hover:from-purple-700 hover:to-purple-600 transition-all disabled:opacity-50"
        >
          {redeemMutation.isPending ? 'Redeeming...' : 'Redeem'}
        </button>
      ) : (
        <button
          disabled
          className="w-full py-3 rounded-xl font-medium bg-gray-100 text-gray-400 cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Locked
        </button>
      )}
    </div>
  )
}
