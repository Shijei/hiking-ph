'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  userId: string
}

export default function PostForm({ userId }: Props) {
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)

    const supabase = createClient()
    await supabase.from('posts').insert({ user_id: userId, body })

    setBody('')
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5 mb-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        placeholder="Share a hiking story, tip, or question..."
        className="w-full text-sm border rounded-lg px-3 py-2 resize-none mb-3"
      />
      <button
        type="submit"
        disabled={loading || !body.trim()}
        className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}