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
    <form
      onSubmit={handleSubmit}
      style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        required
        rows={3}
        placeholder="Share a hiking story, tip, or question..."
        style={{ width: '100%', fontSize: '14px', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 12px', resize: 'none', marginBottom: '10px', fontFamily: 'inherit', backgroundColor: '#f9fafb' }}
      />
      <button
        type="submit"
        disabled={loading || !body.trim()}
        style={{ backgroundColor: '#111827', color: '#ffffff', padding: '8px 20px', borderRadius: '12px', fontSize: '14px', border: 'none', cursor: 'pointer', opacity: loading || !body.trim() ? 0.5 : 1 }}
      >
        {loading ? 'Posting...' : 'Post'}
      </button>
    </form>
  )
}