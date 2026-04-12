export default function Loading() {
  return (
    <main style={{ padding: '0' }}>
      {/* Hero skeleton */}
      <div style={{ width: '100%', height: '220px', backgroundColor: '#1c1c2e' }} />

      <div style={{ padding: '16px 16px 24px' }}>
        <div style={{ width: '180px', height: '26px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '16px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px', marginBottom: '16px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <div style={{ width: '60px', height: '10px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '4px' }} />
              <div style={{ width: '100px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
            </div>
          ))}
        </div>

        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '16px' }} />

        <div style={{ width: '100%', height: '140px', backgroundColor: '#f3f4f6', borderRadius: '12px', marginBottom: '24px' }} />

        <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '16px' }} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ aspectRatio: '1 / 1', backgroundColor: '#f3f4f6', borderRadius: '10px' }} />
          ))}
        </div>
      </div>
    </main>
  )
}