import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import AdminActions from './AdminActions'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Check role server-side from database — not from JWT or email
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/')

  // Get all pending agencies
  const { data: pending } = await supabase
    .from('agencies')
    .select('*, profiles(username, full_name)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  // Get approved and rejected for history
  const { data: reviewed } = await supabase
    .from('agencies')
    .select('*, profiles(username, full_name)')
    .in('status', ['approved', 'rejected'])
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ marginBottom: '24px' }}>
        <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '4px' }}>
          Admin Dashboard
        </p>
        <h1 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>Agency Applications</h1>
      </div>

      {/* Pending */}
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Pending ({pending?.length ?? 0})
      </p>

      {pending && pending.length > 0 ? (
        <div style={{ marginBottom: '32px' }}>
          {pending.map((agency) => (
            <div
              key={agency.id}
              style={{ paddingTop: '16px', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '15px', fontWeight: 600 }}>{agency.name}</p>
                  <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                    by @{agency.profiles?.username ?? agency.profiles?.full_name}
                  </p>
                </div>
              </div>

              <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: 1.5, marginBottom: '8px' }}>
                {agency.description}
              </p>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '12px' }}>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>{agency.regions?.join(', ')}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af' }}>{agency.price_range}</p>
                {agency.fb_page_url && (
                    <a href={agency.fb_page_url} target="_blank" style={{ fontSize: '12px', color: '#3b82f6', textDecoration: 'none' }}>Facebook</a>
                )}
              </div>

              <AdminActions agencyId={agency.id} />
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '14px', color: '#9ca3af', marginBottom: '32px' }}>
          No pending applications.
        </p>
      )}

      {/* Reviewed */}
      <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
        Recently Reviewed
      </p>

      {reviewed && reviewed.length > 0 ? (
        <div>
          {reviewed.map((agency) => (
            <div
              key={agency.id}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}
            >
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500 }}>{agency.name}</p>
                <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>
                  by @{agency.profiles?.username ?? agency.profiles?.full_name}
                </p>
              </div>
              <p style={{ fontSize: '12px', fontWeight: 600, color: agency.status === 'approved' ? '#16a34a' : '#ef4444' }}>
                {agency.status === 'approved' ? 'Approved' : 'Rejected'}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>No reviewed applications yet.</p>
      )}
    </main>
  )
}