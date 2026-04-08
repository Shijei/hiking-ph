'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  const formRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(e.target as Node)) {
        if (!body.trim() && !selectedMountain) setExpanded(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [body, selectedMountain])

  // Mountain search
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!body.trim() || !selectedMountain) return
    setLoading(true)
    const supabase = createClient()
    await supabase.from('posts').insert({
      user_id: userId,
      body,
      mountain_id: selectedMountain.id,
    })
    setBody('')
    setSelectedMountain(null)
    setExpanded(false)
    setLoading(false)
    router.refresh()
  }

  // Collapsed state
  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '12px 16px', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', cursor: 'text' }}
      >
        <p style={{ fontSize: '14px', color: '#9ca3af' }}>Share a hiking story, tip, or question...</p>
      </div>
    )
  }

  // Expanded state
  return (
    <div
      ref={formRef}
      style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '16px', marginBottom: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
    >
      <form onSubmit={handleSubmit}>

        {/* Textarea */}
        <textarea
          autoFocus
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          rows={3}
          placeholder="Share a hiking story, tip, or question..."
          style={{ width: '100%', fontSize: '14px', border: 'none', outline: 'none', resize: 'none', marginBottom: '12px', fontFamily: 'inherit', backgroundColor: 'transparent' }}
        />

        <div style={{ height: '1px', backgroundColor: '#f3f4f6', marginBottom: '12px' }} />

        {/* Mountain selector */}
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

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
            {selectedMountain ? '' : 'Tag a mountain (optional)'}
          </p>
          <button
            type="submit"
            disabled={loading || !body.trim()}
            style={{ backgroundColor: '#111827', color: '#ffffff', padding: '7px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading || !body.trim() || !selectedMountain ? 0.5 : 1, fontFamily: 'inherit' }}
          >
            {loading ? 'Posting...' : 'Post'}
          </button>
        </div>

      </form>
    </div>
  )
}