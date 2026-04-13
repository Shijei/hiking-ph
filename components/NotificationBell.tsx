'use client'

import { useEffect, useState, useCallback } from 'react'
import { Bell } from '@phosphor-icons/react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function NotificationBell({ userId }: { userId: string }) {
  const [unreadCount, setUnreadCount] = useState(0)

  const fetchUnread = useCallback(async () => {
    const supabase = createClient()
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)
    setUnreadCount(count ?? 0)
  }, [userId])

  useEffect(() => {
    fetchUnread()
    const interval = setInterval(fetchUnread, 2000)
    return () => clearInterval(interval)
  }, [fetchUnread])

  return (
    <Link
      href="/notifications"
      style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '36px',
        height: '36px',
        backgroundColor: '#ffffff',
        border: '1px solid #e5e7eb',
        borderRadius: '10px',
        flexShrink: 0,
      }}
    >
      <Bell size={17} color="#6b7280" weight={unreadCount > 0 ? 'fill' : 'regular'} />
      {unreadCount > 0 && (
        <span style={{
          position: 'absolute',
          top: '-5px',
          right: '-5px',
          backgroundColor: '#ef4444',
          color: '#ffffff',
          fontSize: '9px',
          fontWeight: 700,
          minWidth: '16px',
          height: '16px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 3px',
          lineHeight: 1,
          boxShadow: '0 0 0 2px #faf7f2',
        }}>
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </Link>
  )
}