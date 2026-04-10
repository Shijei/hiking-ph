import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

interface Props {
  mountainId: string
}

type PostItem = {
  type: 'post'
  id: string
  created_at: string
  body: string
  image_url: string | null
  profiles: { username: string; avatar_url: string | null } | null
}

type ConquestItem = {
  type: 'conquest'
  id: string
  conquered_at: string
  photo_url: string
  profiles: { username: string; avatar_url: string | null } | null
}

type FeedItem = PostItem | ConquestItem

/**
 * Bento grid pattern — repeats every 8 items:
 *
 *  Row 1: [       Wide (item 0)        ]  ← gridColumn: 1/-1
 *  Row 2: [ Tall (item 1) ] [ Sq (2)   ]  ← item 1 gridRow: span 2
 *  Row 3: [ Tall (item 1) ] [ Sq (3)   ]
 *  Row 4: [       Wide (item 4)        ]
 *  Row 5: [ Sq (5) ] [ Tall (item 6)   ]  ← item 6 gridRow: span 2
 *  Row 6: [ Sq (7) ] [ Tall (item 6)   ]
 */
function getItemGridStyle(index: number): React.CSSProperties {
  const pos = index % 8
  switch (pos) {
    case 0: return { gridColumn: '1 / -1' }
    case 1: return { gridRow: 'span 2' }
    case 2: return {}
    case 3: return {}
    case 4: return { gridColumn: '1 / -1' }
    case 5: return {}
    case 6: return { gridRow: 'span 2' }
    case 7: return {}
    default: return {}
  }
}

function AuthorOverlay({ username, avatarUrl, badge }: { username: string; avatarUrl: string | null; badge?: string }) {
  return (
    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {avatarUrl && (
          <img src={avatarUrl} alt="" style={{ width: '18px', height: '18px', borderRadius: '50%', objectFit: 'cover' }} />
        )}
        <p style={{ fontSize: '12px', color: '#ffffff', fontWeight: 500 }}>@{username}</p>
        {badge && (
          <span style={{ fontSize: '10px', backgroundColor: 'rgba(255,255,255,0.18)', color: '#ffffff', padding: '1px 7px', borderRadius: '20px', fontWeight: 500 }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  )
}

export default async function MountainFeed({ mountainId }: Props) {
  const supabase = await createClient()

  const [{ data: posts }, { data: conquests }] = await Promise.all([
    supabase
      .from('posts')
      .select('id, body, image_url, created_at, profiles(username, avatar_url)')
      .eq('mountain_id', mountainId)
      .order('created_at', { ascending: false })
      .limit(30),
    supabase
      .from('conquests')
      .select('id, photo_url, conquered_at, profiles(username, avatar_url)')
      .eq('mountain_id', mountainId)
      .not('photo_url', 'is', null)
      .order('conquered_at', { ascending: false })
      .limit(30),
  ])

  const items: FeedItem[] = [
    ...(posts ?? []).map((p): PostItem => ({
      type: 'post',
      id: p.id,
      created_at: p.created_at,
      body: p.body,
      image_url: p.image_url,
      profiles: p.profiles as any,
    })),
    ...(conquests ?? []).map((c): ConquestItem => ({
      type: 'conquest',
      id: c.id,
      conquered_at: c.conquered_at,
      photo_url: c.photo_url,
      profiles: c.profiles as any,
    })),
  ].sort((a, b) => {
    const aDate = a.type === 'post' ? a.created_at : a.conquered_at
    const bDate = b.type === 'post' ? b.created_at : b.conquered_at
    return new Date(bDate).getTime() - new Date(aDate).getTime()
  })

  if (items.length === 0) {
    return (
      <div style={{ padding: '20px 0', textAlign: 'center' }}>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>No community posts yet.</p>
      </div>
    )
  }

  // Separate visual items (have an image) from text-only posts
  // Text-only posts rendered as full-width cards below the grid
  const visualItems = items.filter(i => i.type === 'conquest' || (i.type === 'post' && i.image_url))
  const textItems = items.filter(i => i.type === 'post' && !i.image_url)

  return (
    <div>
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Community ({items.length})
      </p>

      {/* Bento grid — visual items only */}
      {visualItems.length > 0 && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gridAutoRows: '150px',
            gridAutoFlow: 'row dense',
            gap: '6px',
            marginBottom: textItems.length > 0 ? '8px' : '0',
          }}
        >
          {visualItems.map((item, index) => {
            const gridStyle = getItemGridStyle(index)

            if (item.type === 'conquest') {
              return (
                <Link
                  key={`conquest-${item.id}`}
                  href={`/profile/${item.profiles?.username}`}
                  style={{
                    ...gridStyle,
                    display: 'block',
                    position: 'relative',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    textDecoration: 'none',
                  }}
                >
                  <img
                    src={item.photo_url}
                    alt="Summit photo"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <AuthorOverlay
                    username={item.profiles?.username ?? ''}
                    avatarUrl={item.profiles?.avatar_url ?? null}
                    badge="Summit"
                  />
                </Link>
              )
            }

            // Post with image
            return (
              <Link
                key={`post-${item.id}`}
                href={`/posts/${item.id}`}
                style={{
                  ...gridStyle,
                  display: 'block',
                  position: 'relative',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  textDecoration: 'none',
                }}
              >
                <img
                  src={item.image_url!}
                  alt="Post"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
                <AuthorOverlay
                  username={item.profiles?.username ?? ''}
                  avatarUrl={item.profiles?.avatar_url ?? null}
                />
              </Link>
            )
          })}
        </div>
      )}

      {/* Text-only posts — full width cards */}
      {textItems.length > 0 && (
        <div style={{ display: 'grid', gap: '6px' }}>
          {textItems.map((item) => {
            if (item.type !== 'post') return null
            return (
              <Link
                key={`post-text-${item.id}`}
                href={`/posts/${item.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '14px 16px', border: '1px solid #f3f4f6' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '7px' }}>
                    {item.profiles?.avatar_url && (
                      <img src={item.profiles.avatar_url} alt="" style={{ width: '22px', height: '22px', borderRadius: '50%', objectFit: 'cover' }} />
                    )}
                    <p style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>@{item.profiles?.username}</p>
                  </div>
                  <p style={{
                    fontSize: '13px',
                    color: '#374151',
                    lineHeight: 1.5,
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {item.body}
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}