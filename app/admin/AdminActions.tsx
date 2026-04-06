'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface Props {
  agencyId: string
}

export default function AdminActions({ agencyId }: Props) {
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const router = useRouter()

  const handleAction = async (action: 'approved' | 'rejected') => {
    setLoading(action === 'approved' ? 'approve' : 'reject')
    const supabase = createClient()

    await supabase
      .from('agencies')
      .update({ status: action })
      .eq('id', agencyId)

    setLoading(null)
    router.refresh()
  }

  return (
    <div style={{ display: 'flex', gap: '8px' }}>
      <button
        onClick={() => handleAction('approved')}
        disabled={loading !== null}
        style={{
          backgroundColor: '#111827',
          color: '#ffffff',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
          border: 'none',
          cursor: 'pointer',
          opacity: loading !== null ? 0.5 : 1,
          fontFamily: 'inherit',
        }}
      >
        {loading === 'approve' ? 'Approving...' : 'Approve'}
      </button>
      <button
        onClick={() => handleAction('rejected')}
        disabled={loading !== null}
        style={{
          backgroundColor: '#ffffff',
          color: '#ef4444',
          padding: '8px 16px',
          borderRadius: '10px',
          fontSize: '13px',
          fontWeight: 500,
          border: '1px solid #fca5a5',
          cursor: 'pointer',
          opacity: loading !== null ? 0.5 : 1,
          fontFamily: 'inherit',
        }}
      >
        {loading === 'reject' ? 'Rejecting...' : 'Reject'}
      </button>
    </div>
  )
}