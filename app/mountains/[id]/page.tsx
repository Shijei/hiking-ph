import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ConquestButton from './ConquestButton'
import Link from 'next/link'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function MountainPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: mountain, error } = await supabase
    .from('mountains')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !mountain) return notFound()

  const { data: conquest } = user
    ? await supabase.from('conquests').select('*').eq('mountain_id', id).eq('user_id', user.id).single()
    : { data: null }

  const { count } = await supabase
    .from('conquests')
    .select('*', { count: 'exact', head: true })
    .eq('mountain_id', id)

  return (
    <main style={{ padding: '24px 16px' }}>

      <Link href="/explore/mountains" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none', display: 'inline-block', marginBottom: '20px' }}>
        ← Back
      </Link>

      {/* Mountain Header */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '26px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              {mountain.name.replace(/^Mount\s+/i, 'Mt. ')}
              {mountain.is_volcano && (
                <span style={{ fontSize: '11px', backgroundColor: '#fee2e2', color: '#ef4444', padding: '2px 8px', borderRadius: '20px', marginLeft: '8px', fontWeight: 500, verticalAlign: 'middle' }}>
                  Volcano
                </span>
              )}
            </h1>
            <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '4px' }}>{mountain.island_group}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ fontSize: '32px', fontWeight: 700 }}>{mountain.elevation}m</p>
            <p style={{ fontSize: '12px', color: '#9ca3af' }}>elevation</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '20px' }} />

      {/* Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        <div>
          <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Province/s</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{mountain.provinces?.join(', ')}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Region/s</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{mountain.regions?.join(', ')}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Coordinates</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{mountain.coordinates ?? 'N/A'}</p>
        </div>
        <div>
          <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Hikers Conquered</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{count ?? 0}</p>
        </div>
      </div>

      {mountain.alt_names?.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <p style={{ fontSize: '11px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>Also known as</p>
          <p style={{ fontSize: '14px', fontWeight: 500 }}>{mountain.alt_names.join(', ')}</p>
        </div>
      )}

      {/* Divider */}
      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '20px' }} />

      {/* Conquest */}
      {user ? (
        <ConquestButton mountainId={id} userId={user.id} conquered={!!conquest} />
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '10px' }}>Sign in to mark this mountain as conquered.</p>
          <Link href="/login" style={{ backgroundColor: '#111827', color: '#ffffff', padding: '8px 16px', borderRadius: '12px', fontSize: '13px', textDecoration: 'none' }}>
            Sign in
          </Link>
        </div>
      )}

    </main>
  )
}