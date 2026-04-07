import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import PostForm from './feed/PostForm'
import PostCard from './feed/PostCard'

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

  return (
    <main style={{ padding: '20px 20px' }}>
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '-0.01em' }}>Community Feed</h1>
        <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>Stories, tips, and adventures from fellow hikers.</p>
      </div>

      <div style={{ position: 'sticky', top: 0, zIndex: 10, backgroundColor: '#FAF7F2', paddingBottom: '8px' }}>
        {user ? (
          <PostForm userId={user.id} />
        ) : (
          <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '20px', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>Sign in to post in the community.</p>
            <Link href="/login" style={{ backgroundColor: '#111827', color: '#ffffff', padding: '8px 16px', borderRadius: '12px', fontSize: '14px', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gap: '0', marginTop: '8px' }}>
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