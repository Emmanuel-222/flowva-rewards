import { useState } from 'react'
import EarnPointsTab from '../components/rewards/EarnPointsTab'
import RedeemRewardsTab from '../components/rewards/RedeemRewardsTab'

type Tab = 'earn' | 'redeem'

export default function RewardsHub() {
  const [activeTab, setActiveTab] = useState<Tab>('earn')

  return (
    <div className="p-6 lg:p-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rewards Hub</h1>
        <p className="text-gray-500 mt-1">
          Earn points, unlock rewards, and celebrate your progress!
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('earn')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'earn'
              ? 'text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Earn Points
          {activeTab === 'earn' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('redeem')}
          className={`pb-3 px-1 font-medium transition-colors relative ${
            activeTab === 'redeem'
              ? 'text-purple-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Redeem Rewards
          {activeTab === 'redeem' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'earn' ? <EarnPointsTab /> : <RedeemRewardsTab />}
    </div>
  )
}
