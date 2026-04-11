import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import SignOutButton from './SignOutButton'
import SongPlayer from './SongPlayer'
import ConquestGrid from './ConquestGrid'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: conquests } = await supabase
    .from('conquests')
    .select('id, mountain_id, conquered_at, photo_url, mountains(name, elevation, provinces)')
    .eq('user_id', user.id)
    .order('conquered_at', { ascending: false })

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*, agencies(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const statCard = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  }

  const row = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    textDecoration: 'none',
    color: 'inherit',
    paddingTop: '14px',
    paddingBottom: '14px',
    borderBottom: '1px solid #f3f4f6',
  }

  return (
    <main style={{ padding: '24px 16px' }}>

      {/* Profile Header */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          {user.user_metadata.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
            />
          )}
          <div>
            <p style={{ fontWeight: 600, fontSize: '16px' }}>@{profile?.username}</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '2px' }}>{profile?.bio ?? 'No bio yet.'}</p>
          </div>
        </div>
        <Link
          href="/profile/edit"
          style={{ fontSize: '12px', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '6px 12px', color: '#6b7280', textDecoration: 'none' }}
        >
          Edit
        </Link>
      </div>

      {profile?.song_url && (
        <div style={{ marginBottom: '8px' }}>
          <SongPlayer songUrl={profile.song_url} autoplay={true} />
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        <div style={{ ...statCard, textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 700 }}>{conquests?.length ?? 0}</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Mountains Conquered</p>
        </div>
        <div style={{ ...statCard, textAlign: 'center' }}>
          <p style={{ fontSize: '28px', fontWeight: 700 }}>{reviews?.length ?? 0}</p>
          <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '4px' }}>Reviews Written</p>
        </div>
      </div>

      {/* Conquered Mountains — photo grid */}
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 8px' }}>
        Conquered Mountains
      </p>
      <ConquestGrid conquests={(conquests as any) ?? []} userId={user.id} />

      {/* Reviews Written */}
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '16px 0 4px' }}>
        Reviews Written
      </p>
      {reviews && reviews.length > 0 ? (
        <div style={{ marginBottom: '24px' }}>
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/agencies/${review.agency_id}`}
              style={{ ...row, alignItems: 'flex-start' } as any}
            >
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{review.agencies.name}</p>
                <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>{review.body}</p>
              </div>
              <p style={{ fontSize: '14px', fontWeight: 500, marginLeft: '16px' }}>{review.rating}/5</p>
            </Link>
          ))}
        </div>
      ) : (
        <div style={{ padding: '16px 0', marginBottom: '24px' }}>
          <p style={{ fontSize: '14px', color: '#9ca3af' }}>No reviews written yet.</p>
        </div>
      )}

      {profile?.role === 'hiker' && (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Link
            href="/agency-apply"
            style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'underline' }}
          >
            Leading hikers to the summit? Register your agency
          </Link>
        </div>
      )}
      {profile?.role === 'admin' && (
        <Link
          href="/admin"
          style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '16px' }}
        >
          Admin Dashboard →
        </Link>
      )}

      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <Link href="/concern" style={{ fontSize: '13px', color: '#6b7280', textDecoration: 'underline' }}>
          Send a concern
        </Link>
      </div>

      <div style={{ textAlign: 'center' }}>
        <SignOutButton />
      </div>

    </main>
  )
}