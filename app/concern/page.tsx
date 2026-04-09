'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ConcernPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', user.id)
        .single()

      setEmail(user.email ?? '')
      setName(profile?.full_name || profile?.username || '')
      setPageLoading(false)
    }
    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const { error: insertError } = await supabase
      .from('concerns')
      .insert({ name, email, message })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (pageLoading) {
    return <main style={{ padding: '24px 16px' }}><p style={{ fontSize: '14px', color: '#9ca3af' }}>Loading...</p></main>
  }

  if (success) {
    return (
      <main style={{ padding: '24px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Message Sent</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>
          We received your concern and will get back to you shortly.
        </p>
        <Link
          href="/profile"
          style={{ backgroundColor: '#111827', color: '#ffffff', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', textDecoration: 'none' }}
        >
          Back to Profile
        </Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '24px 16px' }}>
      <Link href="/profile" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        Back
      </Link>

      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
        Send a Concern
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
        Got a question, report, or feedback? We are listening.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Name</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Email</p>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Message *</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your concern..."
            rows={5}
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit', resize: 'none' }}
          />
        </div>

        {error && <p style={{ fontSize: '13px', color: '#ef4444' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#111827', color: '#ffffff', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}
        >
          {loading ? 'Sending...' : 'Send Concern'}
        </button>

      </form>
    </main>
  )
}