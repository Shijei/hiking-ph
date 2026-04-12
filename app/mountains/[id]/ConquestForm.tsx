'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Camera, X, ArrowRight } from '@phosphor-icons/react'
import { cleanText } from '@/lib/profanity'

interface Props {
  mountainId: string
  userId: string
  username: string
  mountainName: string
  conquered: boolean
  existingPhotoUrl: string | null
  conquestId: string | null
}

export default function ConquestForm({
  mountainId,
  userId,
  username,
  mountainName,
  conquered,
  existingPhotoUrl,
  conquestId,
}: Props) {
  const [currentConquestId, setCurrentConquestId] = useState<string | null>(conquestId)
  const [isConquered, setIsConquered] = useState(conquered)
  const [justConquered, setJustConquered] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [currentPhoto, setCurrentPhoto] = useState<string | null>(existingPhotoUrl)
  const [sharingToFeed, setSharingToFeed] = useState(false)
  const [caption, setCaption] = useState('')

  useEffect(() => {
    setCurrentPhoto(existingPhotoUrl)
  }, [existingPhotoUrl])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const updateInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const displayName = mountainName.replace(/^Mount\s+/i, 'Mt. ')

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
    setError(null)
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    if (updateInputRef.current) updateInputRef.current.value = ''
  }

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null
    const supabase = createClient()
    const ext = photoFile.name.split('.').pop()
    const path = `${userId}/${mountainId}-${Date.now()}.${ext}`
    const { error: uploadError } = await supabase.storage
      .from('conquest-photos')
      .upload(path, photoFile, { upsert: true })
    if (uploadError) {
      setError(`Photo upload failed: ${uploadError.message}`)
      return null
    }
    const { data } = supabase.storage.from('conquest-photos').getPublicUrl(path)
    return data.publicUrl
  }

  const handleConquer = async () => {
    if (!photoFile) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const photo_url = await uploadPhoto()
    if (!photo_url) {
      setLoading(false)
      return
    }

    const { data: inserted, error: insertError } = await supabase
      .from('conquests')
      .insert({ mountain_id: mountainId, user_id: userId, photo_url })
      .select('id')
      .single()

    if (insertError) {
      setError(`Could not save conquest: ${insertError.message}`)
      setLoading(false)
      return
    }

    setCurrentConquestId(inserted.id)
    setIsConquered(true)
    setJustConquered(true)
    setCurrentPhoto(photo_url)
    clearPhoto()
    setLoading(false)
  }

  const handleUpdatePhoto = async () => {
    if (!photoFile || !currentConquestId) return
    setLoading(true)
    setError(null)
    const supabase = createClient()

    const photo_url = await uploadPhoto()
    if (!photo_url) {
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('conquests')
      .update({ photo_url })
      .eq('id', currentConquestId)

    if (updateError) {
      setError(`Could not update photo: ${updateError.message}`)
      setLoading(false)
      return
    }

    setCurrentPhoto(photo_url)
    clearPhoto()
    setLoading(false)
  }

  const handleUndo = async () => {
    setLoading(true)
    const supabase = createClient()
    await supabase
      .from('conquests')
      .delete()
      .eq('mountain_id', mountainId)
      .eq('user_id', userId)
    setIsConquered(false)
    setJustConquered(false)
    setCurrentPhoto(null)
    setLoading(false)
    router.refresh()
  }

  const handleShareToFeed = async () => {
    setSharingToFeed(true)
    const supabase = createClient()

    // Store the user's custom caption if provided, otherwise null
    const cleanedCaption = caption.trim() ? await cleanText(caption.trim()) : null

    await supabase.from('posts').insert({
      user_id: userId,
      body: cleanedCaption,
      mountain_id: mountainId,
      image_url: currentPhoto ?? null,
      is_conquest: true,
    })
    setSharingToFeed(false)
    setJustConquered(false)
    setCaption('')
    router.refresh()
  }

  const handleSkipShare = () => {
    setJustConquered(false)
    router.refresh()
  }

  if (justConquered) {
    return (
      <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px' }}>
        <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803d', marginBottom: '4px' }}>
          Conquest logged!
        </p>
        <p style={{ fontSize: '13px', color: '#166534', marginBottom: '12px' }}>
          Share this to the community feed?
        </p>

        {currentPhoto && (
          <img
            src={currentPhoto}
            alt=""
            style={{ width: '100%', borderRadius: '8px', marginBottom: '12px', maxHeight: '140px', objectFit: 'cover', display: 'block' }}
          />
        )}

        {/* Optional caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder={`Add a caption... (optional)`}
          rows={2}
          style={{
            width: '100%',
            fontSize: '13px',
            padding: '9px 12px',
            border: '1px solid #bbf7d0',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,255,255,0.7)',
            fontFamily: 'inherit',
            resize: 'none',
            outline: 'none',
            marginBottom: '12px',
            color: '#374151',
          }}
        />

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={handleShareToFeed}
            disabled={sharingToFeed}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              backgroundColor: '#15803d',
              color: '#ffffff',
              padding: '10px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              opacity: sharingToFeed ? 0.5 : 1,
              fontFamily: 'inherit',
            }}
          >
            {sharingToFeed ? 'Posting...' : 'Post to Feed'}
            {!sharingToFeed && <ArrowRight size={13} />}
          </button>
          <button
            onClick={handleSkipShare}
            disabled={sharingToFeed}
            style={{
              padding: '10px 16px',
              backgroundColor: 'transparent',
              color: '#6b7280',
              border: '1px solid #d1d5db',
              borderRadius: '10px',
              fontSize: '13px',
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Skip
          </button>
        </div>
      </div>
    )
  }

  if (isConquered) {
    return (
      <div>
        <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '14px', padding: '16px', marginBottom: '10px' }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#15803d', marginBottom: '12px' }}>
            Conquered!
          </p>

          {currentPhoto && !photoPreview && (
            <img
              src={currentPhoto}
              alt="Summit photo"
              style={{ width: '100%', borderRadius: '10px', maxHeight: '220px', objectFit: 'cover', marginBottom: '12px', display: 'block' }}
            />
          )}

          {photoPreview && (
            <div style={{ position: 'relative', marginBottom: '12px' }}>
              <img
                src={photoPreview}
                alt="New photo preview"
                style={{ width: '100%', borderRadius: '10px', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
              />
              <button
                type="button"
                onClick={clearPhoto}
                style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '26px', height: '26px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={13} color="#fff" weight="bold" />
              </button>
            </div>
          )}

          {error && (
            <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '10px' }}>{error}</p>
          )}

          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#15803d', cursor: 'pointer', marginBottom: photoFile ? '10px' : '0' }}>
            <Camera size={15} />
            {currentPhoto ? 'Replace summit photo' : 'Add summit photo'}
            <input ref={updateInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
          </label>

          {photoFile && (
            <button
              onClick={handleUpdatePhoto}
              disabled={loading}
              style={{ display: 'block', width: '100%', marginTop: '8px', backgroundColor: '#15803d', color: '#fff', padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 500, border: 'none', cursor: 'pointer', opacity: loading ? 0.5 : 1, fontFamily: 'inherit' }}
            >
              {loading ? 'Saving...' : 'Save Photo'}
            </button>
          )}
        </div>

        <button
          onClick={handleUndo}
          disabled={loading}
          style={{ fontSize: '12px', color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: 'inherit', padding: 0 }}
        >
          Remove conquest
        </button>
      </div>
    )
  }

  return (
    <div>
      {!photoPreview ? (
        <label
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            height: '140px',
            border: '2px dashed #e5e7eb',
            borderRadius: '12px',
            cursor: 'pointer',
            backgroundColor: '#f9fafb',
            marginBottom: '12px',
          }}
        >
          <Camera size={28} color="#9ca3af" />
          <p style={{ fontSize: '13px', fontWeight: 500, color: '#6b7280' }}>Upload summit photo</p>
          <p style={{ fontSize: '11px', color: '#9ca3af' }}>Required to log your conquest</p>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: 'none' }} />
        </label>
      ) : (
        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <img
            src={photoPreview}
            alt="Summit photo preview"
            style={{ width: '100%', borderRadius: '12px', maxHeight: '220px', objectFit: 'cover', display: 'block' }}
          />
          <button
            type="button"
            onClick={clearPhoto}
            style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={13} color="#fff" weight="bold" />
          </button>
        </div>
      )}

      {error && (
        <p style={{ fontSize: '12px', color: '#ef4444', marginBottom: '10px' }}>{error}</p>
      )}

      <button
        onClick={handleConquer}
        disabled={loading || !photoFile}
        style={{
          display: 'block',
          width: '100%',
          backgroundColor: photoFile ? '#111827' : '#e5e7eb',
          color: photoFile ? '#ffffff' : '#9ca3af',
          padding: '14px',
          borderRadius: '12px',
          fontSize: '15px',
          fontWeight: 600,
          border: 'none',
          cursor: photoFile ? 'pointer' : 'not-allowed',
          opacity: loading ? 0.5 : 1,
          fontFamily: 'inherit',
          transition: 'background-color 0.15s',
        }}
      >
        {loading ? 'Saving...' : 'Log Conquest'}
      </button>
    </div>
  )
}