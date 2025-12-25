import PointsBalance from './PointsBalance'
import DailyStreak from './DailyStreak'
import SpotlightTool from './SpotlightTool'
import EarnMorePoints from './EarnMorePoints'
import ReferAndEarn from './ReferAndEarn'

export default function EarnPointsTab() {
  return (
    <div>
      {/* Section Header */}
      <div className="flex items-center gap-2 mb-6">
        <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
        <h2 className="text-lg font-semibold text-gray-900">Your Rewards Journey</h2>
      </div>

      {/* Top Row - Points, Streak, Spotlight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <PointsBalance />
        <DailyStreak />
        <SpotlightTool />
      </div>

      {/* Earn More Points Section */}
      <EarnMorePoints />

      {/* Refer & Earn Section */}
      <ReferAndEarn />
    </div>
  )
}
