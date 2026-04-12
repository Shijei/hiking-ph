export default function Loading() {
  return (
    <main style={{ padding: '24px 16px' }}>
      <div style={{ width: '40px', height: '14px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '20px' }} />

      <div style={{ paddingTop: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#f3f4f6', flexShrink: 0 }} />
          <div style={{ width: '140px', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
        </div>

        <div style={{ width: '100%', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '6px' }} />
        <div style={{ width: '85%', height: '13px', backgroundColor: '#f3f4f6', borderRadius: '6px', marginBottom: '12px' }} />

        <div style={{ width: '100%', aspectRatio: '4 / 3', backgroundColor: '#f3f4f6', borderRadius: '10px', marginBottom: '12px' }} />

        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
          <div style={{ width: '40px', height: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
          <div style={{ width: '40px', height: '15px', backgroundColor: '#f3f4f6', borderRadius: '6px' }} />
        </div>
      </div>
    </main>
  )
}