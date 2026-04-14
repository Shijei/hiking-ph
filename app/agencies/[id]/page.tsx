import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReviewForm from './ReviewForm'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

// 8 gradient palettes — picked by first char of agency name
// Visually distinct from mountain page: lighter, colorful, brand-forward
const BANNER_GRADIENTS = [
  { from: '#667eea', to: '#764ba2' }, // purple
  { from: '#f093fb', to: '#f5576c' }, // pink-red
  { from: '#4facfe', to: '#00f2fe' }, // sky blue
  { from: '#43e97b', to: '#38f9d7' }, // green-teal
  { from: '#fa709a', to: '#fee140' }, // pink-gold
  { from: '#a18cd1', to: '#fbc2eb' }, // lavender
  { from: '#fd7443', to: '#feb47b' }, // orange
  { from: '#2af598', to: '#009efd' }, // teal-blue
]

function getBannerGradient(name: string) {
  const idx = (name.toUpperCase().charCodeAt(0) - 65 + 26) % 8
  return BANNER_GRADIENTS[Math.abs(idx) % BANNER_GRADIENTS.length]
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('')
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
  const gradient = getBannerGradient(agency.name)
  const initials = getInitials(agency.name)

  // If the agencies table has cover_image_url in the future, use it here
  const coverImageUrl: string | null = (agency as any).cover_image_url ?? null

  return (
    <main style={{ padding: '0' }}>

      {/* Banner — distinct from mountain hero:
          - Lighter, colorful gradient (not dark moody)
          - Large initials badge instead of elevation
          - Shorter height (180px vs 220px)
          - No back-button blur pill — simple inline link
      */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '180px',
        overflow: 'hidden',
        background: coverImageUrl
          ? undefined
          : `linear-gradient(135deg, ${gradient.from} 0%, ${gradient.to} 100%)`,
        backgroundColor: gradient.from,
      }}>
        {coverImageUrl && (
          <img
            src={coverImageUrl}
            alt={agency.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Subtle grid pattern overlay for texture */}
        {!coverImageUrl && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }} />
        )}

        {/* Back link */}
        <Link
          href="/explore/agencies"
          style={{
            position: 'absolute', top: '16px', left: '16px',
            color: 'rgba(255,255,255,0.85)',
            fontSize: '13px', fontWeight: 500,
            textDecoration: 'none',
          }}
        >
          ← Back
        </Link>

        {/* Initials badge — centered */}
        {!coverImageUrl && (
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '64px', height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.22)',
            border: '2px solid rgba(255,255,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{
              fontSize: '22px', fontWeight: 700,
              color: '#ffffff',
              letterSpacing: '-0.01em',
            }}>
              {initials}
            </span>
          </div>
        )}

        {/* Bottom info strip */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '10px 16px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {agency.regions?.slice(0, 3).map((region: string) => (
              <span key={region} style={{
                fontSize: '10px', fontWeight: 600,
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: '#ffffff',
                padding: '2px 8px', borderRadius: '20px',
                backdropFilter: 'blur(4px)',
              }}>
                {region}
              </span>
            ))}
          </div>
          <span style={{
            fontSize: '12px', fontWeight: 600, color: '#ffffff',
            backgroundColor: 'rgba(0,0,0,0.2)',
            padding: '2px 8px', borderRadius: '20px',
            backdropFilter: 'blur(4px)',
          }}>
            {agency.price_range}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '20px 16px 32px' }}>

        {/* Agency name + meta */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2, flex: 1, paddingRight: '12px' }}>
              {agency.name}
            </h1>
            {avgRating && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1 }}>{avgRating}</p>
                <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                  {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            )}
          </div>

          <p style={{ fontSize: '14px', color: '#6b7280', lineHeight: 1.6, marginBottom: '12px' }}>
            {agency.description}
          </p>

          {fbUrl && (
            <a
              href={fbUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                fontSize: '13px', color: '#3b82f6',
                textDecoration: 'none',
                border: '1px solid #bfdbfe',
                borderRadius: '8px',
                padding: '5px 12px',
                backgroundColor: '#eff6ff',
              }}
            >
              Facebook Page →
            </a>
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
              <Link
                href="/login"
                style={{
                  backgroundColor: '#111827', color: '#ffffff',
                  padding: '8px 16px', borderRadius: '12px',
                  fontSize: '13px', textDecoration: 'none',
                }}
              >
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
      </div>
    </main>
  )
}