'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Image, X, PencilSimple } from '@phosphor-icons/react'
import { cleanText } from '@/lib/profanity'

interface Props {
  userId: string
}

interface Mountain {
  id: string
  name: string
  elevation: number
}

function formatMountainName(name: string) {
  return name.replace(/^Mount\s+/i, 'Mt. ')
}

export default function PostForm({ userId }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [body, setBody] = useState('')
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [mountains, setMountains] = useState<Mountain[]>([])
  const [selectedMountain, setSelectedMountain] = useState<Mountain | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        if (!body.trim() && !selectedMountain && !imageFile) setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [body, selectedMountain, imageFile])

  useEffect(() => {
    if (search.length < 2) { setMountains([]); setShowDropdown(false); return }
    const timeout = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('mountains')
        .select('id, name, elevation')
        .ilike('name', `%${search}%`)
        .limit(5)
      setMountains(data ?? [])
      setShowDropdown(true)
    }, 250)
    return () => clearTimeout(timeout)
  }, [search])

  const handleSelectMountain = (mountain: Mountain) => {
    setSelectedMountain(mountain)
    setSearch('')
    setMountains([])
    setShowDropdown(false)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const removeImage = () => {
    setImageFile(null)
    setImagePreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim()) return
    setLoading(true)
    const supabase = createClient()

    let image_url: string | null = null

    if (imageFile) {
      const ext = imageFile.name.split('.').pop()
      const path = `${userId}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('post-images')
        .upload(path, imageFile)

      if (!uploadError) {
        const { data: urlData } = supabase.storage.from('post-images').getPublicUrl(path)
        image_url = urlData.publicUrl
      }
    }

    const cleanedBody = await cleanText(body)

    await supabase.from('posts').insert({
      user_id: userId,
      body: cleanedBody,
      mountain_id: selectedMountain?.id ?? null,
      image_url,
    })

    setBody('')
    setSelectedMountain(null)
    setImageFile(null)
    setImagePreview(null)
    setExpanded(false)
    setLoading(false)
    router.refresh()
  }

  // Collapsed: slim single-line compose bar
  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#ffffff',
          borderRadius: '999px',
          padding: '10px 16px',
          cursor: 'text',
          boxShadow: '0 1px 3px rgba(0,0,0,0.07)',
          border: '1px solid #f0f0f0',
        }}
      >
        <PencilSimple size={15} color="#9ca3af" weight="bold" />
        <p style={{ fontSize: '13px', color: '#9ca3af', flex: 1 }}>
          Share a hike, tip, or story...
        </p>
      </div>
    )
  }

  // Expanded: full form
  return (
    <div
      ref={formRef}
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '16px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0',
      }}
    >
      <form onSubmit={handleSubmit}>
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          placeholder="Share a hiking story, tip, or question..."
          style={{
            width: '100%', fontSize: '14px', border: 'none', outline: 'none',
            resize: 'none', marginBottom: '12px', fontFamily: 'inherit',
            backgroundColor: 'transparent',
          }}
        />

        {imagePreview && (
          <div style={{ position: 'relative', marginBottom: '12px', borderRadius: '10px', overflow: 'hidden', display: 'inline-block' }}>
            <img src={imagePreview} alt="Preview" style={{ maxHeight: '180px', maxWidth: '100%', display: 'block', borderRadius: '10px' }} />
            <button
              type="button"
              onClick={removeImage}
              style={{ position: 'absolute', top: '6px', right: '6px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={13} color="#fff" weight="bold" />
            </button>
          </div>
        )}

        <div style={{ height: '1px', backgroundColor: '#f3f4f6', marginBottom: '12px' }} />

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          {selectedMountain ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '7px 12px' }}>
              <p style={{ fontSize: '13px', fontWeight: 500 }}>
                {formatMountainName(selectedMountain.name)}
                <span style={{ color: '#9ca3af', fontWeight: 400, marginLeft: '6px' }}>{selectedMountain.elevation}m</span>
              </p>
              <button
                type="button"
                onClick={() => setSelectedMountain(null)}
                style={{ fontSize: '12px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Remove
              </button>
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tag a mountain..."
                style={{ width: '100%', fontSize: '13px', padding: '7px 12px', border: '1px solid #e5e7eb', borderRadius: '8px', backgroundColor: '#f9fafb', fontFamily: 'inherit', outline: 'none' }}
              />
              {showDropdown && mountains.length > 0 && (
                <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '10px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', zIndex: 50, marginTop: '4px', overflow: 'hidden' }}>
                  {mountains.map((mountain, i) => (
                    <button
                      key={mountain.id}
                      type="button"
                      onClick={() => handleSelectMountain(mountain)}
                      style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', fontSize: '13px', background: 'none', border: 'none', borderBottom: i < mountains.length - 1 ? '1px solid #f3f4f6' : 'none', cursor: 'pointer', fontFamily: 'inherit' }}
                    >
                      <span style={{ fontWeight: 500 }}>{formatMountainName(mountain.name)}</span>
                      <span style={{ color: '#9ca3af', marginLeft: '6px' }}>{mountain.elevation}m</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={!!imageFile}
              style={{ background: 'none', border: 'none', cursor: imageFile ? 'not-allowed' : 'pointer', color: imageFile ? '#d1d5db' : '#9ca3af', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              <Image size={18} weight="regular" />
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
            {!selectedMountain && (
              <p style={{ fontSize: '12px', color: '#9ca3af' }}>Tag a mountain (optional)</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !body.trim()}
            style={{ backgroundColor: '#111827', color: '#ffffff', padding: '7px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading || !body.trim() ? 0.5 : 1, fontFamily: 'inherit' }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </form>
    </div>
  )
}