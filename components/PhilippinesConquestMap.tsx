'use client'

import { useMemo, useState, useEffect, useRef } from 'react'
import { X, ArrowRight, Mountains } from '@phosphor-icons/react'
import Link from 'next/link'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface Mountain {
  id: string
  name: string
  elevation: number
  provinces: string[]
  coordinates?: unknown
}

interface ProvinceData {
  name: string
  islandGroup: 'Luzon' | 'Visayas' | 'Mindanao'
  pathData: string
}

interface ProvinceStats {
  name: string
  islandGroup: string
  total: number
  conquered: number
  pct: number
  mountains: Mountain[]
}

interface Props {
  mountains: Mountain[]
  conqueredIds: Set<string>
}

// ---------------------------------------------------------------------------
// Province path data — loaded from public/data/provinces.json at runtime.
// ---------------------------------------------------------------------------
let provinceCache: ProvinceData[] | null = null

async function loadProvinces(): Promise<ProvinceData[]> {
  if (provinceCache) return provinceCache
  try {
    const res = await fetch('/data/provinces.json')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    provinceCache = await res.json()
    return provinceCache!
  } catch {
    return []
  }
}

// ---------------------------------------------------------------------------
// Island silhouette paths — visual base layer on viewBox "0 0 260 420".
// These give the correct Philippines shape. Province rects are overlaid on
// top at reduced opacity to show conquest coloring without obscuring the
// country outline.
// ---------------------------------------------------------------------------
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
  { id: 'masbate',  d: 'M 162,195 174,193 178,204 171,212 158,208 Z' },
  { id: 'siquijor', d: 'M 163,283 169,283 169,287 163,287 Z' },
  { id: 'camiguin', d: 'M 192,258 197,258 197,262 192,262 Z' },
  { id: 'basilan',  d: 'M 130,355 138,353 140,360 132,362 Z' },
  { id: 'sulu',     d: 'M 110,363 116,361 114,368 108,368 Z' },
  { id: 'tawi',     d: 'M 90,383 99,381 97,390 88,390 Z' },
  { id: 'batanes',  d: 'M 129,10 134,10 134,16 129,16 Z' },
  { id: 'catandu',  d: 'M 176,172 182,172 182,181 176,181 Z' },
  { id: 'dinagat',  d: 'M 213,248 219,248 219,258 213,258 Z' },
]

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------
function pctFill(pct: number): string {
  if (pct === 0)  return 'transparent'
  if (pct < 25)   return '#fde68a'
  if (pct < 50)   return '#fbbf24'
  if (pct < 75)   return '#34d399'
  return '#10b981'
}

function pctStroke(pct: number): string {
  if (pct === 0)  return 'transparent'
  if (pct < 25)   return '#f59e0b'
  if (pct < 50)   return '#d97706'
  if (pct < 75)   return '#059669'
  return '#047857'
}

// ---------------------------------------------------------------------------
// Bottom sheet
// ---------------------------------------------------------------------------
interface SheetProps {
  province: ProvinceStats
  conqueredIds: Set<string>
  onClose: () => void
}

function ProvinceSheet({ province, conqueredIds, onClose }: SheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    const el = sheetRef.current
    if (!el) return
    el.style.transform = 'translateY(100%)'
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.28s ease'
      el.style.transform = 'translateY(0)'
    })
  }, [])

  function handleClose() {
    const el = sheetRef.current
    if (!el) { onClose(); return }
    el.style.transform = 'translateY(100%)'
    setTimeout(onClose, 280)
  }

  const sortedMountains = [...province.mountains].sort((a, b) => b.elevation - a.elevation)

  return (
    <>
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.35)' }}
      />
      <div
        ref={sheetRef}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          maxHeight: '72vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{
          width: '36px', height: '4px', borderRadius: '2px',
          backgroundColor: '#e5e7eb', margin: '12px auto 0', flexShrink: 0,
        }} />

        <div style={{
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
          padding: '14px 20px 0', flexShrink: 0,
        }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>{province.name}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{province.islandGroup}</p>
          </div>
          <button
            onClick={handleClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px', display: 'flex' }}
          >
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '13px', color: '#374151' }}>
              <span style={{ fontWeight: 700 }}>{province.conquered}</span>
              <span style={{ color: '#9ca3af' }}> / {province.total} conquered</span>
            </p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: pctStroke(province.pct) === 'transparent' ? '#9ca3af' : pctStroke(province.pct) }}>
              {province.pct}%
            </p>
          </div>
          <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${province.pct}%`,
              backgroundColor: pctFill(province.pct) === 'transparent' ? '#e5e7eb' : pctFill(province.pct),
              borderRadius: '3px',
              transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '16px 20px 0', flexShrink: 0 }} />

        <div style={{ overflowY: 'auto', padding: '12px 20px 24px', flex: 1 }}>
          {sortedMountains.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9ca3af', paddingTop: '8px' }}>
              No mountains catalogued for this province.
            </p>
          ) : (
            sortedMountains.map((m, i) => {
              const isConquered = conqueredIds.has(m.id)
              return (
                <Link
                  key={m.id}
                  href={`/mountains/${m.id}`}
                  onClick={handleClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    textDecoration: 'none', color: 'inherit',
                    paddingTop: i === 0 ? 0 : '12px',
                    paddingBottom: '12px',
                    borderBottom: i < sortedMountains.length - 1 ? '1px solid #f9fafb' : 'none',
                  }}
                >
                  <div style={{
                    width: '34px', height: '34px', borderRadius: '10px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backgroundColor: isConquered ? '#d1fae5' : '#f3f4f6',
                  }}>
                    <Mountains size={17} weight="duotone" color={isConquered ? '#10b981' : '#6b7280'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '13px', fontWeight: 500 }}>
                      {m.name.replace(/^Mount\s+/i, 'Mt. ')}
                    </p>
                    <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '1px' }}>
                      {m.elevation}m{isConquered ? ' · ✓ Conquered' : ''}
                    </p>
                  </div>
                  <ArrowRight size={14} color="#d1d5db" />
                </Link>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------
export default function PhilippinesConquestMap({ mountains, conqueredIds }: Props) {
  const [provinceShapes, setProvinceShapes] = useState<ProvinceData[]>([])
  const [shapesLoading, setShapesLoading] = useState(true)
  const [selectedProvince, setSelectedProvince] = useState<ProvinceStats | null>(null)
  const [activeGroup, setActiveGroup] = useState<'All' | 'Luzon' | 'Visayas' | 'Mindanao'>('All')

  useEffect(() => {
    loadProvinces().then(data => {
      setProvinceShapes(data)
      setShapesLoading(false)
    })
  }, [])

  const provinceStats = useMemo((): Map<string, ProvinceStats> => {
    const map = new Map<string, ProvinceStats>()

    for (const shape of provinceShapes) {
      if (!map.has(shape.name)) {
        map.set(shape.name, {
          name: shape.name,
          islandGroup: shape.islandGroup,
          total: 0, conquered: 0, pct: 0, mountains: [],
        })
      }
    }

    for (const m of mountains) {
      for (const prov of (m.provinces ?? [])) {
        if (!map.has(prov)) {
          const shape = provinceShapes.find(s => s.name === prov)
          map.set(prov, {
            name: prov,
            islandGroup: shape?.islandGroup ?? 'Luzon',
            total: 0, conquered: 0, pct: 0, mountains: [],
          })
        }
        const stat = map.get(prov)!
        stat.total++
        stat.mountains.push(m)
        if (conqueredIds.has(m.id)) stat.conquered++
      }
    }

    for (const stat of map.values()) {
      stat.pct = stat.total > 0 ? Math.round((stat.conquered / stat.total) * 100) : 0
    }

    return map
  }, [provinceShapes, mountains, conqueredIds])

  const totalMountains = mountains.length
  const totalConquered = conqueredIds.size
  const overallPct = totalMountains > 0 ? Math.round((totalConquered / totalMountains) * 100) : 0

  const tappableNames = useMemo(() => {
    const names = new Set<string>()
    for (const [name, stat] of provinceStats.entries()) {
      if (stat.total > 0) names.add(name)
    }
    return names
  }, [provinceStats])

  function handleProvinceClick(provinceName: string) {
    const stats = provinceStats.get(provinceName)
    if (!stats || stats.total === 0) return
    setSelectedProvince(stats)
  }

  return (
    <>
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Total',     value: totalMountains },
          { label: 'Conquered', value: totalConquered },
          { label: 'Overall',   value: `${overallPct}%` },
        ].map(s => (
          <div key={s.label} style={{
            backgroundColor: '#ffffff', borderRadius: '12px',
            padding: '12px', textAlign: 'center', border: '1px solid #f3f4f6',
          }}>
            <p style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>{s.value}</p>
            <p style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Island group filter */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '16px' }}>
        {(['All', 'Luzon', 'Visayas', 'Mindanao'] as const).map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            style={{
              fontSize: '12px', fontWeight: 500,
              padding: '5px 12px', borderRadius: '8px', cursor: 'pointer',
              border: activeGroup === g ? '1px solid #111827' : '1px solid #e5e7eb',
              backgroundColor: activeGroup === g ? '#111827' : '#ffffff',
              color: activeGroup === g ? '#ffffff' : '#6b7280',
              fontFamily: 'inherit',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{
        backgroundColor: '#e0f2fe',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #bae6fd',
      }}>
        {shapesLoading ? (
          <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '13px', color: '#9ca3af' }}>Loading map...</p>
          </div>
        ) : (
          <svg
            viewBox="0 0 260 420"
            style={{ width: '100%', display: 'block' }}
            aria-label="Philippines conquest map"
          >
            {/* Layer 1 — island silhouettes (visual reference) */}
            {ISLAND_PATHS.map(island => (
              <path
                key={island.id}
                d={island.d}
                fill="#cbd5e1"
                stroke="#94a3b8"
                strokeWidth="0.6"
                strokeLinejoin="round"
              />
            ))}

            {/* Layer 2 — province conquest overlays */}
            {/* Provinces with mountains: semi-transparent color fill */}
            {/* Provinces without: fully transparent but still tappable */}
            {provinceShapes.map(shape => {
              const stats      = provinceStats.get(shape.name)
              const isVisible  = activeGroup === 'All' || shape.islandGroup === activeGroup
              const pct        = stats?.pct ?? 0
              const fill       = pctFill(pct)
              const isTappable = tappableNames.has(shape.name)

              return (
                <path
                  key={shape.name}
                  d={shape.pathData}
                  fill={fill}
                  stroke={fill === 'transparent' ? 'none' : pctStroke(pct)}
                  strokeWidth="0.3"
                  opacity={isVisible && fill !== 'transparent' ? 0.55 : 0}
                  style={{ cursor: isTappable ? 'pointer' : 'default' }}
                  onClick={() => isTappable && handleProvinceClick(shape.name)}
                >
                  <title>
                    {shape.name}{stats ? ` — ${stats.conquered}/${stats.total}` : ''}
                  </title>
                </path>
              )
            })}

            {/* Invisible tap targets for provinces with 0 conquests */}
            {provinceShapes
              .filter(s => tappableNames.has(s.name) && (provinceStats.get(s.name)?.pct ?? 0) === 0)
              .map(shape => (
                <path
                  key={`tap-${shape.name}`}
                  d={shape.pathData}
                  fill="transparent"
                  stroke="none"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleProvinceClick(shape.name)}
                />
              ))
            }
          </svg>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
        {[
          { color: '#cbd5e1', label: '0%' },
          { color: '#fde68a', label: '1–24%' },
          { color: '#fbbf24', label: '25–49%' },
          { color: '#34d399', label: '50–74%' },
          { color: '#10b981', label: '75–100%' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: l.color, flexShrink: 0 }} />
            <p style={{ fontSize: '11px', color: '#6b7280' }}>{l.label}</p>
          </div>
        ))}
      </div>

      <p style={{ fontSize: '11px', color: '#d1d5db', marginTop: '6px' }}>
        Tap a highlighted province to see details
      </p>

      {selectedProvince && (
        <ProvinceSheet
          province={selectedProvince}
          conqueredIds={conqueredIds}
          onClose={() => setSelectedProvince(null)}
        />
      )}
    </>
  )
}