export default function Loading() {
  return (
    <main>
      {/* Search bar skeleton */}
      <div style={{
        padding: '14px 16px',
        borderBottom: '1px solid #f3f4f6',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{ width: '18px', height: '18px', backgroundColor: '#f3f4f6', borderRadius: '4px', flexShrink: 0 }} />
        <div style={{ flex: 1, height: '40px', backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '12px' }} />
      </div>

      <div style={{ padding: '20px 16px', display: 'grid', gap: '28px' }}>
        {[1, 2].map((section) => (
          <div key={section}>
            <div style={{ width: '120px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  paddingTop: i === 1 ? 0 : '12px',
                  paddingBottom: '12px',
                  borderBottom: i < 4 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
                <div>
                  <div style={{ width: `${100 + i * 20}px`, height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '5px' }} />
                  <div style={{ width: '80px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  )
}