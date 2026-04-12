export default function Loading() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ width: '80px', height: '22px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '24px' }} />

      {/* Agency of week skeleton */}
      <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.07)', border: '1px solid #f3f4f6' }}>
        <div style={{ width: '140px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div style={{ flex: 1, paddingRight: '16px' }}>
            <div style={{ width: '160px', height: '16px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '8px' }} />
            <div style={{ width: '100%', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '4px' }} />
            <div style={{ width: '80%', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
          </div>
          <div style={{ width: '48px', height: '48px', backgroundColor: '#f3f4f6', borderRadius: '8px', flexShrink: 0 }} />
        </div>
      </div>

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

      {/* Agencies list skeleton */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ width: '80px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '14px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
            <div>
              <div style={{ width: '150px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '6px' }} />
              <div style={{ width: '110px', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
            </div>
            <div style={{ width: '48px', height: '30px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
          </div>
        ))}
      </div>

      <div style={{ height: '1px', backgroundColor: '#e5e7eb', marginBottom: '28px' }} />

      {/* Mountains grid skeleton */}
      <div>
        <div style={{ width: '80px', height: '11px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '12px' }} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ aspectRatio: '1 / 1', backgroundColor: '#f3f4f6', borderRadius: '14px' }} />
          ))}
        </div>
      </div>
    </main>
  )
}