'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Mountains, House, User } from '@phosphor-icons/react'

const tabs = [
  {
    href: '/explore',
    icon: Mountains,
    label: 'Explore',
  },
  {
    href: '/',
    icon: House,
    label: 'Feed',
  },
  {
    href: '/profile',
    icon: User,
    label: 'Profile',
  },
]

export default function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = isActive(tab.href)
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-1 px-6 py-2 transition ${
                active ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <Icon
                size={24}
                weight={active ? 'fill' : 'regular'}
              />
              <span className="text-xs">{tab.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}