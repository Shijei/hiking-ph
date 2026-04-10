'use client'

import Link from 'next/link'
import { Mountains, CheckCircle } from '@phosphor-icons/react'

interface PulseMountain {
  id: string
  name: string
  elevation: number
  postCount: number
}

interface Props {
  mountains: PulseMountain[]
  conqueredIds: Set<string>
}

export default function TrailPulseStrip({ mountains, conqueredIds }: Props) {
  if (mountains.length === 0) return null

  return (
    <div style={{ marginBottom: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', paddingLeft: '2px' }}>
        <span style={{ fontSize: '11px', fontWeight: 600, color: '#9ca3af', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          Trail Pulse
        </span>
        <span style={{ fontSize: '10px', color: '#d1d5db' }}>·</span>
        <span style={{ fontSize: '11px', color: '#9ca3af' }}>active this week</span>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '4px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {mountains.map((mountain) => {
          const conquered = conqueredIds.has(mountain.id)
          return (
            <Link
              key={mountain.id}
              href={`/mountains/${mountain.id}?from=feed`}
              style={{
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#ffffff',
                borderRadius: '14px',
                padding: '10px 12px',
                width: '88px',
                textDecoration: 'none',
                color: 'inherit',
                border: conquered ? '1px solid #d1fae5' : '1px solid #f0f0f0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                position: 'relative',
              }}
            >
              {conquered && (
                <CheckCircle
                  size={13}
                  weight="fill"
                  color="#10b981"
                  style={{ position: 'absolute', top: '6px', right: '6px' }}
                />
              )}

              <Mountains
                size={22}
                weight="duotone"
                style={{ color: conquered ? '#10b981' : '#6b7280', marginBottom: '5px' }}
              />

              <p style={{
                fontSize: '10px',
                fontWeight: 500,
                textAlign: 'center',
                lineHeight: 1.3,
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                marginBottom: '4px',
                color: '#111827',
              }}>
                {mountain.name.replace(/^Mount\s+/i, 'Mt. ')}
              </p>

              <span style={{
                fontSize: '10px',
                color: '#ffffff',
                backgroundColor: '#6b7280',
                borderRadius: '20px',
                padding: '1px 6px',
                fontWeight: 500,
              }}>
                {mountain.postCount} {mountain.postCount === 1 ? 'post' : 'posts'}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}