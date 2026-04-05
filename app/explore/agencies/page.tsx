import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function AgenciesPage() {
  const supabase = await createClient()

  const { data: agencies } = await supabase
    .from('agencies')
    .select('*, reviews(rating)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  const agenciesWithRating = agencies?.map((agency) => {
    const ratings = agency.reviews?.map((r: any) => r.rating) ?? []
    const avg = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0
    return { ...agency, avgRating: avg, reviewCount: ratings.length }
  }) ?? []

  return (
    <main className="px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/explore" className="text-gray-400 hover:text-gray-600">←</Link>
        <h1 className="text-2xl font-bold">Agencies</h1>
      </div>

      <div className="grid gap-3">
        {agenciesWithRating.map((agency) => (
          <Link
            key={agency.id}
            href={`/agencies/${agency.id}`}
            className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold">{agency.name}</p>
                <p className="text-sm text-gray-500 mt-1">{agency.description}</p>
                <p className="text-xs text-gray-400 mt-2">
                  📍 {agency.regions?.join(', ')} · 💰 {agency.price_range}
                </p>
              </div>
              <div className="text-right ml-4 shrink-0">
                <p className="text-lg font-bold">
                  {agency.avgRating > 0 ? agency.avgRating.toFixed(1) : '—'}
                </p>
                <p className="text-xs text-gray-400">
                  {agency.reviewCount} {agency.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}