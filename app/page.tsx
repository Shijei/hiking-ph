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
    ? await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
    : { data: [] }

  const likedPostIds = new Set(userLikes.data?.map((l) => l.post_id))

  return (
    <main className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">🌿 Community Feed</h1>
        <p className="text-sm text-gray-500">Stories, tips, and adventures from fellow hikers.</p>
      </div>

      {user ? (
        <PostForm userId={user.id} />
      ) : (
        <div className="border rounded-xl p-5 text-center mb-6 bg-white">
          <p className="text-gray-500 mb-3">Sign in to post in the community.</p>
          <Link
            href="/login"
            className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition"
          >
            Sign in
          </Link>
        </div>
      )}

      <div className="grid gap-4 mt-4">
        {posts && posts.length > 0 ? (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              liked={likedPostIds.has(post.id)}
            />
          ))
        ) : (
          <p className="text-gray-400 text-center py-10">
            No posts yet. Be the first to share something!
          </p>
        )}
      </div>
    </main>
  )
}