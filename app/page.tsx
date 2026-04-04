import { supabase } from '@/utils/supabase'
import Link from 'next/link'

export default async function Home() {
  const { data: agencies, error } = await supabase
    .from('agencies')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return <p className="p-10 text-red-500">Error: {error.message}</p>
  }

  if (!agencies || agencies.length === 0) {
    return <p className="p-10 text-gray-500">No agencies found.</p>
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">🏔️ Hiking PH</h1>
      <p className="text-gray-500 mb-8">Find and review hiking agencies in the Philippines.</p>

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