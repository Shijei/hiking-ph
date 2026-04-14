'use client'

import { useMemo, useState } from 'react'

interface Mountain {
  id: string
  name: string
  elevation: number
  provinces: string[]
  coordinates: any
}

interface Props {
  mountains: Mountain[]
  conqueredIds: Set<string>
}

// ViewBox: 0 0 260 420
// x = (lon - 116.5) * 23.6
// y = (21.2 - lat) * 23.5
function toSVG(lat: number, lon: number) {
  return {
    x: (lon - 116.5) * 23.6,
    y: (21.2 - lat) * 23.5,
  }
}

function extractLatLon(coordinates: any): [number, number] | null {
  if (!coordinates) return null
  if (typeof coordinates === 'object') {
    if (coordinates.type === 'Point' && Array.isArray(coordinates.coordinates)) {
      return [coordinates.coordinates[1], coordinates.coordinates[0]]
    }
    if (typeof coordinates.lat === 'number') {
      return [coordinates.lat, coordinates.lon ?? coordinates.lng]
    }
    if (typeof coordinates.latitude === 'number') {
      return [coordinates.latitude, coordinates.longitude]
    }
  }
  return null
}

const ISLAND_PATHS = [
  { id: 'luzon',    d: 'M 94,62 120,66 130,71 136,87 130,127 130,157 172,180 177,197 167,194 130,184 106,157 89,150 83,133 89,110 91,87 94,69 Z' },
  { id: 'mindoro',  d: 'M 112,180 112,209 100,209 98,188 Z' },
  { id: 'palawan',  d: 'M 75,235 66,251 52,275 26,301 24,301 47,268 73,230 Z' },
  { id: 'panay',    d: 'M 130,222 142,227 151,234 142,258 130,263 125,250 Z' },
  { id: 'negros',   d: 'M 153,239 157,251 148,280 142,286 137,274 139,251 Z' },
  { id: 'cebu',     d: 'M 172,235 179,244 169,274 165,269 165,251 Z' },
  { id: 'leyte',    d: 'M 185,227 200,239 202,268 196,274 185,263 Z' },
  { id: 'samar',    d: 'M 185,210 202,216 212,227 200,239 185,228 Z' },
  { id: 'bohol',    d: 'M 176,262 190,262 187,279 175,279 Z' },
  { id: 'mindanao', d: 'M 157,285 190,297 212,285 220,268 236,316 225,345 207,368 184,368 132,333 153,309 Z' },
]

export default function PhilippinesConquestMap({ mountains, conqueredIds }: Props) {
  const [hoveredProvince, setHoveredProvince] = useState<string | null>(null)

  const provinceStats = useMemo(() => {
    const stats: Record<string, { total: number; conquered: number }> = {}
    mountains.forEach(m => {
      m.provinces?.forEach(province => {
        if (!stats[province]) stats[province] = { total: 0, conquered: 0 }
        stats[province].total++
        if (conqueredIds.has(m.id)) stats[province].conquered++
      })
    })
    return Object.entries(stats)
      .map(([name, data]) => ({
        name,
        total: data.total,
        conquered: data.conquered,
        pct: data.total > 0 ? Math.round((data.conquered / data.total) * 100) : 0,
      }))
      .sort((a, b) => {
        if (b.conquered !== a.conquered) return b.conquered - a.conquered
        return b.total - a.total
      })
  }, [mountains, conqueredIds])

  const plottableMountains = useMemo(() => {
    return mountains
      .map(m => {
        const coords = extractLatLon(m.coordinates)
        if (!coords) return null
        const [lat, lon] = coords
        if (lat < 4 || lat > 22 || lon < 115 || lon > 130) return null
        const { x, y } = toSVG(lat, lon)
        if (x < 0 || x > 260 || y < 0 || y > 420) return null
        return { ...m, svgX: x, svgY: y }
      })
      .filter(Boolean) as (Mountain & { svgX: number; svgY: number })[]
  }, [mountains])

  const totalMountains = mountains.length
  const totalConquered = conqueredIds.size
  const overallPct = totalMountains > 0 ? Math.round((totalConquered / totalMountains) * 100) : 0

  function pctColor(pct: number) {
    if (pct === 0) return '#e5e7eb'
    if (pct < 25) return '#fde68a'
    if (pct < 50) return '#fbbf24'
    if (pct < 75) return '#34d399'
    return '#10b981'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Summary strip */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
        gap: '8px',
      }}>
        {[
          { label: 'Total Mountains', value: totalMountains },
          { label: 'Conquered', value: totalConquered },
          { label: 'Overall', value: `${overallPct}%` },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '12px', textAlign: 'center',
            border: '1px solid #f3f4f6',
          }}>
            <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Map + legend row */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

        {/* SVG Map */}
        <div style={{
          flex: '0 0 auto',
          backgroundColor: '#f0f9ff',
          borderRadius: '14px',
          padding: '12px',
          border: '1px solid #e0f2fe',
        }}>
          <svg
            viewBox="0 0 260 420"
            style={{ width: '160px', height: 'auto', display: 'block' }}
          >
            {/* Ocean background */}
            <rect width="260" height="420" fill="#e0f2fe" rx="8" />

            {/* Islands */}
            {ISLAND_PATHS.map(island => (
              <path
                key={island.id}
                d={island.d}
                fill="#d1d5db"
                stroke="#ffffff"
                strokeWidth="1"
              />
            ))}

            {/* Mountain dots */}
            {plottableMountains.map(m => {
              const conquered = conqueredIds.has(m.id)
              return (
                <circle
                  key={m.id}
                  cx={m.svgX}
                  cy={m.svgY}
                  r={conquered ? 2.5 : 1.8}
                  fill={conquered ? '#10b981' : '#6b7280'}
                  opacity={conquered ? 1 : 0.5}
                />
              )
            })}
          </svg>

          {/* Dot legend */}
          <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {[
              { color: '#10b981', label: 'Conquered' },
              { color: '#6b7280', label: 'Not yet' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: l.color, flexShrink: 0 }} />
                <p style={{ fontSize: '10px', color: '#6b7280' }}>{l.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Province stats */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }}>
            By Province
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '340px', overflowY: 'auto' }}>
            {provinceStats.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#9ca3af' }}>No data yet.</p>
            ) : (
              provinceStats.map(p => (
                <div
                  key={p.name}
                  onMouseEnter={() => setHoveredProvince(p.name)}
                  onMouseLeave={() => setHoveredProvince(null)}
                  style={{
                    backgroundColor: hoveredProvince === p.name ? '#f9fafb' : 'transparent',
                    borderRadius: '8px',
                    padding: '5px 6px',
                    transition: 'background-color 0.1s',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                    <p style={{ fontSize: '12px', fontWeight: 500, color: '#374151', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '110px' }}>
                      {p.name}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', flexShrink: 0, marginLeft: '4px' }}>
                      {p.conquered}/{p.total}
                    </p>
                  </div>
                  <div style={{ height: '4px', backgroundColor: '#f3f4f6', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${p.pct}%`,
                      backgroundColor: pctColor(p.pct),
                      borderRadius: '2px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}