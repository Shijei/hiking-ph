'use client'

import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const handleGoogleLogin = async () => {
    const supabase = createClient()
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <main className="max-w-md mx-auto px-4 py-20 text-center">
      <h1 className="text-3xl font-bold mb-2">Welcome to Hiking PH</h1>
      <p className="text-gray-500 mb-8">Sign in to write reviews and join the community.</p>
      <button
        onClick={handleGoogleLogin}
        className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition"
      >
        Continue with Google
      </button>
    </main>
  )
}