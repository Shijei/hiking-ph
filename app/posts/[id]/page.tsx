import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import PostCard from '@/app/feed/PostCard'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function PostDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: post, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles(full_name, avatar_url, username),
      mountains(name, elevation),
      post_likes(count),
      post_comments(count)
    `)
    .eq('id', id)
    .single()

  if (error || !post) return notFound()

  const userLike = user
    ? await supabase
        .from('post_likes')
        .select('post_id')
        .eq('user_id', user.id)
        .eq('post_id', id)
        .single()
    : { data: null }

  const liked = !!userLike.data

  const backHref = post.mountains
    ? `/mountains/${post.mountain_id}`
    : '/'

  return (
    <main style={{ padding: '24px 16px' }}>
      <Link
        href={backHref}
        style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}
      >
        ← Back
      </Link>

      <PostCard post={post} user={user} liked={liked} />
    </main>
  )
}