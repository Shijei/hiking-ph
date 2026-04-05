'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  mountainId: string
  userId: string
  conquered: boolean
}

export default function ConquestButton({ mountainId, userId, conquered }: Props) {
  const [isConquered, setIsConquered] = useState(conquered)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleToggle = async () => {
    setLoading(true)
    const supabase = createClient()

    if (isConquered) {
      await supabase
        .from('conquests')
        .delete()
        .eq('mountain_id', mountainId)
        .eq('user_id', userId)
      setIsConquered(false)
    } else {
      await supabase
        .from('conquests')
        .insert({ mountain_id: mountainId, user_id: userId })
      setIsConquered(true)
    }

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`w-full py-4 rounded-xl text-lg font-semibold transition disabled:opacity-50 ${
        isConquered
          ? 'bg-green-600 text-white hover:bg-green-700'
          : 'bg-black text-white hover:bg-gray-800'
      }`}
    >
      {loading
        ? 'Updating...'
        : isConquered
        ? '✅ Conquered! (click to undo)'
        : '🏔️ I conquered this!'}
    </button>
  )
}