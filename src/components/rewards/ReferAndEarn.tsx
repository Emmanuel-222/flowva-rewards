import { useQuery } from '@tanstack/react-query'
import { Share2, Copy, Facebook, Linkedin } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

export default function ReferAndEarn() {
  const { user, profile } = useAuth()

  const { data: referralStats } = useQuery({
    queryKey: ['referralStats', user?.id],
    queryFn: async () => {
      if (!user) return { count: 0, points: 0 }

      const { data, error } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_id', user.id)
        .eq('status', 'completed')

      if (error) throw error

      return {
        count: data.length,
        points: data.length * 25, // 25 points per referral
      }
    },
    enabled: !!user,
  })

  const referralLink = `https://app.flowvahub.com/signup/?ref=${profile?.referral_code || ''}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    toast.success('Link copied to clipboard!')
  }

  const shareOnSocial = (platform: string) => {
    const text = encodeURIComponent('Join Flowva and start earning rewards! Use my referral link:')
    const url = encodeURIComponent(referralLink)
    
    const urls: Record<string, string> = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`,
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
    }

    window.open(urls[platform], '_blank', 'width=600,height=400')
  }

  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">Refer & Earn</h2>
      </div>

      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-100">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
            <Share2 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Share Your Link</h3>
            <p className="text-sm text-gray-500">
              Invite friends and earn 25 points when they join!
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{referralStats?.count || 0}</p>
            <p className="text-sm text-gray-500">Referrals</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">{referralStats?.points || 0}</p>
            <p className="text-sm text-gray-500">Points Earned</p>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-2">Your personal referral link:</p>
          <div className="flex items-center gap-2 bg-white rounded-xl p-3 border border-gray-200">
            <input
              type="text"
              value={referralLink}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-700 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Copy link"
            >
              <Copy className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Social Share Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => shareOnSocial('facebook')}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors"
          >
            <Facebook className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => shareOnSocial('twitter')}
            className="w-10 h-10 bg-gray-900 hover:bg-gray-800 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </button>
          <button
            onClick={() => shareOnSocial('linkedin')}
            className="w-10 h-10 bg-blue-700 hover:bg-blue-800 rounded-full flex items-center justify-center transition-colors"
          >
            <Linkedin className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => shareOnSocial('whatsapp')}
            className="w-10 h-10 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center transition-colors"
          >
            <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
