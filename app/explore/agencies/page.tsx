import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AgenciesPage() {
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

  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        <Link href="/explore" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>←</Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Agencies</h1>
      </div>

      <div>
        {agenciesWithRating.map((agency, index) => (
          <Link
            key={agency.id}
            href={`/agencies/${agency.id}`}
            style={{ display: 'block', textDecoration: 'none', color: 'inherit', paddingTop: index === 0 ? 0 : '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '15px', fontWeight: 600 }}>{agency.name}</p>
                <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '3px', lineHeight: 1.4 }}>{agency.description}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px' }}>
                  {agency.regions?.join(', ')} · {agency.price_range}
                </p>
              </div>
              <div style={{ textAlign: 'right', marginLeft: '16px', flexShrink: 0 }}>
                <p style={{ fontSize: '18px', fontWeight: 700 }}>
                  {agency.avgRating > 0 ? agency.avgRating.toFixed(1) : '—'}
                </p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  {agency.reviewCount} {agency.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}