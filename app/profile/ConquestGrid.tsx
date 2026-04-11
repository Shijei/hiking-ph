'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mountains, X, ArrowRight } from '@phosphor-icons/react'
import Link from 'next/link'

interface ConquestItem {
  id: string
  mountain_id: string
  conquered_at: string
  photo_url: string | null
  mountains: {
    name: string
    elevation: number
    provinces: string[] | null
  }
}

interface GalleryImage {
  url: string
  source: 'conquest' | 'post'
  created_at: string
}

interface Props {
  conquests: ConquestItem[]
  userId: string
}

export default function ConquestGrid({ conquests, userId }: Props) {
  const [selected, setSelected] = useState<ConquestItem | null>(null)
  const [images, setImages] = useState<GalleryImage[]>([])
  const [loadingGallery, setLoadingGallery] = useState(false)

  const handleOpen = async (conquest: ConquestItem) => {
    setSelected(conquest)
    setLoadingGallery(true)

    const supabase = createClient()
    const { data: posts } = await supabase
      .from('posts')
      .select('image_url, created_at')
      .eq('user_id', userId)
      .eq('mountain_id', conquest.mountain_id)
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })

    const all: GalleryImage[] = []

    if (conquest.photo_url) {
      all.push({ url: conquest.photo_url, source: 'conquest', created_at: conquest.conquered_at })
    }

    posts?.forEach((p) => {
      if (p.image_url) {
        all.push({ url: p.image_url, source: 'post', created_at: p.created_at })
      }
    })

    setImages(all)
    setLoadingGallery(false)
  }

  const handleClose = () => {
    setSelected(null)
    setImages([])
  }

  const mountainDisplayName = (name: string) => name.replace(/^Mount\s+/i, 'Mt. ')

  if (conquests.length === 0) {
    return (
      <div style={{ padding: '16px 0', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>No mountains conquered yet.</p>
        <Link
          href="/explore/mountains"
          style={{ fontSize: '13px', color: '#111827', textDecoration: 'underline', display: 'inline-block', marginTop: '4px' }}
        >
          Start exploring
        </Link>
      </div>
    )
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', marginBottom: '16px' }}>
        {conquests.map((conquest) => (
          <button
            key={conquest.id}
            onClick={() => handleOpen(conquest)}
            style={{
              display: 'block',
              position: 'relative',
              aspectRatio: '1 / 1',
              borderRadius: '10px',
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              backgroundColor: '#1c1c2e',
            }}
          >
            {conquest.photo_url ? (
              <img
                src={conquest.photo_url}
                alt={conquest.mountains.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1c1c2e 0%, #2d3561 100%)',
              }}>
                <Mountains size={24} color="rgba(255,255,255,0.25)" weight="duotone" />
              </div>
            )}
            {/* Overlay */}
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '6px 8px',
              background: 'linear-gradient(transparent, rgba(0,0,0,0.72))',
            }}>
              <p style={{ fontSize: '10px', fontWeight: 500, color: '#ffffff', lineHeight: 1.3, textAlign: 'left' }}>
                {mountainDisplayName(conquest.mountains.name)}
              </p>
              <p style={{ fontSize: '9px', color: 'rgba(255,255,255,0.65)', textAlign: 'left' }}>
                {conquest.mountains.elevation}m
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Gallery modal */}
      {selected && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={handleClose}
        >
          <div
            style={{
              backgroundColor: '#111827',
              maxWidth: '480px',
              width: '100%',
              margin: 'auto',
              borderRadius: '16px',
              overflow: 'hidden',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 16px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
            }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
                  {mountainDisplayName(selected.mountains.name)}
                </p>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginTop: '1px' }}>
                  {selected.mountains.elevation}m
                  {selected.mountains.provinces?.length
                    ? ` · ${selected.mountains.provinces.join(', ')}`
                    : ''}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  href={`/mountains/${selected.mountain_id}`}
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.55)',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={handleClose}
                >
                  View <ArrowRight size={12} />
                </Link>
                <button
                  onClick={handleClose}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.55)', display: 'flex', padding: 0 }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Images */}
            <div style={{ overflowY: 'auto', padding: '12px' }}>
              {loadingGallery ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ aspectRatio: '1 / 1', backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: '8px' }} />
                  ))}
                </div>
              ) : images.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                  {images.map((img, i) => (
                    <div key={i} style={{ position: 'relative', aspectRatio: '1 / 1', borderRadius: '8px', overflow: 'hidden' }}>
                      <img
                        src={img.url}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                      {img.source === 'conquest' && (
                        <span style={{
                          position: 'absolute',
                          top: '5px',
                          left: '5px',
                          fontSize: '9px',
                          fontWeight: 600,
                          backgroundColor: 'rgba(21,128,61,0.85)',
                          color: '#ffffff',
                          padding: '1px 5px',
                          borderRadius: '4px',
                        }}>
                          SUMMIT
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.4)', textAlign: 'center', padding: '32px 0' }}>
                  No photos yet.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}