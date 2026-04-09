import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Mountains, ArrowRight, TrendUp, Fire, Trophy } from '@phosphor-icons/react/dist/ssr'

export default async function ExplorePage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('*, reviews(rating, created_at)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

  const agenciesWithScores = agencies?.map((agency) => {
    const allRatings = agency.reviews?.map((r: any) => r.rating) ?? []
    const recentReviews = agency.reviews?.filter((r: any) => new Date(r.created_at) >= sevenDaysAgo) ?? []
    const recentRatings = recentReviews.map((r: any) => r.rating)

    const allTimeAvg = allRatings.length > 0
      ? allRatings.reduce((a: number, b: number) => a + b, 0) / allRatings.length
      : 0

    const recentAvg = recentRatings.length > 0
      ? recentRatings.reduce((a: number, b: number) => a + b, 0) / recentRatings.length
      : 0

    const momentumScore = recentRatings.length > 0 ? recentRatings.length * recentAvg : 0
    const allTimeScore = allRatings.length > 0 ? allRatings.length * allTimeAvg : 0

    return {
      ...agency,
      avgRating: allTimeAvg,
      reviewCount: allRatings.length,
      recentReviewCount: recentRatings.length,
      recentAvgRating: recentAvg,
      momentumScore,
      allTimeScore,
    }
  }) ?? []

  const hasRecentActivity = agenciesWithScores.some(a => a.recentReviewCount > 0)

  const agencyOfWeek = hasRecentActivity
    ? agenciesWithScores
        .filter(a => a.recentReviewCount > 0)
        .sort((a, b) => b.momentumScore - a.momentumScore)[0]
    : agenciesWithScores
        .filter(a => a.reviewCount > 0)
        .sort((a, b) => b.allTimeScore - a.allTimeScore)[0]
      ?? agenciesWithScores[0]

  const uprisingAgencies = agenciesWithScores
    .filter(a => a.id !== agencyOfWeek?.id && a.recentReviewCount > 0)
    .sort((a, b) => b.momentumScore - a.momentumScore)
    .slice(0, 3)

  const { data: topMountains } = await supabase
    .from('mountains')
    .select('*')
    .order('elevation', { ascending: false })
    .limit(6)

  const displayRating = agencyOfWeek
    ? (hasRecentActivity && agencyOfWeek.recentReviewCount > 0
        ? agencyOfWeek.recentAvgRating
        : agencyOfWeek.avgRating)
    : 0

  const displayReviewCount = agencyOfWeek
    ? (hasRecentActivity && agencyOfWeek.recentReviewCount > 0
        ? agencyOfWeek.recentReviewCount
        : agencyOfWeek.reviewCount)
    : 0

  return (
    <main style={{ padding: '24px 16px' }}>
      <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '24px' }}>Explore</h1>

      {/* Agency of the Week */}
      {agencyOfWeek && (
        <section style={{ marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Trophy size={13} weight="fill" style={{ color: '#f59e0b' }} />
              <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Agency of the Week
              </p>
            </div>
            <Link href="/explore/agencies" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>
              See all <ArrowRight size={12} />
            </Link>
          </div>

          <Link href={`/agencies/${agencyOfWeek.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '16px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
              border: '1px solid #f3f4f6',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, paddingRight: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>{agencyOfWeek.name}</p>
                    {hasRecentActivity && agencyOfWeek.recentReviewCount > 0 && (
                      <span style={{
                        fontSize: '10px', fontWeight: 600, backgroundColor: '#fef3c7',
                        color: '#d97706', padding: '2px 7px', borderRadius: '20px', letterSpacing: '0.04em',
                      }}>
                        TRENDING
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, marginBottom: '8px' }}>
                    {agencyOfWeek.description}
                  </p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {agencyOfWeek.regions?.join(', ')}
                  </p>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <p style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>
                    {displayRating > 0 ? displayRating.toFixed(1) : '—'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '3px' }}>
                    {displayReviewCount} {hasRecentActivity ? 'this week' : 'reviews'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{agencyOfWeek.price_range}</p>
                </div>
              </div>
            </div>
          </Link>
        </section>
      )}

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

      {/* Uprising Agencies */}
      {uprisingAgencies.length > 0 && (
        <>
          <section style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Fire size={13} weight="fill" style={{ color: '#ef4444' }} />
                <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Uprising
                </p>
              </div>
              <Link href="/explore/agencies" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>
                See all <ArrowRight size={12} />
              </Link>
            </div>

            <div>
              {uprisingAgencies.map((agency, index) => (
                <Link
                  key={agency.id}
                  href={`/agencies/${agency.id}`}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    textDecoration: 'none', color: 'inherit',
                    paddingTop: index === 0 ? 0 : '14px',
                    paddingBottom: '14px',
                    borderBottom: index < uprisingAgencies.length - 1 ? '1px solid #f3f4f6' : 'none',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                      <p style={{ fontSize: '14px', fontWeight: 600 }}>{agency.name}</p>
                    </div>
                    <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {agency.regions?.join(', ')} · {agency.price_range}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
                    <p style={{ fontSize: '15px', fontWeight: 700 }}>
                      {agency.recentAvgRating > 0 ? agency.recentAvgRating.toFixed(1) : '—'}
                    </p>
                    <p style={{ fontSize: '11px', color: '#ef4444', fontWeight: 500 }}>
                      +{agency.recentReviewCount} this week
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />
        </>
      )}

      {/* All Agencies preview */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendUp size={13} weight="bold" style={{ color: '#9ca3af' }} />
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Agencies
            </p>
          </div>
          <Link href="/explore/agencies" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#9ca3af', textDecoration: 'none' }}>
            See all <ArrowRight size={12} />
          </Link>
        </div>

        <div>
          {agenciesWithScores
            .filter(a => a.id !== agencyOfWeek?.id)
            .slice(0, 3)
            .map((agency, index) => (
              <Link
                key={agency.id}
                href={`/agencies/${agency.id}`}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  textDecoration: 'none', color: 'inherit',
                  paddingTop: index === 0 ? 0 : '14px',
                  paddingBottom: '14px',
                  borderBottom: '1px solid #f3f4f6',
                }}
              >
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 500 }}>{agency.name}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    {agency.regions?.join(', ')} · {agency.price_range}
                  </p>
                </div>
                <div style={{ textAlign: 'right', marginLeft: '16px' }}>
                  <p style={{ fontSize: '15px', fontWeight: 600 }}>
                    {agency.avgRating > 0 ? `${agency.avgRating.toFixed(1)} / 5` : '—'}
                  </p>
                  <p style={{ fontSize: '11px', color: '#9ca3af' }}>
                    {agency.reviewCount} {agency.reviewCount === 1 ? 'review' : 'reviews'}
                  </p>
                </div>
              </Link>
            ))}
        </div>
      </section>

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

      {/* Mountains */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Mountains size={13} weight="bold" style={{ color: '#9ca3af' }} />
            <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Mountains
            </p>
          </div>
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
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#ffffff', borderRadius: '14px', aspectRatio: '1 / 1',
                textDecoration: 'none', color: 'inherit', padding: '8px',
                border: '1px solid #f3f4f6',
              }}
            >
              <Mountains size={24} weight="duotone" style={{ color: '#6b7280', marginBottom: '6px' }} />
              <p style={{
                fontSize: '10px', fontWeight: 500, textAlign: 'center', lineHeight: 1.3,
                overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              }}>
                {mountain.name.replace(/^Mount\s+/i, 'Mt. ')}
              </p>
              <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px' }}>{mountain.elevation}m</p>
            </Link>
          ))}
        </div>

        <Link href="/explore/mountains" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '4px', fontSize: '13px', color: '#9ca3af', textDecoration: 'none', marginTop: '16px',
        }}>
          See all 497 mountains <ArrowRight size={13} />
        </Link>
      </section>
    </main>
  )
}