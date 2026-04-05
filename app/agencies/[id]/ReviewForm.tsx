'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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

    const { error } = await supabase.from('reviews').insert({
      agency_id: agencyId,
      user_id: userId,
      rating,
      body,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setBody('')
    setRating(5)
    setLoading(false)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="border rounded-xl p-5">
      <h3 className="text-lg font-semibold mb-4">Write a Review</h3>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Rating</label>
        <select
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="border rounded-lg px-3 py-2 text-sm w-full"
        >
          <option value={5}>5 - Excellent</option>
          <option value={4}>4 - Good</option>
          <option value={3}>3 - Average</option>
          <option value={2}>2 - Poor</option>
          <option value={1}>1 - Terrible</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 mb-1">Your Review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={4}
          placeholder="Share your experience with this agency..."
          className="border rounded-lg px-3 py-2 text-sm w-full resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="bg-black text-white px-5 py-2 rounded-xl text-sm hover:bg-gray-800 transition disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  )
}