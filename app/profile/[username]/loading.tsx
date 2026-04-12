export default function Loading() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ width: '40px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '20px' }} />

      {/* Profile header */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
        <div>
          <div style={{ width: '120px', height: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '6px' }} />
          <div style={{ width: '160px', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px', marginTop: '8px' }}>
        {[1, 2].map((i) => (
          <div key={i} style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', textAlign: 'center' }}>
            <div style={{ width: '40px', height: '28px', backgroundColor: '#f3f4f6', borderRadius: '6px', margin: '0 auto 6px' }} />
            <div style={{ width: '100px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px', margin: '0 auto' }} />
          </div>
        ))}
      </div>

      {/* Conquest grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} style={{ aspectRatio: '1 / 1', backgroundColor: '#f3f4f6', borderRadius: '10px' }} />
        ))}
      </div>
    </main>
  )
}