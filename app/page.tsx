import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostForm from './feed/PostForm'
import PostCard from './feed/PostCard'
import TrailPulseStrip from './feed/TrailPulseStrip'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import NotificationBell from '@/components/NotificationBell'
import WeeklyDigestChecker from './feed/WeeklyDigestChecker'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: posts, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(full_name, avatar_url, username),
      mountains(name, elevation),
      post_likes(count),
      post_comments(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="p-10 text-red-500">Error: {error.message}</p>
  }

  const userLikes = user
    ? await supabase.from('post_likes').select('post_id').eq('user_id', user.id)
    : { data: [] }

  const likedPostIds = new Set(userLikes.data?.map((l) => l.post_id))

  // Trail Pulse: mountains with recent post activity (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: recentTaggedPosts } = await supabase
    .from('posts')
    .select('mountain_id, mountains(id, name, elevation)')
    .not('mountain_id', 'is', null)
    .gte('created_at', sevenDaysAgo)

  // Group by mountain and count posts
  const mountainActivityMap = new Map<string, { id: string; name: string; elevation: number; postCount: number }>()

  recentTaggedPosts?.forEach((post: any) => {
    if (!post.mountain_id || !post.mountains) return
    const existing = mountainActivityMap.get(post.mountain_id)
    if (existing) {
      existing.postCount += 1
    } else {
      mountainActivityMap.set(post.mountain_id, {
        id: post.mountains.id,
        name: post.mountains.name,
        elevation: post.mountains.elevation,
        postCount: 1,
      })
    }
  })

  const pulseMountains = Array.from(mountainActivityMap.values())
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 8)

  // Conquered mountain IDs for current user
  const conqueredIds = new Set<string>()
  if (user && pulseMountains.length > 0) {
    const pulseIds = pulseMountains.map(m => m.id)
    const { data: conquests } = await supabase
      .from('conquests')
      .select('mountain_id')
      .eq('user_id', user.id)
      .in('mountain_id', pulseIds)
    conquests?.forEach(c => conqueredIds.add(c.mountain_id))
  }

  return (
    <main style={{ padding: '20px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>Community Feed</h1>
          <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>Stories, tips, and adventures from fellow hikers.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
          {user && <NotificationBell userId={user.id} />}
          <Link
            href="/search"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px',
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              flexShrink: 0,
            }}
          >
            <MagnifyingGlass size={17} color="#6b7280" weight="bold" />
          </Link>
        </div>
      </div>

      {user && <WeeklyDigestChecker userId={user.id} />}

      {/* Sticky top area: compose bar + trail pulse */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        backgroundColor: '#FAF7F2',
        paddingTop: '4px',
        paddingBottom: '8px',
      }}>
        {user ? (
          <div style={{ marginBottom: '10px' }}>
            <PostForm userId={user.id} />
          </div>
        ) : (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: '#ffffff',
            borderRadius: '999px',
            padding: '10px 16px',
            marginBottom: '10px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
            border: '1px solid #f0f0f0',
          }}>
            <p style={{ fontSize: '13px', color: '#9ca3af', flex: 1 }}>Share a hike, tip, or story...</p>
            <Link
              href="/login"
              style={{
                fontSize: '12px', fontWeight: 500,
                backgroundColor: '#111827', color: '#ffffff',
                padding: '5px 12px', borderRadius: '999px',
                textDecoration: 'none', flexShrink: 0,
              }}
            >
              Sign in
            </Link>
          </div>
        )}

        <TrailPulseStrip mountains={pulseMountains} conqueredIds={conqueredIds} />
      </div>

      {/* Posts */}
      <div style={{ display: 'grid', gap: '0', marginTop: '4px' }}>
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} user={user} liked={likedPostIds.has(post.id)} />
          ))
        ) : (
          <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
            No posts yet. Be the first to share something!
          </p>
        )}
      </div>
    </main>
  )
}