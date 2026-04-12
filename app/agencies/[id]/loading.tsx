export default function Loading() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ width: '60px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '24px' }} />
      <div style={{ width: '200px', height: '26px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '8px' }} />
      <div style={{ width: '100%', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '4px' }} />
      <div style={{ width: '80%', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '24px' }} />

      <div style={{ width: '80px', height: '44px', backgroundColor: '#f3f4f6', borderRadius: '10px', marginBottom: '24px' }} />

      <div style={{ height: '1px', backgroundColor: '#f3f4f6', marginBottom: '24px' }} />

      <div style={{ display: 'grid', gap: '16px' }}>
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ padding: '16px 0', borderBottom: '1px solid #f3f4f6' }}>
            <div style={{ width: '180px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '8px' }} />
            <div style={{ width: '100%', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '4px' }} />
            <div style={{ width: '70%', height: '12px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
          </div>
        ))}
      </div>
    </main>
  )
}