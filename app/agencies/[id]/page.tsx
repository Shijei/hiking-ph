import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReviewForm from './ReviewForm'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AgencyPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', id)
    .single()

  if (agencyError || !agency) return notFound()

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('agency_id', id)
    .order('created_at', { ascending: false })

  const avgRating = reviews && reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null

  const reviewCount = reviews?.length ?? 0
  const fbUrl = agency.fb_page_url as string | null

  return (
    <main style={{ padding: '24px 16px' }}>

      <Link href="/explore/agencies" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Back
      </Link>

      {/* Agency Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>{agency.name}</h1>
        <p style={{ fontSize: '14px', color: '#6b7280', marginTop: '6px', lineHeight: 1.5 }}>{agency.description}</p>

        <div style={{ display: 'flex', gap: '16px', marginTop: '12px', flexWrap: 'wrap' }}>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>{agency.price_range}</p>
          <p style={{ fontSize: '13px', color: '#9ca3af' }}>{agency.regions?.join(', ')}</p>
          {fbUrl && (
            <a href={fbUrl} target="_blank" style={{ fontSize: '13px', color: '#3b82f6', textDecoration: 'none' }}>
              Facebook Page
            </a>
          )}
        </div>

        {avgRating && (
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{avgRating}</p>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>/ 5 · {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}</p>
          </div>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '24px' }} />

      {/* Review Form */}
      <div style={{ marginBottom: '24px' }}>
        {user ? (
          <ReviewForm agencyId={id} userId={user.id} />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '10px' }}>Sign in to write a review.</p>
            <Link href="/login" style={{ backgroundColor: '#111827', color: '#ffffff', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', textDecoration: 'none' }}>
              Sign in
            </Link>
          </div>
        )}
      </div>

      {/* Reviews */}
      <div>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
          Reviews
        </p>

        {reviews && reviews.length > 0 ? (
          <div style={{ display: 'grid', gap: '16px' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>{review.rating} / 5</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {new Date(review.created_at).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.5 }}>{review.body}</p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>No reviews yet. Be the first!</p>
        )}
      </div>

    </main>
  )
}