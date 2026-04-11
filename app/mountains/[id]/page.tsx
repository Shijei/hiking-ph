import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConquestForm from './ConquestForm'
import MountainFeed from './MountainFeed'
import Link from 'next/link'
import { Mountains } from '@phosphor-icons/react/dist/ssr'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}
export const dynamic = 'force-dynamic' 
export default async function MountainPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { from } = await searchParams
  
  const backHref = from === 'feed' ? '/' : '/explore/mountains'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: mountain, error } = await supabase
    .from('mountains')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !mountain) return notFound()

  const { data: conquest } = user
    ? await supabase
        .from('conquests')
        .select('id, photo_url')
        .eq('mountain_id', id)
        .eq('user_id', user.id)
        .single()
    : { data: null }

  const { data: profile } = user
    ? await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single()
    : { data: null }

  const { count } = await supabase
    .from('conquests')
    .select('*', { count: 'exact', head: true })
    .eq('mountain_id', id)

  const coverImage: string | null = mountain.cover_image_url ?? null

  return (
    <main style={{ padding: '0' }}>

      {/* Hero */}
      <div style={{ position: 'relative', width: '100%', height: '220px', backgroundColor: '#1c1c1e', overflow: 'hidden' }}>
        {coverImage ? (
          <img
            src={coverImage}
            alt={mountain.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            background: 'linear-gradient(135deg, #1c1c2e 0%, #2d3561 50%, #1a1a2e 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Mountains size={64} color="rgba(255,255,255,0.12)" weight="duotone" />
          </div>
        )}

        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px', background: 'linear-gradient(transparent, rgba(0,0,0,0.55))' }} />

        <Link
          href={backHref}
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'rgba(0,0,0,0.35)',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            padding: '6px 12px',
            borderRadius: '20px',
            backdropFilter: 'blur(6px)',
          }}
        >
          ← Back
        </Link>

        {mountain.is_volcano && (
          <span style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            fontSize: '11px',
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '4px 10px',
            borderRadius: '20px',
            fontWeight: 600,
          }}>
            Volcano
          </span>
        )}

        <div style={{ position: 'absolute', bottom: '12px', right: '16px' }}>
          <p style={{ fontSize: '26px', fontWeight: 700, color: '#ffffff', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {mountain.elevation}m
          </p>
        </div>
      </div>

      <div style={{ padding: '16px 16px 24px' }}>

        {/* Name + meta */}
        <div style={{ marginBottom: '16px' }}>
          <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: '12px' }}>
            {mountain.name.replace(/^Mount\s+/i, 'Mt. ')}
          </h1>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Island Group</p>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{mountain.island_group}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Hikers</p>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{count ?? 0} conquered</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Province/s</p>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{mountain.provinces?.join(', ')}</p>
            </div>
            <div>
              <p style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>Region/s</p>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>{mountain.regions?.join(', ')}</p>
            </div>
          </div>

          {mountain.alt_names?.length > 0 && (
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
              Also known as: {mountain.alt_names.join(', ')}
            </p>
          )}
        </div>

        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '16px' }} />

        {/* Conquest */}
        <div style={{ marginBottom: '24px' }}>
          {user && profile ? (
            <ConquestForm
              mountainId={id}
              userId={user.id}
              username={profile.username}
              mountainName={mountain.name}
              conquered={!!conquest}
              existingPhotoUrl={conquest?.photo_url ?? null}
              conquestId={conquest?.id ?? null}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '10px' }}>
                Sign in to log your conquest.
              </p>
              <Link
                href="/login"
                style={{ backgroundColor: '#111827', color: '#ffffff', padding: '8px 20px', borderRadius: '12px', fontSize: '13px', textDecoration: 'none' }}
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        console.error('conquest fetch result:', conquest)
        
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '16px' }} />

        <MountainFeed mountainId={id} />

      </div>
    </main>
  )
}