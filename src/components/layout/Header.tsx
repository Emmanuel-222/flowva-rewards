import { Bell } from 'lucide-react'

export default function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6">
      <button className="relative p-2 hover:bg-gray-100 rounded-full transition-colors">
        <Bell className="w-5 h-5 text-gray-600" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
      </button>
    </header>
  )
}
