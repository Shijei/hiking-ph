'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  post: any
  user: any
  liked: boolean
}

export default function PostCard({ post, user, liked }: Props) {
  const [isLiked, setIsLiked] = useState(liked)
  const [likeCount, setLikeCount] = useState(post.post_likes[0]?.count ?? 0)
  const [showComments, setShowComments] = useState(false)
  const [comments, setComments] = useState<any[]>([])
  const [commentBody, setCommentBody] = useState('')
  const [loadingComment, setLoadingComment] = useState(false)
  const [loadingLike, setLoadingLike] = useState(false)
  const router = useRouter()

  const handleLike = async () => {
    if (!user) return
    setLoadingLike(true)
    const supabase = createClient()

    if (isLiked) {
      await supabase
        .from('post_likes')
        .delete()
        .eq('post_id', post.id)
        .eq('user_id', user.id)
      setIsLiked(false)
      setLikeCount((c: number) => c - 1)
    } else {
      await supabase
        .from('post_likes')
        .insert({ post_id: post.id, user_id: user.id })
      setIsLiked(true)
      setLikeCount((c: number) => c + 1)
    }
    setLoadingLike(false)
  }

  const loadComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(full_name)')
      .eq('post_id', post.id)
      .order('created_at', { ascending: true })
    setComments(data ?? [])
  }

  const handleToggleComments = async () => {
    if (!showComments) await loadComments()
    setShowComments(!showComments)
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentBody.trim() || !user) return
    setLoadingComment(true)

    const supabase = createClient()
    await supabase.from('post_comments').insert({
      post_id: post.id,
      user_id: user.id,
      body: commentBody,
    })

    setCommentBody('')
    await loadComments()
    setLoadingComment(false)
    router.refresh()
  }

  return (
    <div className="border rounded-xl p-5">
      <div className="flex items-center gap-2 mb-2">
        {post.profiles?.avatar_url && (
          <img
            src={post.profiles.avatar_url}
            alt={post.profiles?.full_name ?? 'User'}
            className="w-7 h-7 rounded-full"
          />
        )}
        <div>
          <p className="text-sm font-medium">{post.profiles?.full_name ?? 'Anonymous'}</p>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString('en-PH', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <p className="text-gray-800 mb-4">{post.body}</p>

      <div className="flex gap-4 text-sm">
        <button
          onClick={handleLike}
          disabled={!user || loadingLike}
          className={`flex items-center gap-1 transition ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          } disabled:opacity-40`}
        >
          {isLiked ? '❤️' : '🤍'} {likeCount}
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1 text-gray-400 hover:text-gray-600 transition"
        >
          💬 {post.post_comments[0]?.count ?? 0}
        </button>
      </div>

      {showComments && (
        <div className="mt-4 border-t pt-4">
          {comments.length > 0 ? (
            <div className="grid gap-3 mb-4">
              {comments.map((comment) => (
              <div key={comment.id} className="text-sm">
                <p className="font-medium text-xs text-gray-600 mb-0.5">
                  {comment.profiles?.full_name ?? 'Anonymous'}
                </p>
                <p className="text-gray-800">{comment.body}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(comment.created_at).toLocaleDateString('en-PH', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-4">No comments yet.</p>
          )}

          {user && (
            <form onSubmit={handleComment} className="flex gap-2">
              <input
                type="text"
                value={commentBody}
                onChange={(e) => setCommentBody(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 border rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                disabled={loadingComment || !commentBody.trim()}
                className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loadingComment ? '...' : 'Send'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  )
}