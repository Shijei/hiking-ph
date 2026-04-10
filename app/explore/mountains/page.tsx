'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Mountains, FunnelSimple, SortAscending, SortDescending, Fire } from '@phosphor-icons/react'

interface Mountain {
  id: string
  name: string
  elevation: number
  island_group: string
  provinces: string[]
  is_volcano: boolean
}

type SortOrder = 'elevation_desc' | 'elevation_asc' | 'name_asc'

const ISLAND_GROUPS = ['All', 'Luzon', 'Visayas', 'Mindanao']

export default function MountainsExplorePage() {
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [islandFilter, setIslandFilter] = useState('All')
  const [volcanoOnly, setVolcanoOnly] = useState(false)
  const [sortOrder, setSortOrder] = useState<SortOrder>('elevation_desc')

  useEffect(() => {
    const fetch = async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('mountains')
        .select('id, name, elevation, island_group, provinces, is_volcano')
        .order('elevation', { ascending: false })
      setMountains(data ?? [])
      setLoading(false)
    }
    fetch()
  }, [])

  const filtered = useMemo(() => {
    let result = [...mountains]

    if (islandFilter !== 'All') {
      result = result.filter(m => m.island_group === islandFilter)
    }

    if (volcanoOnly) {
      result = result.filter(m => m.is_volcano)
    }

    if (sortOrder === 'elevation_asc') {
      result.sort((a, b) => a.elevation - b.elevation)
    } else if (sortOrder === 'elevation_desc') {
      result.sort((a, b) => b.elevation - a.elevation)
    } else if (sortOrder === 'name_asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    }

    return result
  }, [mountains, islandFilter, volcanoOnly, sortOrder])

  const activeFilterCount = (islandFilter !== 'All' ? 1 : 0) + (volcanoOnly ? 1 : 0)

  return (
    <main style={{ padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Link href="/explore" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>←</Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', flex: 1 }}>Mountains</h1>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            fontSize: '12px',
            color: showFilters || activeFilterCount > 0 ? '#111827' : '#9ca3af',
            background: 'none',
            border: showFilters || activeFilterCount > 0 ? '1px solid #111827' : '1px solid #e5e7eb',
            borderRadius: '8px', padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          <FunnelSimple size={13} weight={activeFilterCount > 0 ? 'fill' : 'regular'} />
          Filter{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
        </button>
      </div>

      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '16px' }}>
        {loading ? 'Loading...' : `${filtered.length} of ${mountains.length} mountains`}
      </p>

      {/* Filter Panel */}
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
              {([
                { value: 'elevation_desc', label: 'Highest First' },
                { value: 'elevation_asc', label: 'Lowest First' },
                { value: 'name_asc', label: 'A–Z' },
              ] as { value: SortOrder; label: string }[]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setSortOrder(opt.value)}
                  style={{
                    fontSize: '12px', fontWeight: 500,
                    padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: sortOrder === opt.value ? '1px solid #111827' : '1px solid #e5e7eb',
                    backgroundColor: sortOrder === opt.value ? '#111827' : '#ffffff',
                    color: sortOrder === opt.value ? '#ffffff' : '#6b7280',
                    fontFamily: 'inherit',
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Island Group */}
          <div style={{ marginBottom: '14px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Island Group
            </p>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {ISLAND_GROUPS.map(group => (
                <button
                  key={group}
                  onClick={() => setIslandFilter(group)}
                  style={{
                    fontSize: '12px', fontWeight: 500,
                    padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                    border: islandFilter === group ? '1px solid #111827' : '1px solid #e5e7eb',
                    backgroundColor: islandFilter === group ? '#111827' : '#ffffff',
                    color: islandFilter === group ? '#ffffff' : '#6b7280',
                    fontFamily: 'inherit',
                  }}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>

          {/* Volcano Toggle */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '8px' }}>
              Type
            </p>
            <button
              onClick={() => setVolcanoOnly(!volcanoOnly)}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                fontSize: '12px', fontWeight: 500,
                padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
                border: volcanoOnly ? '1px solid #ef4444' : '1px solid #e5e7eb',
                backgroundColor: volcanoOnly ? '#fef2f2' : '#ffffff',
                color: volcanoOnly ? '#ef4444' : '#6b7280',
                fontFamily: 'inherit',
              }}
            >
              <Fire size={12} weight={volcanoOnly ? 'fill' : 'regular'} />
              Volcanoes only
            </button>
          </div>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} style={{ aspectRatio: '1 / 1', backgroundColor: '#f3f4f6', borderRadius: '14px' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p style={{ fontSize: '14px', color: '#9ca3af', textAlign: 'center', padding: '40px 0' }}>
          No mountains match your filters.
        </p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {filtered.map((mountain) => (
            <Link
              key={mountain.id}
              href={`/mountains/${mountain.id}`}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#ffffff', borderRadius: '14px', aspectRatio: '1 / 1',
                textDecoration: 'none', color: 'inherit', padding: '8px', position: 'relative',
              }}
            >
              {mountain.is_volcano && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  fontSize: '9px', backgroundColor: '#fee2e2', color: '#ef4444',
                  padding: '1px 5px', borderRadius: '20px', fontWeight: 600,
                }}>
                  V
                </span>
              )}
              <Mountains size={26} weight="duotone" style={{ color: '#6b7280', marginBottom: '6px' }} />
              <p style={{
                fontSize: '11px', fontWeight: 500, textAlign: 'center', lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box',
                WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {mountain.name.replace(/^Mount\s+/i, 'Mt. ')}
              </p>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>{mountain.elevation}m</p>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}