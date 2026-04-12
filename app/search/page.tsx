'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MagnifyingGlass, X, Mountains, Storefront, User } from '@phosphor-icons/react'

interface Mountain {
  id: string
  name: string
  elevation: number
  island_group: string
}

interface Agency {
  id: string
  name: string
  price_range: string
  regions: string[]
}

interface Profile {
  id: string
  username: string
  full_name: string | null
  avatar_url: string | null
}

interface SearchResults {
  mountains: Mountain[]
  agencies: Agency[]
  profiles: Profile[]
}

interface Suggestions {
  mountains: Mountain[]
  agencies: Agency[]
}

function MountainRow({ mountain, index, total }: { mountain: Mountain; index: number; total: number }) {
  return (
    <Link
      href={`/mountains/${mountain.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        textDecoration: 'none', color: 'inherit',
        paddingTop: index === 0 ? 0 : '12px',
        paddingBottom: '12px',
        borderBottom: index < total - 1 ? '1px solid #f3f4f6' : 'none',
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        backgroundColor: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Mountains size={18} weight="duotone" color="#6b7280" />
      </div>
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>
          {mountain.name.replace(/^Mount\s+/i, 'Mt. ')}
        </p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
          {mountain.elevation}m · {mountain.island_group}
        </p>
      </div>
    </Link>
  )
}

function AgencyRow({ agency, index, total }: { agency: Agency; index: number; total: number }) {
  return (
    <Link
      href={`/agencies/${agency.id}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        textDecoration: 'none', color: 'inherit',
        paddingTop: index === 0 ? 0 : '12px',
        paddingBottom: '12px',
        borderBottom: index < total - 1 ? '1px solid #f3f4f6' : 'none',
      }}
    >
      <div style={{
        width: '38px', height: '38px', borderRadius: '10px',
        backgroundColor: '#f3f4f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Storefront size={18} weight="duotone" color="#6b7280" />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>{agency.name}</p>
        <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
          {agency.price_range} · {agency.regions?.join(', ')}
        </p>
      </div>
    </Link>
  )
}

function ProfileRow({ profile, index, total }: { profile: Profile; index: number; total: number }) {
  return (
    <Link
      href={`/profile/${profile.username}`}
      style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        textDecoration: 'none', color: 'inherit',
        paddingTop: index === 0 ? 0 : '12px',
        paddingBottom: '12px',
        borderBottom: index < total - 1 ? '1px solid #f3f4f6' : 'none',
      }}
    >
      {profile.avatar_url ? (
        <img
          src={profile.avatar_url}
          alt=""
          style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
        />
      ) : (
        <div style={{
          width: '38px', height: '38px', borderRadius: '50%',
          backgroundColor: '#f3f4f6',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <User size={18} weight="duotone" color="#6b7280" />
        </div>
      )}
      <div>
        <p style={{ fontSize: '14px', fontWeight: 500 }}>@{profile.username}</p>
        {profile.full_name && (
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{profile.full_name}</p>
        )}
      </div>
    </Link>
  )
}

function SectionSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            paddingTop: i === 0 ? 0 : '12px',
            paddingBottom: '12px',
            borderBottom: i < rows - 1 ? '1px solid #f3f4f6' : 'none',
          }}
        >
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
          <div>
            <div style={{ width: '130px', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '5px' }} />
            <div style={{ width: '90px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestions>({ mountains: [], agencies: [] })
  const [searching, setSearching] = useState(false)
  const [suggestionsLoading, setSuggestionsLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const router = useRouter()

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Fetch suggestions once on mount
  useEffect(() => {
    const fetchSuggestions = async () => {
      const supabase = createClient()
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

      const [{ data: recentPosts }, { data: agencies }] = await Promise.all([
        supabase
          .from('posts')
          .select('mountain_id, mountains(id, name, elevation, island_group)')
          .not('mountain_id', 'is', null)
          .gte('created_at', sevenDaysAgo),
        supabase
          .from('agencies')
          .select('id, name, price_range, regions')
          .eq('status', 'approved')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      // Group posts by mountain, pick top 5 most active
      const mountainMap = new Map<string, { mountain: Mountain; count: number }>()
      recentPosts?.forEach((p: any) => {
        if (!p.mountain_id || !p.mountains) return
        const existing = mountainMap.get(p.mountain_id)
        if (existing) {
          existing.count++
        } else {
          mountainMap.set(p.mountain_id, { mountain: p.mountains as Mountain, count: 1 })
        }
      })

      const trendingMountains = Array.from(mountainMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(({ mountain }) => mountain)

      setSuggestions({ mountains: trendingMountains, agencies: agencies ?? [] })
      setSuggestionsLoading(false)
    }

    fetchSuggestions()
  }, [])

  // Debounced search triggered by query changes
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)

    if (query.trim().length < 2) {
      setResults(null)
      setSearching(false)
      return
    }

    setSearching(true)

    debounceRef.current = setTimeout(async () => {
      const supabase = createClient()
      const q = query.trim()

      const [mountains, agencies, profiles] = await Promise.all([
        supabase
          .from('mountains')
          .select('id, name, elevation, island_group')
          .ilike('name', `%${q}%`)
          .limit(5),
        supabase
          .from('agencies')
          .select('id, name, price_range, regions')
          .eq('status', 'approved')
          .ilike('name', `%${q}%`)
          .limit(5),
        supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .ilike('username', `%${q}%`)
          .not('username', 'is', null)
          .limit(5),
      ])

      setResults({
        mountains: mountains.data ?? [],
        agencies: agencies.data ?? [],
        profiles: profiles.data ?? [],
      })
      setSearching(false)
    }, 250)

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [query])

  const hasResults = results &&
    (results.mountains.length > 0 || results.agencies.length > 0 || results.profiles.length > 0)

  return (
    <main>
      {/* Sticky search bar */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        backgroundColor: '#FAF7F2',
        padding: '14px 16px',
        borderBottom: '1px solid #f3f4f6',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: '#9ca3af', padding: 0, fontSize: '18px', lineHeight: 1,
              flexShrink: 0,
            }}
          >
            ←
          </button>
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '9px 12px',
          }}>
            <MagnifyingGlass size={15} color="#9ca3af" weight="bold" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Mountains, agencies, hikers..."
              style={{
                flex: 1,
                fontSize: '14px',
                border: 'none',
                outline: 'none',
                backgroundColor: 'transparent',
                fontFamily: 'inherit',
                color: '#111827',
              }}
            />
            {query.length > 0 && (
              <button
                onClick={() => setQuery('')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#9ca3af', padding: 0,
                  display: 'flex', alignItems: 'center', flexShrink: 0,
                }}
              >
                <X size={14} weight="bold" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px' }}>

        {/* Searching skeleton */}
        {searching && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <section>
              <div style={{ width: '80px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
              <SectionSkeleton rows={3} />
            </section>
            <section>
              <div style={{ width: '60px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
              <SectionSkeleton rows={2} />
            </section>
          </div>
        )}

        {/* No results */}
        {!searching && results && !hasResults && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <p style={{ fontSize: '15px', fontWeight: 500, color: '#374151', marginBottom: '4px' }}>
              No results for &ldquo;{query}&rdquo;
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>
              Try a different mountain name, agency, or username.
            </p>
          </div>
        )}

        {/* Search results */}
        {!searching && hasResults && (
          <div style={{ display: 'grid', gap: '28px' }}>

            {results!.mountains.length > 0 && (
              <section>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Mountains
                </p>
                <div>
                  {results!.mountains.map((m, i) => (
                    <MountainRow key={m.id} mountain={m} index={i} total={results!.mountains.length} />
                  ))}
                </div>
              </section>
            )}

            {results!.agencies.length > 0 && (
              <section>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Agencies
                </p>
                <div>
                  {results!.agencies.map((a, i) => (
                    <AgencyRow key={a.id} agency={a} index={i} total={results!.agencies.length} />
                  ))}
                </div>
              </section>
            )}

            {results!.profiles.length > 0 && (
              <section>
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                  Hikers
                </p>
                <div>
                  {results!.profiles.map((p, i) => (
                    <ProfileRow key={p.id} profile={p} index={i} total={results!.profiles.length} />
                  ))}
                </div>
              </section>
            )}

          </div>
        )}

        {/* Suggestions — empty query state */}
        {!query && !searching && (
          <div style={{ display: 'grid', gap: '28px' }}>

            <section>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Trending Mountains
              </p>
              {suggestionsLoading ? (
                <SectionSkeleton rows={4} />
              ) : suggestions.mountains.length > 0 ? (
                <div>
                  {suggestions.mountains.map((m, i) => (
                    <MountainRow key={m.id} mountain={m} index={i} total={suggestions.mountains.length} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>No recent trail activity.</p>
              )}
            </section>

            <section>
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
                Agencies
              </p>
              {suggestionsLoading ? (
                <SectionSkeleton rows={4} />
              ) : suggestions.agencies.length > 0 ? (
                <div>
                  {suggestions.agencies.map((a, i) => (
                    <AgencyRow key={a.id} agency={a} index={i} total={suggestions.agencies.length} />
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#9ca3af' }}>No agencies listed yet.</p>
              )}
            </section>

          </div>
        )}

      </div>
    </main>
  )
}