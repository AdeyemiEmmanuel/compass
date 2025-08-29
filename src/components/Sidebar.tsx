'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', icon: '🏠', label: 'Home' },
  { href: '/resources', icon: '📁', label: 'Resources' },
  { href: '/opportunities', icon: '🎯', label: 'Opportunities' },
  { href: '/companies', icon: '🏢', label: 'Companies' },
  { href: '/peer-help', icon: '🤝', label: 'Peer Help' },
  { href: '/events', icon: '🎉', label: 'Events' },
  { href: '/ask-ai', icon: '🤖', label: 'Ask AI' },
  { href: '/profile', icon: '👤', label: 'Profile' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <nav className="w-52 bg-white border-r border-gray-200 fixed h-full overflow-y-auto">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🧭</span>
          <span className="text-xl font-bold text-slate-800">Compass</span>
        </div>
        
        <div className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-slate-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
