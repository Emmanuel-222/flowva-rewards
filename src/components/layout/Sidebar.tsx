import { NavLink } from 'react-router-dom'
import {
  Home,
  Compass,
  Library,
  Layers,
  CreditCard,
  Gift,
  Settings,
  X,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { icon: Home, label: 'Home', path: '/home' },
  { icon: Compass, label: 'Discover', path: '/discover' },
  { icon: Library, label: 'Library', path: '/library' },
  { icon: Layers, label: 'Tech Stack', path: '/tech-stack' },
  { icon: CreditCard, label: 'Subscriptions', path: '/subscriptions' },
  { icon: Gift, label: 'Rewards Hub', path: '/rewards' },
]

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth()

  return (
    <aside className={`
      fixed left-0 top-0 bottom-0 w-[240px] bg-white border-r border-gray-100 flex flex-col z-50
      transform transition-transform duration-300 ease-in-out
      lg:translate-x-0
      ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Logo */}
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-full"></div>
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-orange-400 rounded-full"></div>
            <div className="absolute -top-1.5 left-1/2 w-1.5 h-1.5 bg-orange-400 rounded-full"></div>
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-400 bg-clip-text text-transparent">
            Flowva
          </span>
        </div>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 hover:bg-gray-100 rounded-lg"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </NavLink>
        ))}

        <div className="pt-4">
          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-purple-100 text-purple-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </NavLink>
        </div>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
            {profile?.display_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {profile?.display_name || 'User'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {profile?.email}
            </p>
          </div>
        </div>
        <button
          onClick={() => signOut()}
          className="mt-3 w-full text-sm text-gray-500 hover:text-gray-700 transition-colors text-left"
        >
          Sign out
        </button>
      </div>
    </aside>
  )
}
