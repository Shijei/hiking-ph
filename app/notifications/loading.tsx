export default function Loading() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ width: '140px', height: '22px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '24px' }} />
      {[1, 2, 3, 4].map(i => (
        <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', paddingBottom: '16px', borderBottom: '1px solid #f3f4f6', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
          <div>
            <div style={{ width: '200px', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '6px' }} />
            <div style={{ width: '70px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </main>
  )
}