'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AgencyApplyPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [fbPageUrl, setFbPageUrl] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [regions, setRegions] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [userId, setUserId] = useState('')
  const [alreadyApplied, setAlreadyApplied] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      // Check if they already have an agency application
      const { data: existing } = await supabase
        .from('agencies')
        .select('id, status')
        .eq('owner_id', user.id)
        .single()

      if (existing) setAlreadyApplied(true)
    }
    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!name.trim() || !description.trim() || !priceRange.trim() || !regions.trim()) {
      setError('Please fill in all required fields.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    const regionArray = regions.split(',').map((r) => r.trim()).filter(Boolean)

    const { error: insertError } = await supabase
      .from('agencies')
      .insert({
        name,
        description,
        fb_page_url: fbPageUrl || null,
        price_range: priceRange,
        regions: regionArray,
        owner_id: userId,
        status: 'pending',
      })

    if (insertError) {
      setError(insertError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (alreadyApplied) {
    return (
      <main style={{ padding: '24px 16px' }}>
        <Link href="/profile" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
          ← Back
        </Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Agency Application</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6 }}>
          You have already submitted an agency application. The admin will review it shortly.
        </p>
      </main>
    )
  }

  if (success) {
    return (
      <main style={{ padding: '24px 16px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Application Submitted!</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '20px' }}>
          Your agency has been submitted for review. The admin will approve it shortly. You'll be able to see it listed once approved.
        </p>
        <Link href="/profile" style={{ backgroundColor: '#111827', color: '#ffffff', padding: '10px 20px', borderRadius: '12px', fontSize: '14px', textDecoration: 'none' }}>
          Back to Profile
        </Link>
      </main>
    )
  }

  return (
    <main style={{ padding: '24px 16px' }}>
      <Link href="/profile" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Back
      </Link>

      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '6px' }}>
        Register Your Agency
      </h1>
      <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px', lineHeight: 1.5 }}>
        Leading hikers to the summit? Register your agency and get discovered by the community. We'll review your application before it goes live.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px' }}>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Agency Name *</p>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lakbay Gabay Adventures"
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Description *</p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tell hikers about your agency, what you offer, your experience..."
            rows={4}
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit', resize: 'none' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Facebook Page URL</p>
          <input
            type="url"
            value={fbPageUrl}
            onChange={(e) => setFbPageUrl(e.target.value)}
            placeholder="https://facebook.com/youragency"
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Price Range *</p>
          <input
            type="text"
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            placeholder="e.g. ₱800-₱2000"
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
          />
        </div>

        <div>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '6px', fontWeight: 500 }}>Regions Covered *</p>
          <input
            type="text"
            value={regions}
            onChange={(e) => setRegions(e.target.value)}
            placeholder="e.g. Luzon, Visayas, Mindanao"
            style={{ width: '100%', fontSize: '14px', padding: '10px 12px', border: '1px solid #e5e7eb', borderRadius: '10px', backgroundColor: '#f9fafb', fontFamily: 'inherit' }}
          />
          <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '4px' }}>Separate multiple regions with commas.</p>
        </div>

        {error && <p style={{ fontSize: '13px', color: '#ef4444' }}>{error}</p>}

        <button
          type="submit"
          disabled={loading}
          style={{ backgroundColor: '#111827', color: '#ffffff', padding: '12px 20px', borderRadius: '12px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </button>

      </form>
    </main>
  )
}