import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function ExplorePage() {
  const supabase = await createClient()

  // Get agency of the week - highest rated approved agency
  const { data: agencies } = await supabase
    .from('agencies')
    .select('*, reviews(rating)')
    .eq('status', 'approved')
    .order('created_at', { ascending: false })

  // Calculate average rating per agency
  const agenciesWithRating = agencies?.map((agency) => {
    const ratings = agency.reviews?.map((r: any) => r.rating) ?? []
    const avg = ratings.length > 0
      ? ratings.reduce((a: number, b: number) => a + b, 0) / ratings.length
      : 0
    return { ...agency, avgRating: avg, reviewCount: ratings.length }
  }) ?? []

  const agencyOfWeek = agenciesWithRating
    .filter((a) => a.reviewCount > 0)
    .sort((a, b) => b.avgRating - a.avgRating)[0]
    ?? agenciesWithRating[0]

  // Get most visited mountains (most conquests)
  const { data: topMountains } = await supabase
    .from('mountains')
    .select('*, conquests(count)')
    .order('elevation', { ascending: false })
    .limit(6)

  return (
    <main className="px-4 py-6">
      <h1 className="text-2xl font-bold mb-6">Explore</h1>

      {/* Agency of the Week */}
      {agencyOfWeek && (
        <section className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Agency of the Week
            </h2>
            <Link href="/explore/agencies" className="text-xs text-gray-400 hover:text-gray-600">
              See all
            </Link>
          </div>
          <Link
            href={`/agencies/${agencyOfWeek.id}`}
            className="block bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{agencyOfWeek.name}</p>
                <p className="text-sm text-gray-500 mt-1">{agencyOfWeek.description}</p>
                <p className="text-sm text-gray-400 mt-2">
                  📍 {agencyOfWeek.regions?.join(', ')}
                </p>
              </div>
              <div className="text-right ml-4">
                <p className="text-2xl font-bold text-gray-900">
                  {agencyOfWeek.avgRating > 0
                    ? agencyOfWeek.avgRating.toFixed(1)
                    : '—'}
                </p>
                <p className="text-xs text-gray-400">
                  {agencyOfWeek.reviewCount} {agencyOfWeek.reviewCount === 1 ? 'review' : 'reviews'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  💰 {agencyOfWeek.price_range}
                </p>
              </div>
            </div>
          </Link>
        </section>
      )}

      {/* All Agencies */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            All Agencies
          </h2>
          <Link href="/explore/agencies" className="text-xs text-gray-400 hover:text-gray-600">
            See all
          </Link>
        </div>
        <div className="grid gap-3">
          {agenciesWithRating.slice(0, 3).map((agency) => (
            <Link
              key={agency.id}
              href={`/agencies/${agency.id}`}
              className="block bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{agency.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {agency.regions?.join(', ')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {agency.avgRating > 0 ? `${agency.avgRating.toFixed(1)} ⭐` : 'No reviews'}
                  </p>
                  <p className="text-xs text-gray-400">{agency.price_range}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mountains Grid */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
            Mountains
          </h2>
          <Link href="/explore/mountains" className="text-xs text-gray-400 hover:text-gray-600">
            See all
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {topMountains?.map((mountain) => (
            <Link
              key={mountain.id}
              href={`/mountains/${mountain.id}`}
              className="bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition text-center"
            >
              <div className="text-3xl mb-1">🏔️</div>
              <p className="text-xs font-semibold leading-tight line-clamp-2">
                {mountain.name}
              </p>
              <p className="text-xs text-gray-400 mt-1">{mountain.elevation}m</p>
            </Link>
          ))}
        </div>
        <Link
          href="/explore/mountains"
          className="block text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
        >
          See all 497 mountains →
        </Link>
      </section>
    </main>
  )
}