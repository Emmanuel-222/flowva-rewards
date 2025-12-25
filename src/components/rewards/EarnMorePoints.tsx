import { Star, Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function EarnMorePoints() {
  const handleShare = () => {
    // Placeholder - would integrate with actual share functionality
    toast.success('Share feature coming soon!')
  }

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">Earn More Points</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Refer Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Refer and win 10,000 points!
              </h3>
              <p className="text-sm text-gray-500">
                Invite 3 friends by Nov 20 and earn a chance to be one of 5 winners of{' '}
                <span className="text-purple-600 font-medium">10,000 points</span>.
                Friends must complete onboarding to qualify.
              </p>
            </div>
          </div>
        </div>

        {/* Share Stack Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Share2 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Share Your Stack</h3>
                <p className="text-sm text-gray-500">Earn +25 pts</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-2">Share your tool stack</p>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
