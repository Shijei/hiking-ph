'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, Heart, ChatCircle, Star, Mountains } from '@phosphor-icons/react'

interface Notification {
  id: string
  actor_id: string | null
  type: string
  reference_id: string
  message: string
  read: boolean
  created_at: string
  actor?: { username: string; avatar_url: string | null }
}

function getRelativeTime(dateStr: string) {
  const now = new Date()
  const date = new Date(dateStr)
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

function NotifTypeIcon({ type }: { type: string }) {
  const base: React.CSSProperties = {
    width: '18px', height: '18px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  }
  switch (type) {
    case 'like':
      return <div style={{ ...base, backgroundColor: '#fee2e2' }}><Heart size={10} weight="fill" color="#ef4444" /></div>
    case 'comment':
      return <div style={{ ...base, backgroundColor: '#dbeafe' }}><ChatCircle size={10} weight="fill" color="#3b82f6" /></div>
    case 'review':
      return <div style={{ ...base, backgroundColor: '#fef3c7' }}><Star size={10} weight="fill" color="#f59e0b" /></div>
    case 'weekly_digest':
      return <div style={{ ...base, backgroundColor: '#d1fae5' }}><Mountains size={10} weight="fill" color="#10b981" /></div>
    default:
      return <div style={{ ...base, backgroundColor: '#f3f4f6' }}><Bell size={10} color="#9ca3af" /></div>
  }
}

function getHref(type: string, referenceId: string) {
  if (type === 'like' || type === 'comment') return `/posts/${referenceId}`
  if (type === 'review') return `/agencies/${referenceId}`
  if (type === 'weekly_digest') return `/mountains/${referenceId}`
  return '/'
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: notifs } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (!notifs?.length) { setLoading(false); return }

      const actorIds = [...new Set(
        notifs.filter(n => n.actor_id).map(n => n.actor_id as string)
      )]

      let actorMap: Record<string, { username: string; avatar_url: string | null }> = {}
      if (actorIds.length > 0) {
        const { data: actors } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', actorIds)
        actorMap = Object.fromEntries(
          (actors ?? []).map(a => [a.id, { username: a.username, avatar_url: a.avatar_url }])
        )
      }

      const enriched = notifs.map(n => ({
        ...n,
        actor: n.actor_id ? actorMap[n.actor_id] : undefined,
      }))

      setNotifications(enriched)
      setLoading(false)

      const unreadIds = notifs.filter(n => !n.read).map(n => n.id)
      if (unreadIds.length > 0) {
        await supabase.from('notifications').update({ read: true }).in('id', unreadIds)
      }
    }

    init()
  }, [router])

  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>←</Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Notifications</h1>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gap: '16px' }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
              <div>
                <div style={{ width: '200px', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '6px' }} />
                <div style={{ width: '70px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '48px 0' }}>
          No notifications yet.
        </p>
      ) : (
        <div>
          {notifications.map((notif, i) => (
            <Link
              key={notif.id}
              href={getHref(notif.type, notif.reference_id)}
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'flex-start',
                textDecoration: 'none',
                color: 'inherit',
                paddingTop: i === 0 ? 0 : '14px',
                paddingBottom: '14px',
                borderBottom: i < notifications.length - 1 ? '1px solid #f3f4f6' : 'none',
                opacity: notif.read ? 0.55 : 1,
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {notif.actor?.avatar_url ? (
                  <img
                    src={notif.actor.avatar_url}
                    alt=""
                    style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    backgroundColor: '#f3f4f6',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Bell size={18} color="#9ca3af" />
                  </div>
                )}
                <div style={{
                  position: 'absolute', bottom: '-1px', right: '-1px',
                  boxShadow: '0 0 0 2px #faf7f2',
                  borderRadius: '50%',
                }}>
                  <NotifTypeIcon type={notif.type} />
                </div>
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '13px', color: '#111827', lineHeight: 1.5 }}>
                  {notif.actor && (
                    <span style={{ fontWeight: 600 }}>@{notif.actor.username} </span>
                  )}
                  {notif.message}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                  {getRelativeTime(notif.created_at)}
                </p>
              </div>

              {!notif.read && (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  backgroundColor: '#3b82f6', flexShrink: 0, marginTop: '5px',
                }} />
              )}
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}