import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Mountains, ArrowRight } from '@phosphor-icons/react/dist/ssr'

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('*, reviews(rating)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const agenciesWithRating = agencies?.map((agency) => {
    const ratings = agency.reviews?.map((r: any) => r.rating) ?? []
    const avg = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0
    return { ...agency, avgRating: avg, reviewCount: ratings.length }
  }) ?? []

  const agencyOfWeek = agenciesWithRating
    .filter((a) => a.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating)[0]
    ?? agenciesWithRating[0]

  const { data: topMountains } = await supabase
    .from('mountains')
    .select('*')
    .order('elevation', { ascending: false })
    .limit(6)

  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '24px' }}>Explore</h1>

      {/* Agency of the Week */}
      {agencyOfWeek && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Agency of the Week
            </p>
            <Link href="/explore/agencies" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>
              See all <ArrowRight size={12} />
            </Link>
          </div>
          <Link href={`/agencies/${agencyOfWeek.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>{agencyOfWeek.name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px', lineHeight: 1.4 }}>{agencyOfWeek.description}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>{agencyOfWeek.regions?.join(', ')}</p>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
                <p style={{ fontSize: '22px', fontWeight: 700 }}>
                  {agencyOfWeek.avgRating > 0 ? agencyOfWeek.avgRating.toFixed(1) : '—'}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{agencyOfWeek.reviewCount} reviews</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{agencyOfWeek.price_range}</p>
              </div>
            </div>
          </Link>
        </section>
      )}

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

      {/* Agencies */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Agencies
          </p>
          <Link href="/explore/agencies" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>
            See all <ArrowRight size={12} />
          </Link>
        </div>
        <div>
          {agenciesWithRating.slice(0, 3).map((agency, index) => (
            <Link
              key={agency.id}
              href={`/agencies/${agency.id}`}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', textDecoration: 'none', color: 'inherit', paddingTop: index === 0 ? 0 : '14px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{agency.name}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{agency.regions?.join(', ')}</p>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                <p style={{ fontSize: '15px', fontWeight: 600 }}>
                  {agency.avgRating > 0 ? `${agency.avgRating.toFixed(1)} / 5` : '—'}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af' }}>{agency.price_range}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

      {/* Mountains — ONLY these get square boxes */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Mountains
          </p>
          <Link href="/explore/mountains" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>
            See all <ArrowRight size={12} />
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {topMountains?.map((mountain) => (
            <Link
              key={mountain.id}
              href={`/mountains/${mountain.id}`}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                aspectRatio: '1 / 1',
                textDecoration: 'none',
                color: 'inherit',
                padding: '8px',
              }}
            >
              <Mountains size={24} weight="duotone" style={{ color: '#6b7280', marginBottom: '6px' }} />
              <p style={{ fontSize: '10px', fontWeight: 500, textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                {mountain.name}
              </p>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{mountain.elevation}m</p>
            </Link>
          ))}
        </div>
        <Link href="/explore/mountains" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '13px', color: '#9ca3af', textDecoration: 'none', marginTop: '16px' }}>
          See all 497 mountains <ArrowRight size={13} />
        </Link>
      </section>
    </main>
  )
}