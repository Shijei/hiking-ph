export default function Loading() {
  return (
    <main style={{ padding: '20px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ width: '140px', height: '20px', backgroundColor: '#e5e7eb', borderRadius: '6px', marginBottom: '6px' }} />
        <div style={{ width: '220px', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
      </div>

      {/* Compose bar */}
      <div style={{
        height: '44px',
        backgroundColor: '#ffffff',
        borderRadius: '999px',
        marginBottom: '10px',
        border: '1px solid #f0f0f0',
      }} />

      {/* Trail Pulse strip */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', overflow: 'hidden' }}>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            style={{ flexShrink: 0, width: '88px', height: '88px', backgroundColor: '#f3f4f6', borderRadius: '14px' }}
          />
        ))}
      </div>

      {/* Posts */}
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ paddingTop: '14px', paddingBottom: '14px', borderBottom: '1px solid #f3f4f6' }}>
          {/* Author row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#e5e7eb', flexShrink: 0 }} />
            <div style={{ width: '120px', height: '13px', backgroundColor: '#e5e7eb', borderRadius: '6px' }} />
          </div>
          {/* Body */}
          <div style={{ width: '100%', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '5px' }} />
          <div style={{ width: i === 2 ? '60%' : '85%', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '4px', marginBottom: '10px' }} />
          {/* Image placeholder — only on first post */}
          {i === 1 && (
            <div style={{ width: '100%', height: '200px', backgroundColor: '#f3f4f6', borderRadius: '10px', marginBottom: '10px' }} />
          )}
          {/* Actions */}
          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ width: '36px', height: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
            <div style={{ width: '36px', height: '15px', backgroundColor: '#f3f4f6', borderRadius: '4px' }} />
          </div>
        </div>
      ))}
    </main>
  )
}