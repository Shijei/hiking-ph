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
    <main className="px-4 py-6">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Community Feed</h1>
        <p className="text-sm text-gray-400 mt-0.5">Stories, tips, and adventures from fellow hikers.</p>
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

      <div className="grid gap-3 mt-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post.id} post={post} user={user} liked={likedPostIds.has(post.id)} />
          ))
        ) : (
          <p className="text-gray-400 text-sm text-center py-10">
            No posts yet. Be the first to share something!
          </p>
        )}
      </div>
    </main>
  )
}