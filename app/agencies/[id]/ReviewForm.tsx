'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cleanText } from '@/lib/profanity'

interface Props {
  agencyId: string
  userId: string
}

export default function ReviewForm({ agencyId, userId }: Props) {
  const [rating, setRating] = useState(5)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const cleanedBody = await cleanText(body)

    const { error: reviewError } = await supabase.from('reviews').insert({
      agency_id: agencyId,
      user_id: userId,
      rating,
      body: cleanedBody,
    })

    if (reviewError) {
      setError(reviewError.message)
      setLoading(false)
      return
    }

    const { data: agencyData, error: agencyError } = await supabase
      .from('agencies')
      .select('owner_id')
      .eq('id', agencyId)
      .single()

    if (agencyError) {
      console.error('failed to fetch agency owner:', agencyError.message)
    }

    if (agencyData?.owner_id && agencyData.owner_id !== userId) {
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: recentCount, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', agencyData.owner_id)
        .eq('type', 'review')
        .eq('reference_id', agencyId)
        .gte('created_at', oneDayAgo)

      if (countError) {
        console.error('failed to check recent notifications:', countError.message)
      }

      if (!recentCount) {
        const { error: notifError } = await supabase.from('notifications').insert({
          user_id: agencyData.owner_id,
          actor_id: userId,
          type: 'review',
          reference_id: agencyId,
          message: 'reviewed your agency',
        })
        if (notifError) {
          console.error('review notification failed:', notifError.message, notifError.code)
        }
      }
    }

    setBody('')
    setRating(5)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit}>
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Write a Review
      </p>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Rating</p>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
        >
          <option value={5}>5 — Excellent</option>
          <option value={4}>4 — Good</option>
          <option value={3}>3 — Average</option>
          <option value={2}>2 — Poor</option>
          <option value={1}>1 — Terrible</option>
        </select>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>Your Review</p>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          placeholder="Share your experience with this agency..."
          style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit', resize: 'none' }}
        />
      </div>

      {error && <p style={{ fontSize: '13px', color: '#ef4444', marginBottom: '10px' }}>{error}</p>}

      <button
        type="submit"
        disabled={loading}
        style={{ backgroundColor: '#111827', color: '#ffffff', padding: '10px 20px', borderRadius: '10px', fontSize: '13px', border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}