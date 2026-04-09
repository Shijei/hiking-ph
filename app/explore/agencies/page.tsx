'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowRight, FunnelSimple, SortAscending } from '@phosphor-icons/react'
import { useEffect } from 'react'

interface Agency {
  id: string
  name: string
  description: string
  regions: string[]
  price_range: string
  reviews: { rating: number }[]
  avgRating: number
  reviewCount: number
}

export default function AgenciesPage() {
  const [agencies, setAgencies] = useState<Agency[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'newest'>('newest')
  const [regionFilter, setRegionFilter] = useState('All')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchAgencies = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('agencies')
        .select('*, reviews(rating)')
        .eq('status', 'approved')
        .order('created_at', { ascending: false })

      const withRatings = (data ?? []).map((agency: any) => {
        const ratings = agency.reviews?.map((r: any) => r.rating) ?? []
        const avg = ratings.length > 0
          ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
          : 0
        return { ...agency, avgRating: avg, reviewCount: ratings.length }
      })

      setAgencies(withRatings)
      setLoading(false)
    }

    fetchAgencies()
  }, [])

  const allRegions = useMemo(() => {
    const regionSet = new Set<string>()
    agencies.forEach(a => a.regions?.forEach(r => regionSet.add(r)))
    return ['All', ...Array.from(regionSet).sort()]
  }, [agencies])

  const filtered = useMemo(() => {
    let result = [...agencies]

    if (regionFilter !== 'All') {
      result = result.filter(a => a.regions?.includes(regionFilter))
    }

    if (sortBy === 'rating') {
      result.sort((a, b) => b.avgRating - a.avgRating)
    } else if (sortBy === 'reviews') {
      result.sort((a, b) => b.reviewCount - a.reviewCount)
    }
    // 'newest' keeps the default created_at desc order

    return result
  }, [agencies, sortBy, regionFilter])

  return (
    <main style={{ padding: '24px 16px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <Link href="/explore" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>←</Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', flex: 1 }}>Agencies</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '12px', color: showFilters ? '#111827' : '#9ca3af',
            background: 'none', border: showFilters ? '1px solid #111827' : '1px solid #e5e7eb',
            borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <FunnelSimple size={13} weight={showFilters ? 'fill' : 'regular'} />
          Filter
        </button>
      </div>

      {/* Filter/Sort Panel */}
      {showFilters && (
        <div style={{
          backgroundColor: '#ffffff', borderRadius: '14px', padding: '14px 16px',
          marginBottom: '16px', border: '1px solid #f3f4f6',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Sort */}
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Sort by
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {(['newest', 'rating', 'reviews'] as const).map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  style={{
                    fontSize: '12px', fontWeight: 500,
                    padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: sortBy === option ? '1px solid #111827' : '1px solid #e5e7eb',
                    backgroundColor: sortBy === option ? '#111827' : '#ffffff',
                    color: sortBy === option ? '#ffffff' : '#6b7280',
                    fontFamily: 'inherit',
                  }}
                >
                  {option === 'newest' ? 'Newest' : option === 'rating' ? 'Top Rated' : 'Most Reviewed'}
                </button>
              ))}
            </div>
          </div>

          {/* Region filter */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Region
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {allRegions.map(region => (
                <button
                  key={region}
                  onClick={() => setRegionFilter(region)}
                  style={{
                    fontSize: '12px', fontWeight: 500,
                    padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: regionFilter === region ? '1px solid #111827' : '1px solid #e5e7eb',
                    backgroundColor: regionFilter === region ? '#111827' : '#ffffff',
                    color: regionFilter === region ? '#ffffff' : '#6b7280',
                    fontFamily: 'inherit',
                  }}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Count */}
      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
        {loading ? 'Loading...' : `${filtered.length} ${filtered.length === 1 ? 'agency' : 'agencies'}`}
        {regionFilter !== 'All' && ` in ${regionFilter}`}
      </p>

      {/* List */}
      <div>
        {loading ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ height: '72px', backgroundColor: '#f3f4f6', borderRadius: '12px' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
            No agencies found.
          </p>
        ) : (
          filtered.map((agency, index) => (
            <Link
              key={agency.id}
              href={`/agencies/${agency.id}`}
              style={{
                display: 'block', textDecoration: 'none', color: 'inherit',
                paddingTop: index === 0 ? 0 : '16px',
                paddingBottom: '16px',
                borderBottom: index < filtered.length - 1 ? '1px solid #f3f4f6' : 'none',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600, marginBottom: '3px' }}>{agency.name}</p>
                  <p style={{
                    fontSize: '13px', color: '#6b7280', marginBottom: '6px', lineHeight: 1.4,
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                  }}>
                    {agency.description}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {agency.regions?.join(', ')} · {agency.price_range}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {agency.avgRating > 0 ? agency.avgRating.toFixed(1) : '—'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                    {agency.reviewCount} {agency.reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </main>
  )
}