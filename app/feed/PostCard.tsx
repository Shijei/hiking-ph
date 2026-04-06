'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Heart, ChatCircle } from '@phosphor-icons/react'
import Link from 'next/link'

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
    if (!user || loadingLike) return
    setLoadingLike(true)
    const supabase = createClient()

    if (isLiked) {
      await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id)
      setIsLiked(false)
      setLikeCount((c: number) => c - 1)
    } else {
      await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id })
      setIsLiked(true)
      setLikeCount((c: number) => c + 1)
    }
    setLoadingLike(false)
  }

  const loadComments = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('post_comments')
      .select('*, profiles(full_name, username)')
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
    <div style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}>
      {/* Author */}
      <div className="flex items-center gap-2 mb-3">
        {post.profiles?.avatar_url && (
          <img
            src={post.profiles.avatar_url}
            alt=""
            className="w-8 h-8 rounded-full object-cover"
          />
        )}
        <div>
          <Link
            href={`/profile/${post.profiles?.username}`}
            style={{ fontSize: '14px', fontWeight: 500, textDecoration: 'none', color: 'inherit' }}
          >
            @{post.profiles?.username ?? post.profiles?.full_name ?? 'Anonymous'}
          </Link>
          <p className="text-xs text-gray-400">
            {new Date(post.created_at).toLocaleDateString('en-PH', {
              month: 'short', day: 'numeric', year: 'numeric'
            })}
          </p>
        </div>
      </div>

      {/* Body */}
      <p className="text-sm text-gray-800 leading-relaxed mb-3">{post.body}</p>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleLike}
          disabled={!user || loadingLike}
          className={`flex items-center gap-1.5 text-sm transition disabled:opacity-40 ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
          }`}
        >
          <Heart size={16} weight={isLiked ? 'fill' : 'regular'} />
          <span>{likeCount}</span>
        </button>

        <button
          onClick={handleToggleComments}
          className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 transition"
        >
          <ChatCircle size={16} weight={showComments ? 'fill' : 'regular'} />
          <span>{post.post_comments[0]?.count ?? 0}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 border-t pt-4">
          {comments.length > 0 ? (
            <div className="grid gap-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id}>
                  <p className="text-xs font-medium text-gray-600">
                    @{comment.profiles?.username ?? comment.profiles?.full_name ?? 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-800 mt-0.5">{comment.body}</p>
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
                className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm bg-gray-50 focus:outline-none focus:border-gray-400"
              />
              <button
                type="submit"
                disabled={loadingComment || !commentBody.trim()}
                className="bg-gray-900 text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-700 transition disabled:opacity-50"
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