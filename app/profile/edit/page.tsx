'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function EditProfilePage() {
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [currentSongUrl, setCurrentSongUrl] = useState('')
  const [songFile, setSongFile] = useState<File | null>(null)
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const [pageLoading, setPageLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, song_url')
        .eq('id', user.id)
        .single()

      if (profile) {
        setUsername(profile.username ?? '')
        setBio(profile.bio ?? '')
        setCurrentSongUrl(profile.song_url ?? '')
      }
      setPageLoading(false)
    }
    init()
  }, [router])

  const handleSongChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('audio/')) {
      setError('Please upload an audio file.')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB.')
      return
    }

    setSongFile(file)
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (username.length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }

    if (!/^[a-z0-9._]+$/.test(username)) {
      setError('Only lowercase letters, numbers, dots and underscores allowed.')
      return
    }

    setLoading(true)
    const supabase = createClient()

    // Check username taken by someone else
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .neq('id', userId)
      .single()

    if (existing) {
      setError('Username is already taken.')
      setLoading(false)
      return
    }

    let songUrl = currentSongUrl

    // Upload new song if provided
    if (songFile) {
      const fileExt = songFile.name.split('.').pop()
      const filePath = `${userId}/song.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('profile-songs')
        .upload(filePath, songFile, { upsert: true })

      if (uploadError) {
        setError('Failed to upload song: ' + uploadError.message)
        setLoading(false)
        return
      }

      const { data: urlData } = supabase.storage
        .from('profile-songs')
        .getPublicUrl(filePath)

      songUrl = urlData.publicUrl
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username, bio, song_url: songUrl })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess('Profile updated!')
    setLoading(false)
    router.refresh()
  }

  if (pageLoading) {
    return <main className="px-4 py-6"><p className="text-gray-400">Loading...</p></main>
  }

  return (
    <main className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/profile" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">Edit Profile</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className="w-full border rounded-xl px-3 py-2 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            Only lowercase letters, numbers, dots and underscores.
          </p>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            placeholder="Tell the community about yourself..."
            className="w-full border rounded-xl px-3 py-2 text-sm resize-none"
          />
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm">
          <label className="block text-sm font-medium mb-1">
            Profile Song 🎵
          </label>
          <p className="text-xs text-gray-400 mb-3">
            Upload a song that plays when someone visits your profile. Max 10MB, 60 seconds recommended.
          </p>

          {currentSongUrl && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Current song:</p>
              <audio controls src={currentSongUrl} className="w-full h-8" />
            </div>
          )}

          <input
            type="file"
            accept="audio/*"
            onChange={handleSongChange}
            className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
          />

          {songFile && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {songFile.name} selected
            </p>
          )}
        </div>

        {error && <p className="text-red-500 text-sm px-1">{error}</p>}
        {success && <p className="text-green-600 text-sm px-1">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-3 rounded-2xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  )
}