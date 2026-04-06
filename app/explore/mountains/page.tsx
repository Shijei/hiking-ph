import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Mountains } from '@phosphor-icons/react/dist/ssr'

export default async function MountainsExplorePage() {
  const supabase = await createClient()

  const { data: mountains } = await supabase
    .from('mountains')
    .select('*')
    .order('elevation', { ascending: false })

  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
        <Link href="/explore" style={{ fontSize: '13px', color: '#9ca3af', textDecoration: 'none' }}>←</Link>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Mountains</h1>
      </div>

      <p style={{ fontSize: '13px', color: '#9ca3af', marginBottom: '20px' }}>
        {mountains?.length} mountains in the Philippines
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {mountains?.map((mountain) => (
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
            <Mountains size={26} weight="duotone" style={{ color: '#6b7280', marginBottom: '6px' }} />
            <p style={{ fontSize: '11px', fontWeight: 500, textAlign: 'center', lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {mountain.name}
            </p>
            <p style={{ fontSize: '10px', color: '#9ca3af', marginTop: '3px' }}>{mountain.elevation}m</p>
          </Link>
        ))}
      </div>
    </main>
  )
}