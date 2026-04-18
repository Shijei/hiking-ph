'use client'

import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { X, ArrowRight, Mountains } from '@phosphor-icons/react'
import Link from 'next/link'

// ── Types ──────────────────────────────────────────────────────────────────────

interface Mountain {
  id: string
  name: string
  elevation: number
  provinces: string[]
}

type IslandGroup = 'Luzon' | 'Visayas' | 'Mindanao'

interface GeoFeature {
  type: 'Feature'
  properties: Record<string, string>
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

interface GeoCollection {
  type: 'FeatureCollection'
  features: GeoFeature[]
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

// ── Island group mapping ───────────────────────────────────────────────────────
const ISLAND_GROUPS: Record<string, IslandGroup> = {
  Abra: 'Luzon', Apayao: 'Luzon', Aurora: 'Luzon', Bataan: 'Luzon', Batanes: 'Luzon',
  Batangas: 'Luzon', Benguet: 'Luzon', Bulacan: 'Luzon', Cagayan: 'Luzon',
  'Camarines Norte': 'Luzon', 'Camarines Sur': 'Luzon', Catanduanes: 'Luzon',
  Cavite: 'Luzon', Ifugao: 'Luzon', 'Ilocos Norte': 'Luzon', 'Ilocos Sur': 'Luzon',
  Isabela: 'Luzon', Kalinga: 'Luzon', 'La Union': 'Luzon', Laguna: 'Luzon',
  Marinduque: 'Luzon', Masbate: 'Luzon', 'Metro Manila': 'Luzon',
  'Mountain Province': 'Luzon', 'Nueva Ecija': 'Luzon', 'Nueva Vizcaya': 'Luzon',
  'Occidental Mindoro': 'Luzon', 'Oriental Mindoro': 'Luzon', Palawan: 'Luzon',
  Pampanga: 'Luzon', Pangasinan: 'Luzon', Quezon: 'Luzon', Quirino: 'Luzon',
  Rizal: 'Luzon', Romblon: 'Luzon', Sorsogon: 'Luzon', Tarlac: 'Luzon',
  Zambales: 'Luzon', Albay: 'Luzon',

  Aklan: 'Visayas', Antique: 'Visayas', Biliran: 'Visayas', Bohol: 'Visayas',
  Capiz: 'Visayas', Cebu: 'Visayas', 'Eastern Samar': 'Visayas', Guimaras: 'Visayas',
  Iloilo: 'Visayas', Leyte: 'Visayas', 'Negros Occidental': 'Visayas',
  'Negros Oriental': 'Visayas', 'Northern Samar': 'Visayas', Samar: 'Visayas',
  Siquijor: 'Visayas', 'Southern Leyte': 'Visayas',

  'Agusan del Norte': 'Mindanao', 'Agusan del Sur': 'Mindanao', Basilan: 'Mindanao',
  Bukidnon: 'Mindanao', Camiguin: 'Mindanao', 'Davao de Oro': 'Mindanao',
  'Davao del Norte': 'Mindanao', 'Davao del Sur': 'Mindanao',
  'Davao Occidental': 'Mindanao', 'Davao Oriental': 'Mindanao',
  'Dinagat Islands': 'Mindanao', 'Lanao del Norte': 'Mindanao',
  'Lanao del Sur': 'Mindanao', 'Maguindanao del Norte': 'Mindanao',
  'Maguindanao del Sur': 'Mindanao', 'Misamis Occidental': 'Mindanao',
  'Misamis Oriental': 'Mindanao', 'North Cotabato': 'Mindanao',
  Sarangani: 'Mindanao', 'South Cotabato': 'Mindanao', 'Sultan Kudarat': 'Mindanao',
  Sulu: 'Mindanao', 'Surigao del Norte': 'Mindanao', 'Surigao del Sur': 'Mindanao',
  'Tawi-Tawi': 'Mindanao', 'Zamboanga del Norte': 'Mindanao',
  'Zamboanga del Sur': 'Mindanao', 'Zamboanga Sibugay': 'Mindanao',
}

// GADM name → our canonical name (GADM v4.1 quirks)
const GADM_ALIASES: Record<string, string> = {
  'National Capital Region': 'Metro Manila',
  'Compostela Valley': 'Davao de Oro',
  'Maguindanao': 'Maguindanao del Norte', // pre-split records
  'Western Samar': 'Samar',
}

// ── SVG canvas dimensions ─────────────────────────────────────────────────────
const W = 260
const H = 420

// Philippines geographic bounds
const LON_MIN = 116.0
const LON_MAX = 127.8
const LAT_MIN = 4.0
const LAT_MAX = 21.5

// ── Mercator projection ────────────────────────────────────────────────────────

function project(lon: number, lat: number): [number, number] {
  return [
    ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W,
    ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * H,
  ]
}

function ringsToPath(rings: number[][][]): string {
  return rings
    .map(ring =>
      ring
        .map(([lon, lat], i) => {
          const [x, y] = project(lon, lat)
          return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`
        })
        .join('') + 'Z'
    )
    .join('')
}

function featurePath(f: GeoFeature): string {
  if (f.geometry.type === 'Polygon') {
    return ringsToPath(f.geometry.coordinates as number[][][])
  }
  return (f.geometry.coordinates as number[][][][]).map(ringsToPath).join('')
}

// ── Province name extraction ───────────────────────────────────────────────────

function extractName(props: Record<string, string>): string {
  const raw = props.NAME_1 ?? props.name ?? props.PROVINCE ?? props.ADM1_EN ?? ''
  return GADM_ALIASES[raw] ?? raw
}

// ── Colors ────────────────────────────────────────────────────────────────────

function fillFor(pct: number): string {
  if (pct === 0)  return '#e2e8f0'
  if (pct < 25)   return '#fde68a'
  if (pct < 50)   return '#fbbf24'
  if (pct < 75)   return '#34d399'
  return '#10b981'
}

function strokeFor(pct: number): string {
  if (pct === 0)  return '#cbd5e1'
  if (pct < 25)   return '#f59e0b'
  if (pct < 50)   return '#d97706'
  if (pct < 75)   return '#059669'
  return '#047857'
}

// ── GeoJSON cache + loader ────────────────────────────────────────────────────

let geoCache: GeoCollection | null = null

async function loadGeo(): Promise<GeoCollection | null> {
  if (geoCache) return geoCache
  try {
    const r = await fetch('/data/ph-provinces.geojson')
    if (!r.ok) return null
    geoCache = await r.json()
    return geoCache
  } catch {
    return null
  }
}

// ── Province sheet ─────────────────────────────────────────────────────────────

interface SheetProps {
  province: ProvinceStats
  conqueredIds: Set<string>
  onClose: () => void
}

function ProvinceSheet({ province, conqueredIds, onClose }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'translateY(100%)'
    requestAnimationFrame(() => {
      el.style.transition = 'transform 0.26s ease'
      el.style.transform = 'translateY(0)'
    })
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  function close() {
    const el = ref.current
    if (!el) { onClose(); return }
    el.style.transform = 'translateY(100%)'
    setTimeout(onClose, 260)
  }

  const sorted = [...province.mountains].sort((a, b) => b.elevation - a.elevation)

  return (
    <>
      <div
        onClick={close}
        style={{ position: 'fixed', inset: 0, zIndex: 40, backgroundColor: 'rgba(0,0,0,0.35)' }}
      />
      <div
        ref={ref}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          backgroundColor: '#ffffff',
          borderTopLeftRadius: '20px', borderTopRightRadius: '20px',
          maxHeight: '72vh', display: 'flex', flexDirection: 'column',
          boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
        }}
      >
        <div style={{ width: '36px', height: '4px', borderRadius: '2px', backgroundColor: '#e5e7eb', margin: '12px auto 0', flexShrink: 0 }} />

        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '14px 20px 0', flexShrink: 0 }}>
          <div>
            <p style={{ fontSize: '18px', fontWeight: 700, letterSpacing: '-0.01em' }}>{province.name}</p>
            <p style={{ fontSize: '12px', color: '#9ca3af', marginTop: '2px' }}>{province.islandGroup}</p>
          </div>
          <button onClick={close} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '2px', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '14px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <p style={{ fontSize: '13px', color: '#374151' }}>
              <span style={{ fontWeight: 700 }}>{province.conquered}</span>
              <span style={{ color: '#9ca3af' }}> / {province.total} conquered</span>
            </p>
            <p style={{ fontSize: '13px', fontWeight: 700, color: strokeFor(province.pct) }}>
              {province.pct}%
            </p>
          </div>
          <div style={{ height: '6px', backgroundColor: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
            <div style={{
              height: '100%', width: `${province.pct}%`,
              backgroundColor: fillFor(province.pct),
              borderRadius: '3px', transition: 'width 0.4s ease',
            }} />
          </div>
        </div>

        <div style={{ height: '1px', backgroundColor: '#f3f4f6', margin: '16px 20px 0', flexShrink: 0 }} />

        <div style={{ overflowY: 'auto', padding: '12px 20px 24px', flex: 1 }}>
          {sorted.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#9ca3af', paddingTop: '8px' }}>No mountains catalogued.</p>
          ) : (
            sorted.map((m, i) => {
              const isConquered = conqueredIds.has(m.id)
              return (
                <Link
                  key={m.id}
                  href={`/mountains/${m.id}`}
                  onClick={close}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    textDecoration: 'none', color: 'inherit',
                    paddingTop: i === 0 ? 0 : '12px', paddingBottom: '12px',
                    borderBottom: i < sorted.length - 1 ? '1px solid #f9fafb' : 'none',
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
                      {m.elevation}m{isConquered ? ' · Conquered' : ''}
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

// ── Zoom / pan helpers ─────────────────────────────────────────────────────────

interface Viewport { x: number; y: number; scale: number }

const MIN_SCALE = 1
const MAX_SCALE = 8

function clamp(vp: Viewport): Viewport {
  const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, vp.scale))
  const maxX = (s - 1) * W * 0.5
  const maxY = (s - 1) * H * 0.5
  return {
    scale: s,
    x: Math.max(-maxX, Math.min(maxX, vp.x)),
    y: Math.max(-maxY, Math.min(maxY, vp.y)),
  }
}

function zoomAround(prev: Viewport, factor: number, cx: number, cy: number): Viewport {
  const s = Math.max(MIN_SCALE, Math.min(MAX_SCALE, prev.scale * factor))
  const ratio = s / prev.scale
  return clamp({
    scale: s,
    x: prev.x + (cx - W / 2) * (1 - ratio),
    y: prev.y + (cy - H / 2) * (1 - ratio),
  })
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function PhilippinesConquestMap({ mountains, conqueredIds }: Props) {
  const [geo, setGeo] = useState<GeoCollection | null>(null)
  const [geoLoading, setGeoLoading] = useState(true)
  const [selected, setSelected] = useState<ProvinceStats | null>(null)
  const [activeGroup, setActiveGroup] = useState<'All' | IslandGroup>('All')
  const [vp, setVp] = useState<Viewport>({ x: 0, y: 0, scale: 1 })

  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ px: number; py: number; vx: number; vy: number } | null>(null)
  const pinchRef = useRef<{ dist: number; cx: number; cy: number } | null>(null)
  const didDragRef = useRef(false)

  useEffect(() => {
    loadGeo().then(data => { setGeo(data); setGeoLoading(false) })
  }, [])

  // ── Province stats ───────────────────────────────────────────────────────────

  const stats = useMemo(() => {
    const map = new Map<string, ProvinceStats>()
    for (const m of mountains) {
      for (const prov of (m.provinces ?? [])) {
        if (!map.has(prov)) {
          map.set(prov, {
            name: prov,
            islandGroup: ISLAND_GROUPS[prov] ?? 'Luzon',
            total: 0, conquered: 0, pct: 0, mountains: [],
          })
        }
        const s = map.get(prov)!
        s.total++
        s.mountains.push(m)
        if (conqueredIds.has(m.id)) s.conquered++
      }
    }
    for (const s of map.values()) {
      s.pct = s.total > 0 ? Math.round((s.conquered / s.total) * 100) : 0
    }
    return map
  }, [mountains, conqueredIds])

  const totalConquered = conqueredIds.size
  const overallPct = mountains.length > 0 ? Math.round((totalConquered / mountains.length) * 100) : 0

  // ── SVG coordinate helper ────────────────────────────────────────────────────

  function svgPoint(clientX: number, clientY: number): [number, number] {
    const rect = svgRef.current!.getBoundingClientRect()
    return [
      ((clientX - rect.left) / rect.width) * W,
      ((clientY - rect.top) / rect.height) * H,
    ]
  }

  // ── Mouse / wheel ────────────────────────────────────────────────────────────

  const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
    e.preventDefault()
    const [cx, cy] = svgPoint(e.clientX, e.clientY)
    setVp(prev => zoomAround(prev, e.deltaY < 0 ? 1.2 : 1 / 1.2, cx, cy))
  }, [])

  function handlePointerDown(e: React.PointerEvent<SVGSVGElement>) {
    if (e.pointerType === 'touch') return
    svgRef.current?.setPointerCapture(e.pointerId)
    didDragRef.current = false
    dragRef.current = { px: e.clientX, py: e.clientY, vx: vp.x, vy: vp.y }
  }

  function handlePointerMove(e: React.PointerEvent<SVGSVGElement>) {
    if (!dragRef.current || e.pointerType === 'touch') return
    const drag = dragRef.current
    const rect = svgRef.current!.getBoundingClientRect()
    const dx = (e.clientX - drag.px) * (W / rect.width)
    const dy = (e.clientY - drag.py) * (H / rect.height)
    if (Math.abs(dx) + Math.abs(dy) > 2) didDragRef.current = true
    setVp(prev => clamp({ scale: prev.scale, x: drag.vx + dx, y: drag.vy + dy }))
  }

  function handlePointerUp() {
    dragRef.current = null
  }

  // ── Touch ────────────────────────────────────────────────────────────────────

  function handleTouchStart(e: React.TouchEvent<SVGSVGElement>) {
    didDragRef.current = false
    if (e.touches.length === 2) {
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      pinchRef.current = {
        dist: Math.hypot(dx, dy),
        cx: (e.touches[0].clientX + e.touches[1].clientX) / 2,
        cy: (e.touches[0].clientY + e.touches[1].clientY) / 2,
      }
    } else if (e.touches.length === 1) {
      dragRef.current = { px: e.touches[0].clientX, py: e.touches[0].clientY, vx: vp.x, vy: vp.y }
    }
  }

  function handleTouchMove(e: React.TouchEvent<SVGSVGElement>) {
    e.preventDefault()
    didDragRef.current = true
    if (e.touches.length === 2 && pinchRef.current) {
      const pinch = pinchRef.current
      const dx = e.touches[1].clientX - e.touches[0].clientX
      const dy = e.touches[1].clientY - e.touches[0].clientY
      const newDist = Math.hypot(dx, dy)
      const ratio = newDist / pinch.dist
      const [cx, cy] = svgPoint(pinch.cx, pinch.cy)
      pinchRef.current.dist = newDist
      setVp(prev => zoomAround(prev, ratio, cx, cy))
    } else if (e.touches.length === 1 && dragRef.current) {
      const drag = dragRef.current
      const rect = svgRef.current!.getBoundingClientRect()
      const dx = (e.touches[0].clientX - drag.px) * (W / rect.width)
      const dy = (e.touches[0].clientY - drag.py) * (H / rect.height)
      setVp(prev => clamp({ scale: prev.scale, x: drag.vx + dx, y: drag.vy + dy }))
    }
  }

  function handleTouchEnd(e: React.TouchEvent<SVGSVGElement>) {
    if (e.touches.length < 2) pinchRef.current = null
    if (e.touches.length === 0) dragRef.current = null
  }

  // ── Zoom buttons ─────────────────────────────────────────────────────────────

  function zoomIn()    { setVp(prev => zoomAround(prev, 1.5, W / 2, H / 2)) }
  function zoomOut()   { setVp(prev => prev.scale <= 1 ? prev : zoomAround(prev, 1 / 1.5, W / 2, H / 2)) }
  function zoomReset() { setVp({ x: 0, y: 0, scale: 1 }) }

  // ── Province click ────────────────────────────────────────────────────────────

  function handleProvinceClick(name: string) {
    if (didDragRef.current) return
    const s = stats.get(name)
    if (!s || s.total === 0) return
    setSelected(s)
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Summary strip */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px' }}>
        {[
          { label: 'Total',     value: mountains.length },
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
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {(['All', 'Luzon', 'Visayas', 'Mindanao'] as const).map(g => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            style={{
              fontSize: '12px', fontWeight: 500, padding: '5px 12px',
              borderRadius: '8px', cursor: 'pointer', fontFamily: 'inherit',
              border: activeGroup === g ? '1px solid #111827' : '1px solid #e5e7eb',
              backgroundColor: activeGroup === g ? '#111827' : '#ffffff',
              color: activeGroup === g ? '#ffffff' : '#6b7280',
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Map */}
      <div style={{ position: 'relative', backgroundColor: '#e0f2fe', borderRadius: '16px', overflow: 'hidden', border: '1px solid #bae6fd' }}>

        {/* Zoom controls */}
        <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {([
            { label: '+', action: zoomIn },
            { label: '−', action: zoomOut },
          ] as const).map(({ label, action }) => (
            <button
              key={label}
              onClick={action}
              style={{
                width: '32px', height: '32px',
                backgroundColor: 'rgba(255,255,255,0.92)',
                border: '1px solid #e2e8f0', borderRadius: '8px',
                cursor: 'pointer', fontSize: '18px', lineHeight: 1,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'inherit', fontWeight: 300, color: '#374151',
              }}
            >
              {label}
            </button>
          ))}
          {vp.scale > 1 && (
            <button
              onClick={zoomReset}
              style={{
                width: '32px', height: '32px',
                backgroundColor: 'rgba(255,255,255,0.92)',
                border: '1px solid #e2e8f0', borderRadius: '8px',
                cursor: 'pointer', fontSize: '9px', fontWeight: 600,
                color: '#6b7280', fontFamily: 'inherit',
              }}
            >
              Reset
            </button>
          )}
        </div>

        {geoLoading ? (
          <div style={{ height: '420px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '13px', color: '#94a3b8' }}>Loading map...</p>
          </div>
        ) : !geo ? (
          <div style={{ height: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '0 24px' }}>
            <Mountains size={32} color="#94a3b8" weight="duotone" />
            <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center' }}>Map data not found.</p>
            <p style={{ fontSize: '11px', color: '#cbd5e1', textAlign: 'center' }}>
              Download GADM Philippines Level 1 GeoJSON and save as /public/data/ph-provinces.geojson
            </p>
          </div>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', display: 'block', touchAction: 'none' }}
            onWheel={handleWheel}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <g
              transform={`translate(${W / 2 + vp.x},${H / 2 + vp.y}) scale(${vp.scale}) translate(${-W / 2},${-H / 2})`}
            >
              {geo.features.map((feature, i) => {
                const name = extractName(feature.properties)
                const s = stats.get(name)
                const pct = s?.pct ?? 0
                const hasMountains = (s?.total ?? 0) > 0
                const inGroup = activeGroup === 'All' || ISLAND_GROUPS[name] === activeGroup

                return (
                  <path
                    key={i}
                    d={featurePath(feature)}
                    fill={fillFor(pct)}
                    stroke={strokeFor(pct)}
                    strokeWidth={0.5 / vp.scale}
                    opacity={inGroup ? 1 : 0.2}
                    style={{ cursor: hasMountains ? 'pointer' : 'default' }}
                    onClick={() => handleProvinceClick(name)}
                  >
                    <title>{name}{s ? ` — ${s.conquered}/${s.total} conquered` : ''}</title>
                  </path>
                )
              })}
            </g>
          </svg>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '10px' }}>
        {[
          { color: '#e2e8f0', label: '0%' },
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
        Scroll or pinch to zoom · Drag to pan · Tap province for details
      </p>

      {selected && (
        <ProvinceSheet
          province={selected}
          conqueredIds={conqueredIds}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}