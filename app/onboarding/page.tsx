'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function OnboardingPage() {
  const [username, setUsername] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [userId, setUserId] = useState('')
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      setUserId(user.id)

      // Generate a suggested username from their Google name
      const fullName = user.user_metadata.full_name ?? 'hiker'
      const base = fullName
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '')
      const randomNum = Math.floor(Math.random() * 900) + 100
      setUsername(`${base}${randomNum}`)
      setChecking(false)
    }

    init()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

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

    // Check if username is taken
    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .single()

    if (existing) {
      setError('Username is already taken. Try another one.')
      setLoading(false)
      return
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ username })
      .eq('id', userId)

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    router.push('/')
  }

  if (checking) {
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-gray-400">Loading...</p>
      </main>
    )
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Set your username, hiker! 🏔️</h1>
        <p className="text-gray-500">
          This is how other hikers will find and know you in the community.
          You can change it later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="border rounded-xl p-6">
        <label className="block text-sm text-gray-600 mb-2">Username</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value.toLowerCase())}
          className="w-full border rounded-lg px-3 py-2 text-sm mb-1"
          placeholder="e.g. tristanotline847"
        />
        <p className="text-xs text-gray-400 mb-4">
          Only lowercase letters, numbers, dots and underscores.
        </p>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading || !username.trim()}
          className="w-full bg-black text-white py-3 rounded-xl text-sm hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? 'Saving...' : "Let's go! 🏔️"}
        </button>
      </form>
    </main>
  )
}