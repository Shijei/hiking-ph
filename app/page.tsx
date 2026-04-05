import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function Home() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  const { data: agencies, error } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="p-10 text-red-500">Error: {error.message}</p>
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">🏔️ Hiking PH</h1>
          <p className="text-gray-500">Find and review hiking agencies in the Philippines.</p>
        </div>
        <div className="flex gap-3 items-center">
          <Link href="/mountains" className="border px-4 py-2 rounded-xl text-sm hover:shadow-md transition">
            🏔️ Browse Mountains
          </Link>
          <Link href="/feed" className="border px-4 py-2 rounded-xl text-sm hover:shadow-md transition">
            🌿 Community Feed
          </Link>
          {user ? (
            <Link href="/profile" className="text-sm text-gray-600 hover:underline">
              Hi, {user.user_metadata.full_name}
            </Link>
          ) : (
            <Link href="/login" className="bg-black text-white px-4 py-2 rounded-xl text-sm hover:bg-gray-800 transition">
              Sign in
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {agencies?.map((agency) => (
          <Link
            key={agency.id}
            href={`/agencies/${agency.id}`}
            className="block border rounded-xl p-5 hover:shadow-md transition"
          >
            <h2 className="text-xl font-semibold">{agency.name}</h2>
            <p className="text-gray-500 text-sm mt-1">{agency.description}</p>
            <div className="flex gap-4 mt-3 text-sm text-gray-400">
              <span>💰 {agency.price_range}</span>
              <span>📍 {agency.regions?.join(', ')}</span>
            </div>
          </Link>
        ))}
      </div>

    </main>
  )
}